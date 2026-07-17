import { useEffect, useRef } from 'react';

type AuthClient = {
  auth: {
    getSession: () => Promise<{ data: { session: { user: any } | null }; error: any }>;
    onAuthStateChange: (callback: (event: string, session: { user: any } | null) => void) => { data: { subscription: { unsubscribe: () => void } } };
  };
};

export function usePosAuthLifecycle(client: AuthClient, handlers: {
  authenticated: (user: any) => void;
  signedOut: () => void;
  restorationFailure: (cachedUser: any | null) => void;
  ready: () => void;
}) {
  const handlersRef = useRef(handlers);
  handlersRef.current = handlers;

  useEffect(() => {
    let active = true;
    const initialize = async () => {
      const { data, error } = await client.auth.getSession();
      if (!active) return;
      if (data.session?.user) handlersRef.current.authenticated(data.session.user);
      else if (!error) handlersRef.current.signedOut();
      else {
        let cachedUser = null;
        try {
          const cached = JSON.parse(localStorage.getItem('pos_session') || 'null');
          if (cached?.user && cached.expiresAt > Date.now()) cachedUser = cached.user;
        } catch { /* malformed cache is not trusted */ }
        handlersRef.current.restorationFailure(cachedUser);
      }
      handlersRef.current.ready();
    };
    void initialize();
    const { data: listener } = client.auth.onAuthStateChange((event, session) => {
      if (!active) return;
      if (event === 'SIGNED_OUT') handlersRef.current.signedOut();
      else if (session?.user) handlersRef.current.authenticated(session.user);
    });
    return () => { active = false; listener.subscription.unsubscribe(); };
  }, [client]);
}
