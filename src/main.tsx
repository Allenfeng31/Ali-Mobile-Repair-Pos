import { StrictMode, Component, ErrorInfo, ReactNode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import { PortalView } from './views/Portal';
import { FeedbackPage } from './views/FeedbackPage';
import './index.css';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '2rem', color: 'red', fontFamily: 'monospace', position: 'fixed', inset: 0, zIndex: 9999, background: 'white' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>页面发生了崩溃！这是内部报错，请复制发给AI助手：</h2>
          <p style={{ marginTop: '1rem', fontWeight: 'bold' }}>{this.state.error?.toString()}</p>
          <pre style={{ background: '#fee', padding: '1rem', overflow: 'auto', marginTop: '1rem', whiteSpace: 'pre-wrap' }}>
            {this.state.error?.stack}
          </pre>
          <button onClick={() => window.location.reload()} style={{ padding: '0.5rem 1rem', marginTop: '1rem', border: '1px solid currentColor', borderRadius: '4px' }}>
            刷新页面重试
          </button>
        </div>
      );
    }

    return (this as any).props.children;
  }
}

const rootElement = document.getElementById('root')!;
const pathname = window.location.pathname;

if (pathname === '/portal') {
  createRoot(rootElement).render(
    <StrictMode>
      <ErrorBoundary>
        <PortalView />
      </ErrorBoundary>
    </StrictMode>
  );
} else if (pathname === '/feedback') {
  createRoot(rootElement).render(
    <StrictMode>
      <ErrorBoundary>
        <FeedbackPage />
      </ErrorBoundary>
    </StrictMode>
  );
} else {
  createRoot(rootElement).render(
    <StrictMode>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </StrictMode>
  );
}

// ── Service Worker Registration (PWA Push Notifications) ─────────────
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      .then((registration) => {
        console.log('✅ [SW] Service Worker registered:', registration.scope);
      })
      .catch((error) => {
        console.warn('⚠️ [SW] Service Worker registration failed:', error);
      });
  });
}

