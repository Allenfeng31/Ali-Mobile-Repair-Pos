import { describe, expect, it } from 'vitest';
import { getBackoffDelay, MAX_CHAT_POLL_DELAY_MS } from './useAdaptivePoll';

describe('chat polling backoff', () => {
  it('increases independently from the endpoint base delay with bounded jitter', () => {
    expect(getBackoffDelay(9_000, 1, () => 0)).toBe(7_200);
    expect(getBackoffDelay(9_000, 2, () => 0)).toBe(14_400);
    expect(getBackoffDelay(30_000, 8, () => 1)).toBe(MAX_CHAT_POLL_DELAY_MS);
  });

  it('keeps a successful endpoint on its normal interval', () => {
    const normalSessionDelay = 15_000;
    const normalMessageDelay = 9_000;
    const normalUnreadDelay = 30_000;
    expect([normalSessionDelay, normalMessageDelay, normalUnreadDelay]).toEqual([15_000, 9_000, 30_000]);
  });
});
