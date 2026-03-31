'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const SESSION_KEY = 'ali_chat_token';
const SESSION_EXPIRY_KEY = 'ali_chat_token_expiry';
const CUSTOMER_NAME_KEY = 'ali_chat_name';
const CUSTOMER_PHONE_KEY = 'ali_chat_phone';
const CUSTOMER_INTRO_SENT_KEY = 'ali_chat_intro_sent';
const INTRO_PREFIX = '[CUSTOMER_INFO]'; // plain text prefix - no emoji encoding issues
const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;
const POLL_INTERVAL_MS = 3000;

function getApiBase() {
  return '/api';
}

function getChatToken(): string {
  const existing = localStorage.getItem(SESSION_KEY);
  const expiry = localStorage.getItem(SESSION_EXPIRY_KEY);
  if (existing && expiry && Date.now() < parseInt(expiry, 10)) {
    return existing;
  }
  const token = crypto.randomUUID();
  localStorage.setItem(SESSION_KEY, token);
  localStorage.setItem(SESSION_EXPIRY_KEY, String(Date.now() + SEVEN_DAYS_MS));
  // Reset intro flag for new token
  localStorage.removeItem(CUSTOMER_INTRO_SENT_KEY);
  return token;
}

interface Message {
  id: string;
  sender: 'customer' | 'staff';
  content: string;
  created_at: string;
}

// ─── Main Widget ──────────────────────────────────────────────────────────────

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const [hasUnread, setHasUnread] = useState(false);

  // "Intro" step: collect name & phone before chat
  const [step, setStep] = useState<'intro' | 'chat'>('chat');
  const [nameInput, setNameInput] = useState('');
  const [phoneInput, setPhoneInput] = useState('');
  const [introError, setIntroError] = useState('');

  const tokenRef = useRef('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Initialise: check if we need name/phone step
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const token = getChatToken();
    tokenRef.current = token;

    const savedName = localStorage.getItem(CUSTOMER_NAME_KEY);
    const savedPhone = localStorage.getItem(CUSTOMER_PHONE_KEY);
    const introSent = localStorage.getItem(CUSTOMER_INTRO_SENT_KEY);

    if (savedName && savedPhone && introSent) {
      setStep('chat');
    } else {
      setStep('intro');
    }

    // Create/recover session
    fetch(`${getApiBase()}/chat/session`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token }),
    })
      .then(() => setInitialized(true))
      .catch(() => setInitialized(true));
  }, []);

  const scrollToBottom = () =>
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });

  const fetchMessages = useCallback(async () => {
    const token = tokenRef.current;
    if (!token) return;
    try {
      const res = await fetch(`${getApiBase()}/chat/session/${token}/messages`);
      if (!res.ok) return;
      const data: Message[] = await res.json();
      setMessages(data);
      const lastMsg = data[data.length - 1];
      if (lastMsg?.sender === 'staff' && !isOpen) {
        setHasUnread(true);
      }
    } catch (_) {}
  }, [isOpen]);

  useEffect(() => {
    if (!initialized) return;
    fetchMessages();
    pollRef.current = setInterval(fetchMessages, POLL_INTERVAL_MS);
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [initialized, fetchMessages]);

  useEffect(() => {
    if (isOpen) scrollToBottom();
  }, [messages, isOpen]);

  useEffect(() => {
    if (isOpen) setHasUnread(false);
  }, [isOpen]);

  // ── Intro submit ──────────────────────────────────────────────────────────
  const submitIntro = async () => {
    const name = nameInput.trim();
    const phone = phoneInput.trim();

    if (!name) { setIntroError('Please enter your name.'); return; }
    if (!phone) { setIntroError('Please enter your phone number.'); return; }
    if (!/^[\d\s\+\-\(\)]{6,20}$/.test(phone)) {
      setIntroError('Please enter a valid phone number.');
      return;
    }

    setIntroError('');

    // Save locally
    localStorage.setItem(CUSTOMER_NAME_KEY, name);
    localStorage.setItem(CUSTOMER_PHONE_KEY, phone);

    // Send an intro message to the backend so staff can see who the customer is
    const token = tokenRef.current;
    if (token) {
      // Use plain text prefix to avoid emoji encoding issues across environments
      const introContent = `${INTRO_PREFIX}\nName: ${name}\nPhone: ${phone}`;
      await fetch(`${getApiBase()}/chat/session/${token}/message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: introContent }),
      }).catch(() => {});
      localStorage.setItem(CUSTOMER_INTRO_SENT_KEY, '1');
      await fetchMessages();
    }

    setStep('chat');
  };

  // ── Send message ──────────────────────────────────────────────────────────
  const sendMessage = async () => {
    const text = input.trim();
    if (!text || sending || !tokenRef.current) return;
    // Clear input immediately (before async ops) so UI feels instant
    setInput('');
    setSending(true);
    try {
      await fetch(`${getApiBase()}/chat/session/${tokenRef.current}/message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: text }),
      });
      await fetchMessages();
    } catch (_) {}
    setSending(false);
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  const formatTime = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleTimeString('en-AU', { hour: '2-digit', minute: '2-digit' });
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <>
      {/* Floating button */}
      <button
        id="chat-widget-toggle"
        onClick={() => setIsOpen(v => !v)}
        aria-label="Chat with us"
        style={{
          position: 'fixed', bottom: '1.5rem', right: '1.5rem',
          width: '56px', height: '56px', borderRadius: '50%',
          background: 'linear-gradient(135deg, #007aff, #00c6ff)',
          border: 'none', cursor: 'pointer',
          boxShadow: '0 4px 20px rgba(0,122,255,0.5)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 9999, transition: 'transform 0.2s ease',
        }}
        onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.1)')}
        onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
      >
        {hasUnread && (
          <span style={{
            position: 'absolute', top: '4px', right: '4px',
            width: '12px', height: '12px', borderRadius: '50%',
            background: '#ff3b30', border: '2px solid white',
          }} />
        )}
        {isOpen ? (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        ) : (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
          </svg>
        )}
      </button>

      {/* Chat window */}
      {isOpen && (
        <div
          id="chat-widget-window"
          style={{
            position: 'fixed', bottom: '5rem', right: '1.5rem',
            width: 'min(360px, calc(100vw - 2rem))',
            height: '480px', borderRadius: '20px',
            background: 'var(--secondary, #1c1c1e)',
            border: '1px solid rgba(255,255,255,0.1)',
            boxShadow: '0 20px 60px rgba(0,0,0,0.4)',
            display: 'flex', flexDirection: 'column',
            overflow: 'hidden', zIndex: 9998,
            animation: 'chatSlideIn 0.25s ease',
            fontFamily: '"Inter", "Helvetica Neue", Arial, sans-serif',
          }}
        >
          {/* Header */}
          <div style={{
            background: 'linear-gradient(135deg, #007aff, #00c6ff)',
            padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', gap: '0.75rem',
          }}>
            <div style={{
              width: '36px', height: '36px', borderRadius: '50%',
              background: 'rgba(255,255,255,0.25)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
              </svg>
            </div>
            <div>
              <div style={{ color: 'white', fontWeight: 700, fontSize: '0.95rem' }}>Ali Mobile Repair</div>
              <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.75rem' }}>
                {step === 'intro' ? 'Please introduce yourself first' : 'We typically reply within a few minutes'}
              </div>
            </div>
          </div>

          {/* ── Intro Step ────────────────────────────────────────────── */}
          {step === 'intro' ? (
            <div style={{ flex: 1, padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <p style={{ color: 'white', fontSize: '0.875rem', opacity: 0.85 }}>
                👋 Before we begin, please tell us your name and phone number so we can assist you better.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div>
                  <label style={{ display: 'block', color: 'rgba(255,255,255,0.6)', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.4rem' }}>
                    Your Name
                  </label>
                  <input
                    id="chat-name-input"
                    type="text"
                    value={nameInput}
                    onChange={e => setNameInput(e.target.value)}
                    placeholder="e.g. John Smith"
                    style={{
                      width: '100%', padding: '0.7rem 0.9rem',
                      borderRadius: '10px',
                      background: 'rgba(255,255,255,0.09)',
                      border: '1px solid rgba(255,255,255,0.15)',
                      color: '#000000',
                      fontSize: '0.9rem',
                      fontFamily: '"Inter", "Helvetica Neue", Arial, sans-serif',
                      outline: 'none',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', color: 'rgba(255,255,255,0.6)', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.4rem' }}>
                    Phone Number
                  </label>
                  <input
                    id="chat-phone-input"
                    type="tel"
                    value={phoneInput}
                    onChange={e => setPhoneInput(e.target.value)}
                    placeholder="e.g. 0412 345 678"
                    onKeyDown={e => { if (e.key === 'Enter') submitIntro(); }}
                    style={{
                      width: '100%', padding: '0.7rem 0.9rem',
                      borderRadius: '10px',
                      background: 'rgba(255,255,255,0.09)',
                      border: '1px solid rgba(255,255,255,0.15)',
                      color: '#000000',
                      fontSize: '0.9rem',
                      fontFamily: '"Inter", "Helvetica Neue", Arial, sans-serif',
                      outline: 'none',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>

                {introError && (
                  <p style={{ color: '#ff6b6b', fontSize: '0.8rem', margin: 0 }}>{introError}</p>
                )}

                <button
                  id="chat-start-btn"
                  onClick={submitIntro}
                  style={{
                    width: '100%', padding: '0.85rem',
                    borderRadius: '12px', border: 'none', cursor: 'pointer',
                    background: 'linear-gradient(135deg, #007aff, #00c6ff)',
                    color: 'white', fontWeight: 700, fontSize: '0.9rem',
                    marginTop: '0.25rem',
                  }}
                >
                  Start Chat →
                </button>
              </div>
            </div>
          ) : (
            /* ── Chat Step ─────────────────────────────────────────────── */
            <>
              {/* Messages */}
              <div style={{
                flex: 1, overflowY: 'auto',
                padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.6rem',
              }}>
                {messages.filter(m => !m.content.startsWith(INTRO_PREFIX)).length === 0 && (
                  <div style={{ textAlign: 'center', opacity: 0.5, fontSize: '0.85rem', marginTop: '2rem', padding: '0 1rem' }}>
                    How can we help you today?
                  </div>
                )}
                {messages
                  .filter(m => !m.content.startsWith(INTRO_PREFIX))
                  .map(msg => (
                    <div key={msg.id} style={{ display: 'flex', justifyContent: msg.sender === 'customer' ? 'flex-end' : 'flex-start' }}>
                      <div style={{
                        maxWidth: '75%', padding: '0.6rem 0.9rem',
                        borderRadius: msg.sender === 'customer' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                        background: msg.sender === 'customer'
                          ? 'linear-gradient(135deg, #007aff, #00c6ff)'
                          : 'rgba(255,255,255,0.08)',
                        color: 'white', fontSize: '0.875rem', lineHeight: 1.5,
                      }}>
                        <div>{msg.content}</div>
                        <div style={{ fontSize: '0.65rem', opacity: 0.6, marginTop: '0.25rem', textAlign: 'right' }}>
                          {formatTime(msg.created_at)}
                        </div>
                      </div>
                    </div>
                  ))}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div style={{
                padding: '0.75rem 1rem',
                borderTop: '1px solid rgba(255,255,255,0.08)',
                display: 'flex', gap: '0.5rem', alignItems: 'flex-end',
              }}>
                <textarea
                  id="chat-input"
                  rows={1}
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={handleKey}
                  placeholder="Type a message..."
                  style={{
                    flex: 1,
                    background: 'rgba(255,255,255,0.92)',
                    border: '1px solid rgba(255,255,255,0.2)',
                    borderRadius: '12px',
                    color: '#111111',
                    padding: '0.6rem 0.8rem',
                    fontSize: '0.875rem',
                    resize: 'none',
                    outline: 'none',
                    fontFamily: '"Inter", "Helvetica Neue", Arial, sans-serif',
                    maxHeight: '100px',
                    overflowY: 'auto',
                  }}
                />
                <button
                  id="chat-send-btn"
                  onClick={sendMessage}
                  disabled={sending || !input.trim()}
                  style={{
                    width: '40px', height: '40px', borderRadius: '50%',
                    background: input.trim() ? 'linear-gradient(135deg, #007aff, #00c6ff)' : 'rgba(255,255,255,0.1)',
                    border: 'none', cursor: input.trim() ? 'pointer' : 'not-allowed',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'background 0.2s ease', flexShrink: 0,
                  }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
                    <path d="M2 21l21-9L2 3v7l15 2-15 2z"/>
                  </svg>
                </button>
              </div>
            </>
          )}
        </div>
      )}

      <style>{`
        @keyframes chatSlideIn {
          from { opacity: 0; transform: translateY(12px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        #chat-name-input::placeholder,
        #chat-phone-input::placeholder { color: rgba(0,0,0,0.4); }
        #chat-input::placeholder { color: rgba(0,0,0,0.4); }
      `}</style>
    </>
  );
}
