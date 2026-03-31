import { useState, useEffect, useRef, useCallback } from 'react';
import { MessageSquare, ArrowLeft, Send, RefreshCw, Circle } from 'lucide-react';
import { api } from '@/lib/api';

// ─── Types ────────────────────────────────────────────────────────────────────

interface ChatMessage {
  id: string;
  sender: 'customer' | 'staff';
  content: string;
  created_at: string;
  is_read: boolean;
}

interface ChatSession {
  id: string;
  session_token: string;
  created_at: string;
  last_message_at: string;
  chat_messages: ChatMessage[];
}

const API_BASE = (() => {
  // @ts-ignore
  const env = import.meta.env;
  if (env?.PROD) return '/api';
  return env?.VITE_API_URL || 'http://localhost:3001/api';
})();

// ─── Component ────────────────────────────────────────────────────────────────

export function ChatInbox() {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSession, setActiveSession] = useState<ChatSession | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [reply, setReply] = useState('');
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const scrollToBottom = () =>
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });

  const loadSessions = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/chat/sessions`);
      if (res.ok) setSessions(await res.json());
    } catch (_) {
    } finally {
      setLoading(false);
    }
  }, []);

  const loadMessages = useCallback(async (sessionId: string) => {
    try {
      const res = await fetch(`${API_BASE}/chat/session/id/${sessionId}/messages`);
      if (res.ok) {
        setMessages(await res.json());
        // Refresh sessions to update unread counts
        loadSessions();
      }
    } catch (_) {}
  }, [loadSessions]);

  // Poll sessions list
  useEffect(() => {
    loadSessions();
    pollRef.current = setInterval(loadSessions, 5000);
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [loadSessions]);

  // Poll active conversation
  useEffect(() => {
    if (!activeSession) return;
    loadMessages(activeSession.id);
    const interval = setInterval(() => loadMessages(activeSession.id), 3000);
    return () => clearInterval(interval);
  }, [activeSession, loadMessages]);

  useEffect(() => {
    if (activeSession) scrollToBottom();
  }, [messages, activeSession]);

  const openSession = (session: ChatSession) => {
    setActiveSession(session);
    loadMessages(session.id);
  };

  const sendReply = async () => {
    if (!reply.trim() || !activeSession || sending) return;
    setSending(true);
    const text = reply.trim();
    setReply('');
    try {
      await fetch(`${API_BASE}/chat/session/id/${activeSession.id}/reply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: text }),
      });
      await loadMessages(activeSession.id);
    } catch (_) {}
    setSending(false);
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendReply(); }
  };

  const formatTime = (iso: string) => {
    const d = new Date(iso);
    const now = new Date();
    const isToday = d.toDateString() === now.toDateString();
    return isToday
      ? d.toLocaleTimeString('en-AU', { hour: '2-digit', minute: '2-digit' })
      : d.toLocaleDateString('en-AU', { day: 'numeric', month: 'short' });
  };

  const getUnreadCount = (session: ChatSession) =>
    (session.chat_messages || []).filter(m => m.sender === 'customer' && !m.is_read).length;

  const getLastMessage = (session: ChatSession) => {
    const msgs = session.chat_messages || [];
    // Exclude intro message from last message preview
    const visible = msgs.filter(m => !m.content.startsWith('📋 New customer'));
    return visible[visible.length - 1];
  };

  const getCustomerInfo = (session: ChatSession) => {
    const introMsg = (session.chat_messages || []).find(m => m.content.startsWith('📋 New customer'));
    if (!introMsg) return null;
    const lines = introMsg.content.split('\n');
    const name = lines.find(l => l.startsWith('Name:'))?.replace('Name:', '').trim();
    const phone = lines.find(l => l.startsWith('Phone:'))?.replace('Phone:', '').trim();
    return { name, phone };
  };

  const getSessionLabel = (session: ChatSession, idx: number) => {
    const info = getCustomerInfo(session);
    if (info?.name) return info.name;
    return `Customer #${String(idx + 1).padStart(3, '0')}`;
  };

  const getSessionSubLabel = (session: ChatSession) => {
    const info = getCustomerInfo(session);
    return info?.phone || null;
  };

  // ── Conversation view ──────────────────────────────────────────────────────
  if (activeSession) {
    const sessionIdx = sessions.findIndex(s => s.id === activeSession.id);
    const customerInfo = getCustomerInfo(activeSession);
    const visibleMessages = messages.filter(m => !m.content.startsWith('📋 New customer'));
    return (
      <div className="flex flex-col h-full max-w-3xl mx-auto" style={{ height: 'calc(100vh - 160px)' }}>
        {/* Header */}
        <div className="flex items-center gap-3 mb-4 pb-4 border-b border-outline-variant/10">
          <button
            onClick={() => { setActiveSession(null); setMessages([]); }}
            className="p-2 rounded-xl hover:bg-surface-container-high text-on-surface-variant hover:text-primary transition-all"
          >
            <ArrowLeft size={20} />
          </button>
          <div className="flex-1">
            <h2 className="font-bold text-on-surface">{getSessionLabel(activeSession, sessionIdx)}</h2>
            {customerInfo?.phone && (
              <p className="text-xs text-on-surface-variant">📞 {customerInfo.phone}</p>
            )}
          </div>
          <div className="flex items-center gap-1.5 text-xs text-green-500">
            <Circle size={8} className="fill-green-500" />
            Live
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto space-y-3 px-1 pb-4">
          {visibleMessages.length === 0 && (
            <p className="text-center text-on-surface-variant text-sm mt-10">No messages yet</p>
          )}
          {visibleMessages.map(msg => (
            <div key={msg.id} className={`flex ${msg.sender === 'staff' ? 'justify-end' : 'justify-start'}`}>
              <div style={{
                maxWidth: '70%',
                padding: '0.6rem 0.9rem',
                borderRadius: msg.sender === 'staff' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                background: msg.sender === 'staff'
                  ? 'linear-gradient(135deg, #007aff, #0051ff)'
                  : 'rgba(255,255,255,0.06)',
                color: 'white',
                fontSize: '0.875rem',
                lineHeight: 1.5,
              }}>
                <div style={{ fontSize: '0.65rem', opacity: 0.6, marginBottom: '0.2rem', fontWeight: 600, textTransform: 'uppercase' }}>
                  {msg.sender === 'staff' ? 'You' : 'Customer'}
                </div>
                <div>{msg.content}</div>
                <div style={{ fontSize: '0.65rem', opacity: 0.5, marginTop: '0.25rem', textAlign: 'right' }}>
                  {formatTime(msg.created_at)}
                </div>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Reply box */}
        <div className="flex gap-2 items-end pt-3 border-t border-outline-variant/10">
          <textarea
            rows={2}
            value={reply}
            onChange={e => setReply(e.target.value)}
            onKeyDown={handleKey}
            placeholder="Type your reply... (Enter to send)"
            className="flex-1 bg-surface-container-high rounded-xl px-4 py-3 text-sm text-on-surface placeholder:text-on-surface-variant resize-none outline-none border border-outline-variant/10 focus:border-primary/40 transition-colors"
          />
          <button
            onClick={sendReply}
            disabled={sending || !reply.trim()}
            className="w-11 h-11 rounded-xl flex items-center justify-center transition-all disabled:opacity-40"
            style={{ background: reply.trim() ? 'linear-gradient(135deg, #007aff, #0051ff)' : 'rgba(255,255,255,0.06)' }}
          >
            <Send size={16} color="white" />
          </button>
        </div>
      </div>
    );
  }

  // ── Sessions list ──────────────────────────────────────────────────────────
  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-black text-on-surface tracking-tight">Customer Chats</h1>
          <p className="text-sm text-on-surface-variant mt-1">
            {sessions.length} conversation{sessions.length !== 1 ? 's' : ''}
          </p>
        </div>
        <button
          onClick={loadSessions}
          className="p-2.5 rounded-xl bg-surface-container-high text-on-surface-variant hover:text-primary hover:bg-primary/10 transition-all"
        >
          <RefreshCw size={18} />
        </button>
      </div>

      {loading && (
        <div className="flex items-center justify-center h-40 text-on-surface-variant">
          <RefreshCw size={20} className="animate-spin" />
        </div>
      )}

      {!loading && sessions.length === 0 && (
        <div className="flex flex-col items-center justify-center h-60 text-on-surface-variant gap-3">
          <MessageSquare size={40} strokeWidth={1.5} />
          <p className="text-sm">No customer chats yet</p>
          <p className="text-xs opacity-60">Messages from your website will appear here</p>
        </div>
      )}

      <div className="space-y-2">
        {sessions.map((session, idx) => {
          const unread = getUnreadCount(session);
          const lastMsg = getLastMessage(session);
          return (
            <button
              key={session.id}
              onClick={() => openSession(session)}
              className="w-full text-left p-4 rounded-2xl bg-surface-container-low border border-outline-variant/10 hover:bg-surface-container-high hover:border-primary/20 transition-all group"
            >
              <div className="flex items-center gap-3">
                {/* Avatar */}
                <div className="w-11 h-11 rounded-full flex items-center justify-center text-white text-sm font-black flex-shrink-0"
                  style={{ background: 'linear-gradient(135deg, #007aff, #00c6ff)' }}>
                  C
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className={`text-sm font-bold ${unread > 0 ? 'text-primary' : 'text-on-surface'}`}>
                      {getSessionLabel(session, idx)}
                    </span>
                    <span className="text-xs text-on-surface-variant">
                      {lastMsg ? formatTime(lastMsg.created_at) : formatTime(session.created_at)}
                    </span>
                  </div>
                  {getSessionSubLabel(session) && (
                    <p className="text-[11px] text-on-surface-variant/70">📞 {getSessionSubLabel(session)}</p>
                  )}
                  <div className="flex items-center gap-2 mt-0.5">
                    <p className="text-xs text-on-surface-variant truncate flex-1">
                      {lastMsg
                        ? `${lastMsg.sender === 'staff' ? 'You: ' : ''}${lastMsg.content}`
                        : 'No messages yet'}
                    </p>
                    {unread > 0 && (
                      <span className="flex-shrink-0 w-5 h-5 rounded-full bg-primary text-white text-[10px] font-black flex items-center justify-center">
                        {unread}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
