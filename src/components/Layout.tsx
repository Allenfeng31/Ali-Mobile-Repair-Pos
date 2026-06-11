import React from 'react';
import { 
  LayoutDashboard, 
  Package, 
  BarChart3, 
  Users, 
  MessageSquare,
  Menu,
  Settings,
  LogOut,
  RotateCw,
  Save,
  CheckCircle2,
  X,
  Sparkles,
  PenTool,
  Trash2,
  FileText,
  Copy,
  Shield,
  Search,
  BellRing,
  Volume2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { api } from '@/lib/api';
import { getApiBaseUrl } from '@/lib/apiBase';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/hooks/useAuthStore';

interface LayoutProps {
  children: React.ReactNode;
  currentView: string;
  onViewChange: (view: string) => void;
  onLogout: () => void;
  currentUser: any;
  t: (section: string, key: string) => string;
}

const navItems = [
  { id: 'sales', label: 'Sales', icon: LayoutDashboard },
  { id: 'inventory', label: 'Inventory', icon: Package },
  { id: 'reports', label: 'Reports', icon: BarChart3 },
  { id: 'customers', label: 'Customers', icon: Users },
  { id: 'chat', label: 'Chat', icon: MessageSquare },
  { id: 'admin', label: 'Admin', icon: Shield, adminOnly: true },
];

const adminViews = new Set([
  'admin',
  'employees',
  'cms',
  'supplier-prices',
  'usb-print-test',
  'seo',
  'repair-results',
]);

const getUnreadSummary = (sessions: any[]) => {
  const unreadMessages = sessions
    .flatMap((session) => session.chat_messages || [])
    .filter((message) => message.sender === 'customer' && !message.is_read)
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  return {
    total: unreadMessages.length,
    latestUnreadId: unreadMessages[0]?.id || null,
  };
};

const getStaffAuthHeaders = async () => {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  return token ? { Authorization: `Bearer ${token}` } : {};
};

type ChatAuthWarning = 'expired' | 'forbidden' | null;

// ─── Slim Settings Panel ──────────────────────────────────────────────────────
function SettingsPanel({
  open,
  onClose,
  onLogout,
}: {
  open: boolean;
  onClose: () => void;
  onLogout: () => void;
}) {
  const [header, setHeader] = React.useState('');
  const [footer, setFooter] = React.useState('');
  const [saved, setSaved] = React.useState(false);

  // AI Blog States
  const [blogTopic, setBlogTopic] = React.useState('');
  const [isGenerating, setIsGenerating] = React.useState(false);
  const [blogDraft, setBlogDraft] = React.useState<any>(null);

  // SMS Generator States
  const [smsModel, setSmsModel] = React.useState('');
  const [smsRepair, setSmsRepair] = React.useState('');
  const [smsAmount, setSmsAmount] = React.useState('');
  const [isCopied, setIsCopied] = React.useState(false);

  const handleCopySMS = async () => {
    if (!smsModel || !smsRepair || !smsAmount) {
      alert('Please fill in Model, Repair Item, and Amount.');
      return;
    }
    
    const text = `Hi there, this is Ali Mobile Repair,\n\nThe ${smsRepair} for ${smsModel} is $${smsAmount}.\n\nYou are welcome to walk in or book an appointment here: https://alimobile.com.au\nAddress: Kiosk C1 Ringwood Square Shopping Centre, Ringwood 3134\nPhone: 0481 058 514`;
    
    try {
      await navigator.clipboard.writeText(text);
      setIsCopied(true);
      setSmsModel('');
      setSmsRepair('');
      setSmsAmount('');
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error(err);
      alert('Failed to copy text.');
    }
  };

  React.useEffect(() => {
    if (!open) return;
    api.getSettings().then((s: any) => {
      if (s.ali_pos_invoice_header) setHeader(s.ali_pos_invoice_header);
      if (s.ali_pos_invoice_footer) setFooter(s.ali_pos_invoice_footer);
    }).catch(console.error);
  }, [open]);

  const handleSave = async () => {
    await api.updateSetting('ali_pos_invoice_header', header);
    await api.updateSetting('ali_pos_invoice_footer', footer);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const handleGenerateBlog = async () => {
    if (!blogTopic.trim()) return;
    setIsGenerating(true);
    try {
      const draft = await api.generateBlog(blogTopic);
      setBlogDraft(draft);
    } catch (err: any) {
      alert("Failed to generate: " + err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePublishBlog = async () => {
    if (!blogDraft) return;
    try {
      await api.confirmBlog(blogDraft.slug, blogDraft.content, blogDraft.image);
      alert("Article published to storefront!");
      setBlogDraft(null);
      setBlogTopic('');
    } catch (err: any) {
      alert("Failed to publish: " + err.message);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-neu-bg/40  z-50"
          />
          {/* Slide-out panel from right */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 320, damping: 32 }}
            className="fixed right-0 top-0 h-full w-80 bg-neu-bg border-l border-transparent z-50 flex flex-col shadow-neu-floating"
          >
            {/* Panel header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-transparent">
              <div className="flex items-center gap-2.5">
                <Settings size={18} className="text-neu-accent" />
                <span className="font-black text-neu-text-primary tracking-tight">Settings</span>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg hover:bg-neu-bg text-neu-text-secondary transition-all"
              >
                <X size={18} />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
              {/* Invoice header */}
              <div className="space-y-2">
                <label className="text-[10px] font-black text-neu-text-secondary uppercase tracking-widest">
                  Invoice Header
                </label>
                <textarea
                  rows={4}
                  value={header}
                  onChange={e => setHeader(e.target.value)}
                  placeholder="Store name, address, phone..."
                  className="w-full bg-neu-bg rounded-2xl px-4 py-3 text-sm text-neu-text-primary shadow-neu-pressed resize-none outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium"
                />
              </div>

              {/* Invoice footer */}
              <div className="space-y-2">
                <label className="text-[10px] font-black text-neu-text-secondary uppercase tracking-widest">
                  Invoice Footer / Disclaimer
                </label>
                <textarea
                  rows={4}
                  value={footer}
                  onChange={e => setFooter(e.target.value)}
                  placeholder="Warranty terms, return policy..."
                  className="w-full bg-neu-bg rounded-2xl px-4 py-3 text-sm text-neu-text-primary shadow-neu-pressed resize-none outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium"
                />
              </div>

              {/* Save */}
              <button
                onClick={handleSave}
                className="w-full bg-neu-accent hover:bg-blue-600 text-neu-text-primary py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 shadow-neu-flat shadow-primary/20 hover:opacity-90 transition-all active:scale-[0.98]"
              >
                {saved ? <CheckCircle2 size={15} /> : <Save size={15} />}
                {saved ? 'Saved!' : 'Save Changes'}
              </button>

              <div className="h-px bg-outline-variant/10 !my-8" />

              {/* QUICK SMS GENERATOR */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <MessageSquare size={16} className="text-neu-accent" />
                  <span className="text-xs font-black text-neu-text-primary uppercase tracking-tight">Quick SMS</span>
                </div>

                <div className="space-y-3">
                  <p className="text-[10px] font-bold text-neu-text-secondary leading-relaxed">
                    Generate an SMS quote instantly.
                  </p>
                  
                  <div className="space-y-2">
                    <input 
                      type="text" 
                      value={smsModel}
                      onChange={(e) => setSmsModel(e.target.value)}
                      placeholder="Model (e.g. iPhone 13)"
                      className="w-full bg-neu-bg rounded-2xl px-4 py-2.5 text-xs text-neu-text-primary shadow-neu-pressed outline-none focus:ring-2 focus:ring-blue-500/20 transition-all font-medium"
                    />
                    <input 
                      type="text" 
                      value={smsRepair}
                      onChange={(e) => setSmsRepair(e.target.value)}
                      placeholder="Repair (e.g. Screen)"
                      className="w-full bg-neu-bg rounded-2xl px-4 py-2.5 text-xs text-neu-text-primary shadow-neu-pressed outline-none focus:ring-2 focus:ring-blue-500/20 transition-all font-medium"
                    />
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neu-text-secondary font-bold text-xs">$</span>
                      <input 
                        type="number" 
                        value={smsAmount}
                        onChange={(e) => setSmsAmount(e.target.value)}
                        placeholder="Price (Amount)"
                        className="w-full bg-neu-bg rounded-2xl pl-7 pr-4 py-2.5 text-xs text-neu-text-primary shadow-neu-pressed outline-none focus:ring-2 focus:ring-blue-500/20 transition-all font-medium"
                      />
                    </div>
                  </div>

                  <button
                    onClick={handleCopySMS}
                    className={cn(
                      "w-full py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 transition-all active:scale-[0.98]",
                      isCopied 
                        ? "bg-emerald-600 text-neu-text-primary shadow-neu-flat shadow-emerald-200" 
                        : "bg-blue-600 text-neu-text-primary shadow-neu-flat shadow-blue-200 hover:bg-neu-accent"
                    )}
                  >
                    {isCopied ? <CheckCircle2 size={14} /> : <Copy size={14} />}
                    {isCopied ? 'Copied!' : 'Generate & Copy'}
                  </button>

                  {(smsModel || smsRepair || smsAmount) && (
                    <div className="p-3 bg-neu-bg shadow-neu-pressed rounded-2xl text-[9px] whitespace-pre-wrap font-medium text-neu-text-secondary border border-transparent leading-relaxed mt-2">
                      {`Hi there, this is Ali Mobile Repair,\n\nThe ${smsRepair || '[Repair]'} for ${smsModel || '[Model]'} is $${smsAmount || '0'}.\n\nYou are welcome to walk in or book an appointment here: https://alimobile.com.au\nAddress: Kiosk C1 Ringwood\nPhone: 0481 058 514`}
                    </div>
                  )}
                </div>
              </div>

              <div className="h-px bg-outline-variant/10 !my-8" />

              {/* AI BLOG GEN */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Sparkles size={16} className="text-purple-500" />
                  <span className="text-xs font-black text-neu-text-primary uppercase tracking-tight">AI Blog Marketing</span>
                </div>

                {!blogDraft ? (
                  <div className="space-y-3">
                    <p className="text-[10px] font-bold text-neu-text-secondary leading-relaxed">
                      Transform a topic into an SEO-ready repair guide for your website.
                    </p>
                    <div className="relative">
                      <input 
                        type="text" 
                        value={blogTopic}
                        onChange={e => setBlogTopic(e.target.value)}
                        placeholder="e.g. iPhone 17 Screen Care"
                        className="w-full bg-neu-bg rounded-2xl px-4 py-3 text-sm text-neu-text-primary shadow-neu-pressed outline-none focus:ring-2 focus:ring-purple-500/20 transition-all font-medium pr-10"
                      />
                      <PenTool size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-neu-text-secondary/40" />
                    </div>
                    <button
                      onClick={handleGenerateBlog}
                      disabled={isGenerating || !blogTopic.trim()}
                      className="w-full bg-slate-900 text-neu-text-primary py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-slate-800 transition-all disabled:opacity-50"
                    >
                      {isGenerating ? <RotateCw size={14} className="animate-spin" /> : <Sparkles size={14} className="text-purple-400" />}
                      {isGenerating ? 'Generating...' : 'Generate Draft'}
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <div className="bg-neu-bg rounded-2xl overflow-hidden border border-transparent shadow-sm">
                      <div className="aspect-video relative">
                        <img 
                          src={`${getApiBaseUrl()}/blog/proxy-image?url=${encodeURIComponent(blogDraft.image)}`}
                          alt="Preview" 
                          className="w-full h-full object-cover" 
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent p-4 flex flex-col justify-end">
                          <h4 className="text-neu-text-primary font-black text-xs leading-tight line-clamp-2">{blogDraft.title}</h4>
                        </div>
                      </div>
                      <div className="p-3">
                        <p className="text-[9px] text-neu-text-secondary font-medium line-clamp-2 leading-relaxed italic">
                          "{blogDraft.description}"
                        </p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                       <button
                         onClick={() => setBlogDraft(null)}
                         className="flex items-center justify-center gap-2 py-2.5 rounded-2xl text-[9px] font-black uppercase tracking-widest bg-neu-bg shadow-neu-pressed text-neu-text-secondary"
                       >
                         <Trash2 size={12} />
                         Discard
                       </button>
                       <button
                         onClick={handlePublishBlog}
                         className="flex items-center justify-center gap-2 py-2.5 rounded-2xl text-[9px] font-black uppercase tracking-widest bg-emerald-600 text-neu-text-primary shadow-neu-flat shadow-emerald-200"
                       >
                         <CheckCircle2 size={12} />
                         Publish
                       </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Logout at bottom */}
            <div className="px-6 py-5 border-t border-transparent">
              <button
                onClick={onLogout}
                className="w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl border border-red-500/30 text-red-500 hover:bg-red-500 hover:text-neu-text-primary transition-all font-black text-xs uppercase tracking-widest"
              >
                <LogOut size={16} />
                Sign Out
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// ─── Layout ───────────────────────────────────────────────────────────────────
export function Layout({ children, currentView, onViewChange, onLogout, currentUser, t }: LayoutProps) {
  const [backendOk, setBackendOk] = React.useState(true);
  const { permissions } = useAuthStore();
  const [settingsOpen, setSettingsOpen] = React.useState(false);
  const [unreadChats, setUnreadChats] = React.useState(0);
  const [chatAuthWarning, setChatAuthWarning] = React.useState<ChatAuthWarning>(null);
  const [markingChatSeen, setMarkingChatSeen] = React.useState(false);
  const lastAlertedMessageIdRef = React.useRef<string | null>(null);
  const lastNativeNotificationIdRef = React.useRef<string | null>(null);
  const audioContextRef = React.useRef<AudioContext | null>(null);

  // ── Quick Quote (Cmd+K) State ───────────────────────────────────────────
  const [isQuickSearchOpen, setIsQuickSearchOpen] = React.useState(false);
  const [quickSearchQuery, setQuickSearchQuery] = React.useState('');
  const [inventoryCache, setInventoryCache] = React.useState<any[]>([]);
  const [inventoryLoading, setInventoryLoading] = React.useState(false);
  const quickSearchInputRef = React.useRef<HTMLInputElement>(null);

  // Keyboard shortcut: Cmd+K / Ctrl+K
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsQuickSearchOpen(prev => !prev);
      }
      if (e.key === 'Escape' && isQuickSearchOpen) {
        setIsQuickSearchOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isQuickSearchOpen]);

  // Fetch inventory when modal opens (cache it)
  React.useEffect(() => {
    if (isQuickSearchOpen && inventoryCache.length === 0 && !inventoryLoading) {
      setInventoryLoading(true);
      api.getInventory()
        .then((data: any[]) => setInventoryCache(data))
        .catch(console.error)
        .finally(() => setInventoryLoading(false));
    }
    if (isQuickSearchOpen) {
      setQuickSearchQuery('');
      setTimeout(() => quickSearchInputRef.current?.focus(), 100);
    }
  }, [isQuickSearchOpen]);

  // Filter results
  const quickSearchResults = React.useMemo(() => {
    if (!quickSearchQuery.trim()) return [];
    const q = quickSearchQuery.toLowerCase();
    return inventoryCache
      .filter((item: any) => {
        const searchable = `${item.name} ${item.model || ''} ${item.brand || ''} ${item.category || ''} ${item.sku || ''}`.toLowerCase();
        return searchable.includes(q);
      })
      .slice(0, 20); // Cap at 20 results
  }, [quickSearchQuery, inventoryCache]);

  // Poll backend server health
  React.useEffect(() => {
    const check = async () => {
      try {
        await api.getIp();
        setBackendOk(true);
      } catch (error) {
        console.error('[POS Health] Server Offline badge triggered by health check failure.', {
          error,
          diagnostics: api.getDebugInfo(),
        });
        setBackendOk(false);
      }
    };

    check();
    const interval = setInterval(check, 10000);
    return () => clearInterval(interval);
  }, []);

  const playChatAlertSound = React.useCallback(() => {
    try {
      const AudioContextCtor = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextCtor) return;

      const audioContext = audioContextRef.current || new AudioContextCtor();
      audioContextRef.current = audioContext;

      const oscillator = audioContext.createOscillator();
      const gain = audioContext.createGain();
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(880, audioContext.currentTime);
      oscillator.frequency.setValueAtTime(660, audioContext.currentTime + 0.12);
      gain.gain.setValueAtTime(0.0001, audioContext.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.18, audioContext.currentTime + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, audioContext.currentTime + 0.34);
      oscillator.connect(gain);
      gain.connect(audioContext.destination);
      oscillator.start();
      oscillator.stop(audioContext.currentTime + 0.36);
    } catch (_) {
      // Browsers can block sound until the staff member has interacted with the page.
    }
  }, []);

  const showNativeChatNotification = React.useCallback((messageId: string) => {
    if (lastNativeNotificationIdRef.current === messageId) return;
    if (!('Notification' in window)) return;
    if (Notification.permission !== 'granted') return;
    if (!document.hidden && document.hasFocus()) return;

    lastNativeNotificationIdRef.current = messageId;

    try {
      const notification = new Notification('New customer message or booking', {
        body: 'Open POS chat to view the message.',
        tag: `pos-chat-${messageId}`,
        requireInteraction: true,
      });

      notification.onclick = () => {
        window.focus();
        onViewChange('chat');
        notification.close();
      };
    } catch (_) {
      // Native notifications are best-effort; the in-app banner remains the reliable alert.
    }
  }, [onViewChange]);

  const checkUnreadChats = React.useCallback(async () => {
    const API_BASE = getApiBaseUrl();

    try {
      const headers = await getStaffAuthHeaders();
      if (!headers.Authorization) {
        setChatAuthWarning('expired');
        return null;
      }

      const res = await fetch(`${API_BASE}/chat/unread-summary`, {
        headers,
      });
      if (res.status === 401) {
        setChatAuthWarning('expired');
        return null;
      }
      if (res.status === 403) {
        setChatAuthWarning('forbidden');
        return null;
      }
      if (!res.ok) return null;

      setChatAuthWarning(null);
      const summary = await res.json();
      setUnreadChats(summary.total);

      if (summary.latestUnreadId && summary.latestUnreadId !== lastAlertedMessageIdRef.current) {
        lastAlertedMessageIdRef.current = summary.latestUnreadId;
        playChatAlertSound();
        showNativeChatNotification(summary.latestUnreadId);
      }

      if (!summary.latestUnreadId) {
        lastAlertedMessageIdRef.current = null;
        lastNativeNotificationIdRef.current = null;
      }

      return summary;
    } catch (_) {
      return null;
    }
  }, [playChatAlertSound, showNativeChatNotification]);

  // Poll backend unread state so every open POS device reflects global chat status.
  React.useEffect(() => {
    checkUnreadChats();
    const interval = setInterval(checkUnreadChats, 30000);
    return () => clearInterval(interval);
  }, [checkUnreadChats]);

  const markChatSeen = React.useCallback(async () => {
    const API_BASE = getApiBaseUrl();
    setMarkingChatSeen(true);

    try {
      const headers = await getStaffAuthHeaders();
      if (!headers.Authorization) {
        setChatAuthWarning('expired');
        await checkUnreadChats();
        return false;
      }

      const res = await fetch(`${API_BASE}/chat/seen`, {
        method: 'POST',
        headers,
      });
      if (res.status === 401) {
        setChatAuthWarning('expired');
        await checkUnreadChats();
        return false;
      }
      if (res.status === 403) {
        setChatAuthWarning('forbidden');
        await checkUnreadChats();
        return false;
      }
      if (!res.ok) {
        await checkUnreadChats();
        return false;
      }

      setChatAuthWarning(null);
      const data = await res.json().catch(() => ({ unreadCount: 0 }));
      const unreadCount = Number(data?.unreadCount || 0);
      setUnreadChats(unreadCount);
      if (unreadCount === 0) {
        lastAlertedMessageIdRef.current = null;
        lastNativeNotificationIdRef.current = null;
      }

      try {
        if ('clearAppBadge' in navigator) {
          (navigator as any).clearAppBadge().catch(() => {});
        }
      } catch (_) {}

      if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage({ type: 'CLEAR_BADGE' });
      }

      return true;
    } catch (_) {
      await checkUnreadChats();
      return false;
    } finally {
      setMarkingChatSeen(false);
    }
  }, [checkUnreadChats]);

  const openChatAndMarkSeen = React.useCallback(() => {
    if (currentView !== 'chat') {
      onViewChange('chat');
      return;
    }
    markChatSeen();
  }, [currentView, markChatSeen, onViewChange]);

  React.useEffect(() => {
    if (currentView === 'chat') {
      markChatSeen();
    }
  }, [currentView, markChatSeen]);

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* ── Desktop Sidebar ──────────────────────────────────────────── */}
      <aside className="hidden md:flex fixed left-0 top-0 h-full w-20 bg-neu-bg flex-col items-center pt-10 pb-6 z-30 shadow-neu-flat">
        {/* Settings button top-left (desktop) */}
        <div className="mb-4 relative group/logo">
          <button
            onClick={() => setSettingsOpen(true)}
            className="w-10 h-10 rounded-2xl bg-neu-accent hover:bg-blue-600 flex items-center justify-center text-neu-text-primary shadow-neu-flat hover:scale-105 active:scale-95 transition-all"
          >
            <Settings size={20} strokeWidth={2} />
          </button>
          <span className="absolute left-full ml-4 px-4 py-2 bg-[var(--color-neu-bg)] text-black font-black text-sm rounded-xl shadow-[var(--shadow-neu-flat)] opacity-0 pointer-events-none group-hover/logo:opacity-100 transition-all z-50 whitespace-nowrap">
            Settings
          </span>
        </div>

        <div className="flex flex-col gap-8 w-full items-center">
          {navItems.filter(item => !item.adminOnly || permissions?.is_super_admin).map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id || (item.id === 'admin' && adminViews.has(currentView));
            const showBadge = item.id === 'chat' && unreadChats > 0;
            return (
              <button
                key={item.id}
                onClick={() => item.id === 'chat' ? openChatAndMarkSeen() : onViewChange(item.id)}
                className={cn(
                  "p-3 rounded-2xl transition-all duration-200 relative group",
                  isActive
                    ? "text-neu-accent bg-neu-bg shadow-neu-pressed"
                    : "text-neu-text-secondary hover:text-neu-accent hover:bg-neu-bg hover:shadow-neu-sm",
                  showBadge && "text-red-600 bg-red-50 shadow-[0_0_0_6px_rgba(239,68,68,0.12)] animate-pulse"
                )}
              >
                <div className="relative">
                  <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
                  {showBadge && (
                    <span className="absolute -top-2 -right-2 min-w-5 h-5 px-1 rounded-full bg-red-600 border-2 border-white text-[9px] font-black text-white shadow-lg flex items-center justify-center">
                      {unreadChats > 9 ? '9+' : unreadChats}
                    </span>
                  )}
                </div>
                <span className="absolute left-full ml-4 px-4 py-2 bg-[var(--color-neu-bg)] text-black font-black text-sm rounded-xl shadow-[var(--shadow-neu-flat)] opacity-0 pointer-events-none group-hover:opacity-100 transition-all z-50 whitespace-nowrap">
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </aside>

      {/* ── Main Content ─────────────────────────────────────────────── */}
      <div className="flex-1 md:ml-20 flex flex-col min-h-screen">
        {/* Top Bar */}
        <header className="bg-neu-bg sticky top-0 z-40 px-6 py-4 flex justify-between items-center shadow-neu-sm">
          <div className="flex items-center gap-4">
            {/* Mobile: hamburger opens settings panel */}
            <button
              className="md:hidden text-neu-accent cursor-pointer p-1"
              onClick={() => setSettingsOpen(true)}
              aria-label="Settings"
            >
              <Menu size={24} />
            </button>
            <h1 className="text-xl font-black text-neu-text-primary tracking-tight">
              Ali Mobile <span className="text-neu-accent">Repair POS</span>
            </h1>
          </div>

          <div className="flex items-center gap-3">
            {/* Quick Quote Search Button */}
            <button
              onClick={() => setIsQuickSearchOpen(true)}
              className="p-2.5 rounded-2xl bg-neu-bg text-neu-text-secondary shadow-neu-flat hover:text-neu-accent hover:shadow-neu-floating active:scale-[0.98] active:shadow-neu-pressed group relative mr-1 transition-all"
              title="Quick Price Lookup (⌘K)"
            >
              <Search size={18} strokeWidth={2.5} />
              <span className="absolute top-full right-0 mt-2 px-4 py-2 bg-[var(--color-neu-bg)] text-black font-black text-sm rounded-xl shadow-[var(--shadow-neu-flat)] opacity-0 pointer-events-none group-hover:opacity-100 transition-all z-50 whitespace-nowrap">
                Quick Quote ⌘K
              </span>
            </button>

            <button
              onClick={() => window.location.reload()}
              className="p-2.5 rounded-2xl bg-neu-bg text-neu-text-secondary shadow-neu-flat hover:text-neu-accent active:rotate-180 group relative mr-2 transition-all active:shadow-neu-pressed"
              title="Refresh App"
            >
              <RotateCw size={18} />
              <span className="absolute top-full right-0 mt-2 px-4 py-2 bg-[var(--color-neu-bg)] text-black font-black text-sm rounded-xl shadow-[var(--shadow-neu-flat)] opacity-0 pointer-events-none group-hover:opacity-100 transition-all z-50 whitespace-nowrap">
                Refresh App
              </span>
            </button>

            <div className={`hidden lg:flex items-center gap-1.5 px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest mr-4 bg-neu-bg shadow-neu-pressed ${backendOk ? 'text-emerald-600' : 'text-red-500'}`}>
              <div className={`w-2 h-2 rounded-full ${backendOk ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`} />
              {backendOk ? 'Server Active' : 'Server Offline'}
            </div>

            <div className="hidden sm:flex flex-col items-end mr-3">
              <span 
                className="text-xs font-black text-neu-text-primary uppercase tracking-wide cursor-help"
                title={`User ID: ${currentUser?.id || 'Unknown'}`}
              >
                {currentUser?.username || currentUser?.email?.replace('@pos.local', '') || t('nav', 'guest')}
              </span>
              <span className="text-[10px] font-bold text-neu-text-secondary uppercase tracking-widest">
                {permissions?.is_super_admin ? 'Super Admin' : (currentUser?.role === 'authenticated' ? t('nav', 'staff') : (currentUser?.role || t('nav', 'staff')))}
              </span>
            </div>
            <div className="w-10 h-10 rounded-2xl bg-neu-bg flex items-center justify-center text-neu-accent font-black uppercase text-lg shadow-neu-pressed border border-white/5">
              {(currentUser?.username || currentUser?.email || 'G').charAt(0).toUpperCase()}
            </div>
          </div>
        </header>

        {chatAuthWarning && (
          <div className="sticky top-[72px] z-40 px-4 md:px-8 pt-4">
            <div className="mx-auto flex max-w-5xl flex-col gap-3 rounded-[2rem] border border-amber-200 bg-amber-50 p-4 text-amber-800 shadow-[0_18px_45px_rgba(245,158,11,0.18)] sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-black">
                  {chatAuthWarning === 'expired'
                    ? 'Staff chat session expired. Please sign out and sign back in.'
                    : 'This account does not have staff chat permission.'}
                </p>
                <p className="mt-1 text-xs font-bold text-amber-700/80">
                  On mobile or PWA, force refresh the POS app after signing in again so the latest staff chat code loads.
                </p>
              </div>
              <button
                onClick={() => window.location.reload()}
                className="rounded-2xl bg-amber-500 px-5 py-3 text-xs font-black uppercase tracking-widest text-black shadow-lg transition-all hover:bg-amber-400 active:scale-95"
              >
                Refresh POS
              </button>
            </div>
          </div>
        )}

        {unreadChats > 0 && (
          <div className="sticky top-[72px] z-40 px-4 md:px-8 pt-4">
            <div className="mx-auto flex max-w-5xl flex-col gap-4 rounded-[2rem] border border-red-200 bg-red-50 p-4 text-red-700 shadow-[0_18px_45px_rgba(239,68,68,0.22)] sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-4">
                <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-red-600 text-white shadow-lg">
                  <BellRing size={22} strokeWidth={3} />
                  <span className="absolute -right-1 -top-1 h-4 w-4 rounded-full bg-white shadow">
                    <span className="block h-full w-full animate-ping rounded-full bg-red-500" />
                  </span>
                </div>
                <div>
                  <p className="text-sm font-black text-red-700">New customer message or booking in chat</p>
                  <p className="mt-1 text-xs font-bold text-red-600/80">
                    {unreadChats} unread {unreadChats === 1 ? 'message' : 'messages'} waiting. This alert stays until staff opens chat.
                  </p>
                </div>
              </div>
              <button
                onClick={openChatAndMarkSeen}
                disabled={markingChatSeen}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-red-600 px-5 py-3 text-xs font-black uppercase tracking-widest text-white shadow-lg transition-all hover:bg-red-700 active:scale-95 disabled:opacity-60"
              >
                <Volume2 size={16} strokeWidth={3} />
                {markingChatSeen ? 'Opening...' : 'Open chat'}
              </button>
            </div>
          </div>
        )}

        {/* View Content */}
        <main className="flex-1 p-4 md:p-8 pb-24 md:pb-8">
          <motion.div
            key={currentView}
            initial={{ opacity: 0, y: 12, scale: 0.995 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.995 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="transition-opacity duration-300 ease-out"
          >
            {children}
          </motion.div>
        </main>

        {/* Bottom Nav - Mobile */}
        <nav className="md:hidden fixed bottom-0 left-0 w-full flex justify-around items-center px-4 pb-6 pt-2 bg-neu-bg backdrop-blur-lg border-t border-transparent z-50">
          {navItems.filter(item => !item.adminOnly || permissions?.is_super_admin).map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id || (item.id === 'admin' && adminViews.has(currentView));
            const showBadge = item.id === 'chat' && unreadChats > 0;
            return (
              <button
                key={item.id}
                onClick={() => item.id === 'chat' ? openChatAndMarkSeen() : onViewChange(item.id)}
                className={cn(
                  "flex flex-col items-center justify-center px-3 py-1.5 transition-all rounded-2xl relative",
                  isActive
                    ? "bg-neu-bg shadow-neu-pressed text-neu-accent scale-110"
                    : "text-neu-text-secondary shadow-neu-flat",
                  showBadge && "bg-red-50 text-red-600 shadow-[0_0_0_5px_rgba(239,68,68,0.12)] animate-pulse"
                )}
              >
                <div className="relative">
                  <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                  {showBadge && (
                    <span className="absolute -top-2 -right-2 min-w-5 h-5 px-1 rounded-full bg-red-600 border-2 border-white text-[9px] font-black text-white shadow-lg flex items-center justify-center">
                      {unreadChats > 9 ? '9+' : unreadChats}
                    </span>
                  )}
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider mt-1">{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Settings slide-out panel (shared between mobile & desktop) */}
      <SettingsPanel
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        onLogout={onLogout}
      />

      {/* ── Quick Quote Search Modal ──────────────────────────────────── */}
      <AnimatePresence>
        {isQuickSearchOpen && (
          <div className="fixed inset-0 z-[100] flex justify-center">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsQuickSearchOpen(false)}
              className="absolute inset-0 bg-black/30 backdrop-blur-sm"
            />

            {/* Search Card */}
            <motion.div
              initial={{ opacity: 0, y: -30, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="relative w-full max-w-2xl mt-20 mx-4 h-fit"
            >
              <div className="bg-[var(--color-neu-bg)] shadow-[var(--shadow-neu-flat)] rounded-[2.5rem] p-6 border border-white/20">
                {/* Header */}
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[var(--color-neu-bg)] shadow-[var(--shadow-neu-flat)] flex items-center justify-center text-blue-600 border border-white/30">
                      <Search size={20} strokeWidth={2.5} />
                    </div>
                    <div>
                      <h3 className="text-lg font-black text-black tracking-tight">Quick Quote</h3>
                      <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Read-Only Price Lookup</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsQuickSearchOpen(false)}
                    className="p-2 rounded-xl bg-[var(--color-neu-bg)] shadow-[var(--shadow-neu-flat)] text-gray-500 hover:text-red-500 active:shadow-[var(--shadow-neu-pressed)] active:scale-95 transition-all"
                  >
                    <X size={18} strokeWidth={2.5} />
                  </button>
                </div>

                {/* Search Input (Recessed) */}
                <div className="bg-[var(--color-neu-bg)] shadow-[var(--shadow-neu-pressed)] rounded-2xl p-1 mb-4 border border-black/5">
                  <input
                    ref={quickSearchInputRef}
                    type="text"
                    value={quickSearchQuery}
                    onChange={(e) => setQuickSearchQuery(e.target.value)}
                    placeholder="Search device or repair... (Esc to close)"
                    className="w-full px-5 py-4 bg-transparent text-black font-bold text-base placeholder:text-gray-400 placeholder:font-bold focus:outline-none"
                  />
                </div>

                {/* Keyboard hint */}
                <div className="flex items-center gap-2 mb-4">
                  <kbd className="px-2 py-0.5 bg-[var(--color-neu-bg)] shadow-[var(--shadow-neu-flat)] rounded-lg text-[10px] font-black text-gray-500 uppercase tracking-widest border border-white/20">⌘K</kbd>
                  <span className="text-[10px] font-bold text-gray-400">to toggle</span>
                  <kbd className="px-2 py-0.5 bg-[var(--color-neu-bg)] shadow-[var(--shadow-neu-flat)] rounded-lg text-[10px] font-black text-gray-500 uppercase tracking-widest border border-white/20 ml-2">ESC</kbd>
                  <span className="text-[10px] font-bold text-gray-400">to close</span>
                </div>

                {/* Results */}
                <div className="max-h-[50vh] overflow-y-auto no-scrollbar">
                  {inventoryLoading ? (
                    <div className="py-12 text-center">
                      <div className="w-8 h-8 border-3 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                      <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Loading Inventory...</p>
                    </div>
                  ) : !quickSearchQuery.trim() ? (
                    <div className="py-10 text-center">
                      <Search size={32} className="mx-auto text-gray-300 mb-3" />
                      <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Type to search prices</p>
                      <p className="text-[10px] font-bold text-gray-400 mt-1">{inventoryCache.length} items indexed</p>
                    </div>
                  ) : quickSearchResults.length === 0 ? (
                    <div className="py-10 text-center">
                      <p className="text-sm font-black text-gray-400">No results for "{quickSearchQuery}"</p>
                      <p className="text-[10px] font-bold text-gray-400 mt-1">Try a different search term</p>
                    </div>
                  ) : (
                    <div className="space-y-1.5">
                      {quickSearchResults.map((item: any) => (
                        <div
                          key={item.id}
                          className="flex items-center justify-between px-5 py-3.5 bg-[var(--color-neu-bg)] shadow-[var(--shadow-neu-sm)] rounded-2xl border border-white/10 hover:shadow-[var(--shadow-neu-flat)] transition-all"
                        >
                          <div className="min-w-0 flex-1 mr-4">
                            <p className="text-sm font-black text-black truncate">{item.name}</p>
                            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider truncate">
                              {item.category}{item.model ? ` · ${item.model}` : ''}{item.quality_grade ? ` · ${item.quality_grade}` : ''}
                            </p>
                          </div>
                          <div className="text-right shrink-0">
                            <p className="text-lg font-black text-blue-600">${item.price?.toFixed(2)}</p>
                            {item.stock !== undefined && (
                              <p className={`text-[9px] font-black uppercase tracking-widest ${item.stock > 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                                {item.stock > 0 ? `${item.stock} In Stock` : 'Out of Stock'}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                      {quickSearchResults.length >= 20 && (
                        <p className="text-center text-[10px] font-bold text-gray-400 py-2">Showing first 20 results. Refine your search for more.</p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
