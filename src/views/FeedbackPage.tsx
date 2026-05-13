import { useState, useEffect } from 'react';

/**
 * Feedback Buffer Page
 * 
 * Public-facing page accessed via QR code on receipts.
 * Routes satisfied customers → Google Review, intercepts unhappy ones.
 * 
 * URL: /feedback?id=ORDER_ID
 */

// ── Replace this with your actual Google Review link ──
const GOOGLE_REVIEW_LINK = "https://g.page/r/CRGwjUq_bZMbEBM/review";

export function FeedbackPage() {
  const [orderId, setOrderId] = useState<string | null>(null);
  const [view, setView] = useState<'ask' | 'negative' | 'submitted'>('ask');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setOrderId(params.get('id'));
  }, []);

  const handlePositive = () => {
    window.location.href = GOOGLE_REVIEW_LINK;
  };

  const handleNegative = () => {
    setView('negative');
  };

  const handleSubmitFeedback = (e: React.FormEvent) => {
    e.preventDefault();
    // In a future iteration, this could POST to Supabase or an API
    console.log('[Feedback] Order:', orderId, 'Message:', message);
    setView('submitted');
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)',
        color: '#f8fafc',
      }}
    >
      <div
        style={{
          maxWidth: '480px',
          width: '100%',
          background: 'rgba(30, 41, 59, 0.8)',
          backdropFilter: 'blur(16px)',
          borderRadius: '24px',
          border: '1px solid rgba(148, 163, 184, 0.1)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '32px 24px 24px',
            textAlign: 'center',
            borderBottom: '1px solid rgba(148, 163, 184, 0.1)',
          }}
        >
          <div style={{ fontSize: '32px', marginBottom: '8px' }}>
            {view === 'ask' ? '💬' : view === 'negative' ? '🙏' : '✅'}
          </div>
          <h1
            style={{
              fontSize: '22px',
              fontWeight: 800,
              letterSpacing: '-0.02em',
              margin: '0 0 4px',
              color: '#f1f5f9',
            }}
          >
            ALI MOBILE REPAIRS
          </h1>
          {orderId && (
            <p
              style={{
                fontSize: '12px',
                color: '#64748b',
                margin: 0,
                fontWeight: 600,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
              }}
            >
              Order #{orderId}
            </p>
          )}
        </div>

        {/* Body */}
        <div style={{ padding: '32px 24px' }}>
          {/* ── Initial Question ── */}
          {view === 'ask' && (
            <div style={{ textAlign: 'center' }}>
              <h2
                style={{
                  fontSize: '20px',
                  fontWeight: 700,
                  margin: '0 0 8px',
                  color: '#e2e8f0',
                }}
              >
                Were you satisfied with your repair today?
              </h2>
              <p
                style={{
                  fontSize: '14px',
                  color: '#94a3b8',
                  margin: '0 0 32px',
                  lineHeight: 1.5,
                }}
              >
                Your feedback helps us improve our service.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <button
                  onClick={handlePositive}
                  style={{
                    padding: '16px 24px',
                    fontSize: '16px',
                    fontWeight: 700,
                    border: 'none',
                    borderRadius: '16px',
                    cursor: 'pointer',
                    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                    color: 'white',
                    boxShadow: '0 4px 15px rgba(16, 185, 129, 0.3)',
                    transition: 'transform 0.2s, box-shadow 0.2s',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '10px',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 8px 25px rgba(16, 185, 129, 0.4)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 4px 15px rgba(16, 185, 129, 0.3)';
                  }}
                >
                  <span style={{ fontSize: '24px' }}>😊</span>
                  Yes, I love it!
                </button>

                <button
                  onClick={handleNegative}
                  style={{
                    padding: '16px 24px',
                    fontSize: '16px',
                    fontWeight: 700,
                    border: '2px solid rgba(239, 68, 68, 0.3)',
                    borderRadius: '16px',
                    cursor: 'pointer',
                    background: 'rgba(239, 68, 68, 0.1)',
                    color: '#fca5a5',
                    transition: 'transform 0.2s, background 0.2s',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '10px',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)';
                  }}
                >
                  <span style={{ fontSize: '24px' }}>😞</span>
                  No, I had an issue
                </button>
              </div>
            </div>
          )}

          {/* ── Negative Feedback Form ── */}
          {view === 'negative' && (
            <div>
              <h2
                style={{
                  fontSize: '18px',
                  fontWeight: 700,
                  margin: '0 0 8px',
                  color: '#e2e8f0',
                  textAlign: 'center',
                }}
              >
                We're sorry to hear that!
              </h2>
              <p
                style={{
                  fontSize: '14px',
                  color: '#94a3b8',
                  margin: '0 0 24px',
                  lineHeight: 1.5,
                  textAlign: 'center',
                }}
              >
                Please tell us what went wrong so our manager can look into it and make things right.
              </p>

              <form onSubmit={handleSubmitFeedback}>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Describe your experience..."
                  required
                  style={{
                    width: '100%',
                    minHeight: '120px',
                    padding: '16px',
                    fontSize: '15px',
                    lineHeight: 1.6,
                    border: '2px solid rgba(148, 163, 184, 0.15)',
                    borderRadius: '16px',
                    background: 'rgba(15, 23, 42, 0.6)',
                    color: '#e2e8f0',
                    resize: 'vertical',
                    outline: 'none',
                    fontFamily: 'inherit',
                    boxSizing: 'border-box',
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(99, 102, 241, 0.5)';
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(148, 163, 184, 0.15)';
                  }}
                />
                <button
                  type="submit"
                  disabled={!message.trim()}
                  style={{
                    width: '100%',
                    padding: '16px',
                    marginTop: '16px',
                    fontSize: '15px',
                    fontWeight: 700,
                    border: 'none',
                    borderRadius: '16px',
                    cursor: message.trim() ? 'pointer' : 'not-allowed',
                    background: message.trim()
                      ? 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)'
                      : 'rgba(100, 116, 139, 0.3)',
                    color: message.trim() ? 'white' : '#64748b',
                    boxShadow: message.trim() ? '0 4px 15px rgba(99, 102, 241, 0.3)' : 'none',
                    transition: 'all 0.2s',
                  }}
                >
                  Send Feedback
                </button>
              </form>
            </div>
          )}

          {/* ── Submitted Confirmation ── */}
          {view === 'submitted' && (
            <div style={{ textAlign: 'center' }}>
              <h2
                style={{
                  fontSize: '20px',
                  fontWeight: 700,
                  margin: '0 0 12px',
                  color: '#e2e8f0',
                }}
              >
                Thank you for your feedback!
              </h2>
              <p
                style={{
                  fontSize: '14px',
                  color: '#94a3b8',
                  margin: '0 0 24px',
                  lineHeight: 1.6,
                }}
              >
                Our manager will review your message and get back to you as soon as possible.
                We truly appreciate you taking the time to help us improve.
              </p>
              <div
                style={{
                  padding: '16px',
                  borderRadius: '12px',
                  background: 'rgba(16, 185, 129, 0.1)',
                  border: '1px solid rgba(16, 185, 129, 0.2)',
                  fontSize: '13px',
                  color: '#6ee7b7',
                  fontWeight: 600,
                }}
              >
                📞 If urgent, call us at 0481 058 514
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          style={{
            padding: '16px 24px',
            textAlign: 'center',
            borderTop: '1px solid rgba(148, 163, 184, 0.08)',
          }}
        >
          <p
            style={{
              fontSize: '11px',
              color: '#475569',
              margin: 0,
              fontWeight: 500,
            }}
          >
            Ali Mobile Repairs · Kiosk C1, Ringwood Square Shopping Centre
          </p>
        </div>
      </div>
    </div>
  );
}
