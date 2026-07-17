import { useEffect, useRef } from 'react';

export type PollOutcome = 'success' | 'retry' | 'stop';
export const MAX_CHAT_POLL_DELAY_MS = 60_000;

export function getBackoffDelay(baseDelayMs: number, failures: number, random = Math.random) {
  const capped = Math.min(MAX_CHAT_POLL_DELAY_MS, baseDelayMs * 2 ** Math.max(0, failures - 1));
  return Math.min(MAX_CHAT_POLL_DELAY_MS, Math.round(capped * (0.8 + random() * 0.4)));
}

export function useAdaptivePoll(task: () => Promise<PollOutcome>, baseDelayMs: number, enabled = true) {
  const taskRef = useRef(task);
  useEffect(() => { taskRef.current = task; }, [task]);

  useEffect(() => {
    if (!enabled) return;
    let disposed = false;
    let inFlight = false;
    let failures = 0;
    let timer: ReturnType<typeof setTimeout> | null = null;

    const clearTimer = () => {
      if (timer) clearTimeout(timer);
      timer = null;
    };
    const schedule = (delay: number) => {
      clearTimer();
      timer = setTimeout(run, delay);
    };
    const run = async () => {
      if (disposed || inFlight || document.hidden) return;
      inFlight = true;
      let outcome: PollOutcome = 'retry';
      try { outcome = await taskRef.current(); } catch { outcome = 'retry'; }
      finally { inFlight = false; }
      if (disposed || outcome === 'stop') return;
      failures = outcome === 'success' ? 0 : failures + 1;
      schedule(outcome === 'success' ? baseDelayMs : getBackoffDelay(baseDelayMs, failures));
    };
    const onVisibilityChange = () => {
      if (!document.hidden) {
        clearTimer();
        void run();
      }
    };

    void run();
    document.addEventListener('visibilitychange', onVisibilityChange);
    return () => {
      disposed = true;
      clearTimer();
      document.removeEventListener('visibilitychange', onVisibilityChange);
    };
  }, [baseDelayMs, enabled]);
}
