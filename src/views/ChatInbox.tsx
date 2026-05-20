import { useState, useEffect, useRef, useCallback } from 'react';
import { MessageSquare, ArrowLeft, Send, RefreshCw, Circle, Trash2, Smartphone, User, Calendar } from 'lucide-react';
import { api } from '@/lib/api';
import { useAuthStore } from '../hooks/useAuthStore';
import { cn } from '@/lib/utils';
import { getApiBaseUrl } from '@/lib/apiBase';

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

const API_BASE = getApiBaseUrl();

const INTRO_PREFIX = '[CUSTOMER_INFO]';
const BOOKING_PREFIX = '[BOOKING_DATA]';

/**
 * Strips metadata from customer intro messages to reveal the actual feedback/message.
 */
const cleanMessageContent = (content: string) => {
  if (!content.startsWith(INTRO_PREFIX)) return content;
  return content
    .split('\n')
    .filter(line =>
      !line.startsWith(INTRO_PREFIX) &&
      !line.startsWith('Name:') &&
      !line.startsWith('Phone:')
    )
    .join('\n')
    .trim();
};

// ─── Component ────────────────────────────────────────────────────────────────

export function ChatInbox() {
  const { permissions } = useAuthStore();
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSession, setActiveSession] = useState<ChatSession | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [reply, setReply] = useState('');
  const [sending, setSending] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [apptStatusCache, setApptStatusCache] = useState<Record<string, string>>({});
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

  const fetchBookingStatuses = useCallback(async (ids: string[]) => {
    for (const id of ids) {
      if (apptStatusCache[id]) continue;
      try {
        const res = await fetch(`${API_BASE}/appointments/${id}`);
        if (res.ok) {
          const data = await res.json();
          setApptStatusCache(prev => ({ ...prev, [id]: data.status }));
        }
      } catch (_) { }
    }
  }, [apptStatusCache]);

  const loadMessages = useCallback(async (sessionId: string) => {
    try {
      const res = await fetch(`${API_BASE}/chat/session/id/${sessionId}/messages`);
      if (res.ok) {
        const data = await res.json();
        setMessages(data);

        try {
          if ('clearAppBadge' in navigator) {
            (navigator as any).clearAppBadge().catch(() => { });
          }
        } catch (_) { }

        if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
          navigator.serviceWorker.controller.postMessage({ type: 'CLEAR_BADGE' });
        }

        const bookingIds = data
          .filter((m: any) => m.content.startsWith(BOOKING_PREFIX))
          .map((m: any) => {
            try { return JSON.parse(m.content.replace(BOOKING_PREFIX, '').trim()).appointmentId; }
            catch { return null; }
          })
          .filter(Boolean);

        if (bookingIds.length > 0) {
          fetchBookingStatuses(bookingIds);
        }

        loadSessions();
      }
    } catch (_) { }
  }, [loadSessions, fetchBookingStatuses]);

  useEffect(() => {
    loadSessions();
    pollRef.current = setInterval(loadSessions, 5000);
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [loadSessions]);

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
    } catch (_) { }
    setSending(false);
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendReply(); }
  };

  const deleteSession = async () => {
    if (!activeSession) return;
    const confirmed = window.confirm('Delete this conversation? This cannot be undone.');
    if (!confirmed) return;
    setDeleting(true);
    try {
      await fetch(`${API_BASE}/chat/session/id/${activeSession.id}`, { method: 'DELETE' });
      setSessions(prev => prev.filter(s => s.id !== activeSession.id));
      setActiveSession(null);
      setMessages([]);
    } catch (_) { }
    setDeleting(false);
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
    const visible = msgs.filter(m => {
      if (m.content.startsWith(BOOKING_PREFIX)) return false;
      if (m.content.startsWith(INTRO_PREFIX)) return cleanMessageContent(m.content) !== '';
      return true;
    });

    if (visible.length > 0) {
      const msg = visible[visible.length - 1];
      const cleaned = cleanMessageContent(msg.content);
      return { ...msg, content: cleaned.substring(0, 60) + (cleaned.length > 60 ? '...' : '') };
    }
    const booking = msgs.find(m => m.content.startsWith(BOOKING_PREFIX));
    if (booking) return { ...booking, content: '📅 New Booking Request' };
    return msgs[msgs.length - 1];
  };

  const getBookingInfo = (session: ChatSession) => {
    const bookingMsg = (session.chat_messages || []).find(m => m.content.startsWith(BOOKING_PREFIX));
    if (!bookingMsg) return null;
    try { return JSON.parse(bookingMsg.content.replace(BOOKING_PREFIX, '').trim()); }
    catch (_) { return null; }
  };

  const getCustomerInfo = (session: ChatSession) => {
    const introMsg = (session.chat_messages || []).find(m => m.content.startsWith(INTRO_PREFIX));
    if (!introMsg) return null;
    const lines = introMsg.content.split('\n');
    const name = lines.find(l => l.startsWith('Name:'))?.replace('Name:', '').trim();
    const phone = lines.find(l => l.startsWith('Phone:'))?.replace('Phone:', '').trim();
    return { name, phone };
  };

  const getSessionLabel = (session: ChatSession, idx: number) => {
    const info = getCustomerInfo(session);
    if (info?.name) return info.name;
    const bInfo = getBookingInfo(session);
    if (bInfo?.name) return bInfo.name;
    return `Customer #${String(idx + 1).padStart(3, '0')}`;
  };

  const getSessionSubLabel = (session: ChatSession) => {
    const info = getCustomerInfo(session);
    if (info?.phone) return info.phone;
    const bInfo = getBookingInfo(session);
    return bInfo?.phone || null;
  };

  // ── Conversation view ──────────────────────────────────────────────────────
  if (activeSession) {
    const sessionIdx = sessions.findIndex(s => s.id === activeSession.id);
    const customerInfo = getCustomerInfo(activeSession);
    const visibleMessages = messages.filter(m => {
      if (m.content.startsWith(INTRO_PREFIX)) {
        return cleanMessageContent(m.content) !== '';
      }
      return true;
    });

    const handleStatusUpdate = async (apptId: string, status: 'confirmed' | 'declined') => {
      try {
        const res = await fetch(`${API_BASE}/appointments/${apptId}/status`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status }),
        });
        if (res.ok) {
          setApptStatusCache(prev => ({ ...prev, [apptId]: status }));
          loadMessages(activeSession.id);
        }
      } catch (_) {
        alert('Failed to update status');
      }
    };

    return (
      <div className="flex flex-col h-full max-w-4xl mx-auto px-4" style={{ height: 'calc(100vh - 120px)' }}>
        {/* NEUMORPHIC HEADER */}
        <div className="flex items-center gap-6 mb-8 p-6 bg-[var(--color-neu-bg)] shadow-[var(--shadow-neu-flat)] rounded-[2.5rem] border border-white/20">
          <button
            onClick={() => { setActiveSession(null); setMessages([]); }}
            className="w-12 h-12 bg-[var(--color-neu-bg)] shadow-[var(--shadow-neu-flat)] rounded-2xl flex items-center justify-center text-gray-500 active:shadow-[var(--shadow-neu-pressed)] active:scale-95 transition-all border border-white/10"
          >
            <ArrowLeft size={22} strokeWidth={3} />
          </button>
          <div className="flex-1">
            <h2 className="text-xl font-black text-black tracking-tight leading-none">{getSessionLabel(activeSession, sessionIdx)}</h2>
            {customerInfo?.phone && (
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-2">Mobile: {customerInfo.phone}</p>
            )}
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-green-50 rounded-full shadow-[var(--shadow-neu-sm)] border border-green-100">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-[10px] font-black text-green-600 uppercase tracking-widest">Active Link</span>
          </div>
          {permissions?.can_delete_chats !== false && (
            <button
              onClick={deleteSession}
              disabled={deleting}
              className="w-12 h-12 bg-[var(--color-neu-bg)] shadow-[var(--shadow-neu-flat)] rounded-2xl flex items-center justify-center text-red-400 active:shadow-[var(--shadow-neu-pressed)] active:scale-95 transition-all border border-white/10 disabled:opacity-40"
            >
              <Trash2 size={20} strokeWidth={3} />
            </button>
          )}
        </div>

        {/* MESSAGES AREA */}
        <div className="flex-1 overflow-y-auto space-y-6 px-2 pb-8 custom-scrollbar">
          {visibleMessages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full opacity-40">
              <MessageSquare size={48} strokeWidth={1} className="text-gray-300 mb-4" />
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Awaiting First Transmission</p>
            </div>
          )}
          {visibleMessages.map(msg => (
            <div key={msg.id} className={cn("flex w-full", msg.sender === 'staff' ? 'justify-end' : 'justify-start')}>
              <div className={cn(
                "max-w-[80%] p-6 rounded-[2rem] border border-white/10 transition-all",
                msg.sender === 'staff'
                  ? "bg-blue-50 shadow-[var(--shadow-neu-flat)] rounded-tr-md"
                  : "bg-green-50 shadow-[var(--shadow-neu-flat)] rounded-tl-md"
              )}>
                <div className="flex items-center justify-between mb-3">
                  <span className={cn(
                    "text-[8px] font-black uppercase tracking-widest",
                    msg.sender === 'staff' ? "text-blue-600" : "text-green-600"
                  )}>
                    {msg.sender === 'staff' ? 'Support Lead' : 'Client User'}
                  </span>
                  <span className="text-[8px] font-black text-gray-400">
                    {formatTime(msg.created_at)}
                  </span>
                </div>

                <div className="text-sm font-bold text-black leading-relaxed whitespace-pre-wrap">
                  {msg.content.includes(BOOKING_PREFIX) ? (() => {
                    try {
                      const startIndex = msg.content.indexOf('{');
                      const endIndex = msg.content.lastIndexOf('}');
                      const data = JSON.parse(msg.content.substring(startIndex, endIndex + 1));
                      return (
                        <div className="bg-white/40 shadow-[var(--shadow-neu-pressed)] rounded-3xl p-6 mt-2 space-y-4 border border-black/5">
                          <div className="flex items-center gap-3 text-blue-600">
                            <Calendar size={18} strokeWidth={3} />
                            <h4 className="text-[10px] font-black uppercase tracking-widest">Inbound Booking Data</h4>
                          </div>
                          <div className="grid grid-cols-1 gap-2 text-xs">
                            <p className="flex justify-between border-b border-black/5 pb-1"><span className="text-gray-500">Device:</span> <span className="text-black font-black">{data.device}</span></p>
                            <p className="flex justify-between border-b border-black/5 pb-1"><span className="text-gray-500">Service:</span> <span className="text-black font-black">{data.service}</span></p>
                            <p className="flex justify-between"><span className="text-gray-500">Requested:</span> <span className="text-black font-black">{new Date(data.time).toLocaleString()}</span></p>
                          </div>

                          {(apptStatusCache[data.appointmentId] === 'confirmed' || apptStatusCache[data.appointmentId] === 'declined') ? (
                            <div className={cn(
                              "mt-4 py-3 rounded-xl text-center font-black text-[10px] uppercase tracking-widest shadow-[var(--shadow-neu-sm)]",
                              apptStatusCache[data.appointmentId] === 'confirmed' ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"
                            )}>
                              {apptStatusCache[data.appointmentId] === 'confirmed' ? 'System Confirmed' : 'Request Refused'}
                            </div>
                          ) : (
                            <div className="grid grid-cols-2 gap-4 pt-2">
                              <button
                                onClick={() => handleStatusUpdate(data.appointmentId, 'confirmed')}
                                className="bg-green-500 text-white font-black py-3 rounded-xl text-[10px] uppercase tracking-widest shadow-[0_5px_15px_rgba(34,197,94,0.3)] active:scale-95 transition-all"
                              >
                                Accept
                              </button>
                              <button
                                onClick={() => handleStatusUpdate(data.appointmentId, 'declined')}
                                className="bg-[var(--color-neu-bg)] shadow-[var(--shadow-neu-flat)] text-red-600 font-black py-3 rounded-xl text-[10px] uppercase tracking-widest active:shadow-[var(--shadow-neu-pressed)] transition-all"
                              >
                                Refuse
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    } catch (_) { return <div>{cleanMessageContent(msg.content)}</div>; }
                  })() : cleanMessageContent(msg.content)}
                </div>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* NEUMORPHIC INPUT AREA */}
        <div className="p-8 bg-[var(--color-neu-bg)] shadow-[var(--shadow-neu-flat)] rounded-[3rem] border border-white/20 mt-4">
          <div className="flex gap-4 items-end">
            <div className="flex-1 bg-[var(--color-neu-bg)] shadow-[var(--shadow-neu-pressed)] rounded-[2rem] p-2 border border-black/5">
              <textarea
                rows={2}
                value={reply}
                onChange={e => setReply(e.target.value)}
                onKeyDown={handleKey}
                placeholder="Compose your reply..."
                className="w-full bg-transparent px-6 py-4 text-sm font-bold text-black placeholder:text-gray-400 resize-none outline-none"
              />
            </div>
            <button
              onClick={sendReply}
              disabled={sending || !reply.trim()}
              className={cn(
                "w-16 h-16 rounded-[1.5rem] flex items-center justify-center transition-all border-4 border-white/20 active:scale-95",
                reply.trim()
                  ? "bg-blue-600 text-white shadow-[0_10px_20px_rgba(37,99,235,0.3)]"
                  : "bg-[var(--color-neu-bg)] shadow-[var(--shadow-neu-flat)] text-gray-300"
              )}
            >
              <Send size={24} strokeWidth={3} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── SESSIONS LIST ──────────────────────────────────────────────────────────
  return (
    <div className="max-w-4xl mx-auto px-4 pb-20">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-12">
        <div>
          <span className="text-gray-600 font-black text-[10px] uppercase tracking-widest ml-1">Live Communications</span>
          <h1 className="text-5xl font-black tracking-tight text-black mt-1 [text-shadow:-4px_4px_6px_var(--color-neu-shadow-dark)]">
            Inbox
          </h1>
          <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mt-3 bg-blue-50 px-4 py-1.5 rounded-full inline-block shadow-[var(--shadow-neu-sm)] border border-blue-100">
            {sessions.length} Active Data Channels
          </p>
        </div>
        <button
          onClick={loadSessions}
          className="w-14 h-14 bg-[var(--color-neu-bg)] shadow-[var(--shadow-neu-flat)] text-blue-600 rounded-2xl flex items-center justify-center active:shadow-[var(--shadow-neu-pressed)] active:scale-95 transition-all border border-white/20"
        >
          <RefreshCw size={24} strokeWidth={3} className={loading ? "animate-spin" : ""} />
        </button>
      </div>

      {loading && sessions.length === 0 && (
        <div className="space-y-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-28 bg-[var(--color-neu-bg)] shadow-[var(--shadow-neu-flat)] rounded-[2.5rem] animate-pulse" />
          ))}
        </div>
      )}

      {!loading && sessions.length === 0 && (
        <div className="text-center py-32 bg-[var(--color-neu-bg)] shadow-[var(--shadow-neu-pressed)] rounded-[3rem] border border-black/5 flex flex-col items-center">
          <MessageSquare className="text-gray-200 mb-8" size={80} strokeWidth={1} />
          <h3 className="text-xl font-black text-black">No Active Links</h3>
          <p className="text-xs font-bold text-gray-500 mt-2">Incoming website inquiries will appear as live tiles here.</p>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6">
        {sessions.map((session, idx) => {
          const unread = getUnreadCount(session);
          const lastMsg = getLastMessage(session);
          const isActive = activeSession?.id === session.id;

          return (
            <button
              key={session.id}
              onClick={() => openSession(session)}
              className={cn(
                "w-full text-left p-6 rounded-[2.5rem] transition-all group border border-white/20",
                isActive
                  ? "bg-[var(--color-neu-bg)] shadow-[var(--shadow-neu-pressed)] scale-[0.98]"
                  : "bg-[var(--color-neu-bg)] shadow-[var(--shadow-neu-flat)] hover:shadow-[var(--shadow-neu-pressed)] active:scale-[0.98]"
              )}
            >
              <div className="flex items-center gap-6">
                <div className={cn(
                  "w-16 h-16 rounded-2xl flex items-center justify-center transition-all shadow-[var(--shadow-neu-sm)]",
                  unread > 0 ? "bg-blue-600 text-white shadow-[0_0_15px_rgba(37,99,235,0.3)]" : "bg-[var(--color-neu-bg)] text-blue-600"
                )}>
                  {unread > 0 ? <Smartphone size={28} strokeWidth={3} /> : <User size={28} strokeWidth={3} />}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className={cn(
                      "text-lg font-black tracking-tight",
                      unread > 0 ? "text-blue-600" : "text-black"
                    )}>
                      {getSessionLabel(session, idx)}
                    </span>
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">
                      {lastMsg ? formatTime(lastMsg.created_at) : formatTime(session.created_at)}
                    </span>
                  </div>

                  {getSessionSubLabel(session) && (
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                      <div className="w-1 h-1 rounded-full bg-gray-300" />
                      {getSessionSubLabel(session)}
                    </p>
                  )}

                  <div className="flex items-center justify-between gap-4">
                    <p className="text-xs font-bold text-gray-500 truncate flex-1">
                      {lastMsg
                        ? `${lastMsg.sender === 'staff' ? 'You: ' : ''}${lastMsg.content}`
                        : 'Link Established'}
                    </p>
                    {unread > 0 && (
                      <span className="flex-shrink-0 px-3 py-1 rounded-full bg-blue-600 text-white text-[10px] font-black shadow-[0_5px_10px_rgba(37,99,235,0.3)]">
                        {unread} NEW
                      </span>
                    )}
                  </div>
                </div>

                <div className="w-10 h-10 rounded-full bg-[var(--color-neu-bg)] shadow-[var(--shadow-neu-flat)] flex items-center justify-center text-gray-300 group-hover:text-blue-600 transition-colors">
                  <ArrowRight size={20} strokeWidth={3} />
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function ArrowRight({ size, strokeWidth, className }: { size?: number, strokeWidth?: number, className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M5 12h14" />
      <path d="m12 5 7 7-7 7" />
    </svg>
  );
}
