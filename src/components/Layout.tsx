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
  X
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { api } from '@/lib/api';

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
];

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
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
          />
          {/* Slide-out panel from right */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 320, damping: 32 }}
            className="fixed right-0 top-0 h-full w-80 bg-surface-container-low border-l border-outline-variant/10 z-50 flex flex-col shadow-2xl"
          >
            {/* Panel header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-outline-variant/10">
              <div className="flex items-center gap-2.5">
                <Settings size={18} className="text-primary" />
                <span className="font-black text-on-surface tracking-tight">Settings</span>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg hover:bg-surface-container-high text-on-surface-variant transition-all"
              >
                <X size={18} />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
              {/* Invoice header */}
              <div className="space-y-2">
                <label className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest">
                  Invoice Header
                </label>
                <textarea
                  rows={4}
                  value={header}
                  onChange={e => setHeader(e.target.value)}
                  placeholder="Store name, address, phone..."
                  className="w-full bg-surface-container-high rounded-xl px-4 py-3 text-sm text-on-surface resize-none outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium"
                />
              </div>

              {/* Invoice footer */}
              <div className="space-y-2">
                <label className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest">
                  Invoice Footer / Disclaimer
                </label>
                <textarea
                  rows={4}
                  value={footer}
                  onChange={e => setFooter(e.target.value)}
                  placeholder="Warranty terms, return policy..."
                  className="w-full bg-surface-container-high rounded-xl px-4 py-3 text-sm text-on-surface resize-none outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium"
                />
              </div>

              {/* Save */}
              <button
                onClick={handleSave}
                className="w-full signature-gradient text-white py-3.5 rounded-xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg shadow-primary/20 hover:opacity-90 transition-all active:scale-[0.98]"
              >
                {saved ? <CheckCircle2 size={15} /> : <Save size={15} />}
                {saved ? 'Saved!' : 'Save Changes'}
              </button>
            </div>

            {/* Logout at bottom */}
            <div className="px-6 py-5 border-t border-outline-variant/10">
              <button
                onClick={onLogout}
                className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl border border-red-500/30 text-red-500 hover:bg-red-500 hover:text-white transition-all font-black text-xs uppercase tracking-widest"
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
  const [backendOk, setBackendOk] = React.useState(false);
  const [settingsOpen, setSettingsOpen] = React.useState(false);
  const [unreadChats, setUnreadChats] = React.useState(0);

  // Poll backend server health
  React.useEffect(() => {
    const check = () => api.getIp().then(() => setBackendOk(true)).catch(() => setBackendOk(false));
    check();
    const interval = setInterval(check, 10000);
    return () => clearInterval(interval);
  }, []);

  // Poll for unread customer messages — shows red dot on Chat icon
  React.useEffect(() => {
    const API_BASE = (() => {
      // @ts-ignore
      const env = import.meta.env;
      if (env?.PROD) return '/api';
      return env?.VITE_API_URL || 'http://localhost:3001/api';
    })();

    const checkUnread = async () => {
      try {
        const res = await fetch(`${API_BASE}/chat/sessions`);
        if (!res.ok) return;
        const sessions: any[] = await res.json();
        const total = sessions.reduce((acc, s) => {
          const unread = (s.chat_messages || []).filter(
            (m: any) => m.sender === 'customer' && !m.is_read
          ).length;
          return acc + unread;
        }, 0);
        setUnreadChats(total);
      } catch (_) {}
    };

    checkUnread();
    const interval = setInterval(checkUnread, 5000);
    return () => clearInterval(interval);
  }, []);

  // Clear badge when user navigates to chat
  React.useEffect(() => {
    if (currentView === 'chat') setUnreadChats(0);
  }, [currentView]);

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* ── Desktop Sidebar ──────────────────────────────────────────── */}
      <aside className="hidden md:flex fixed left-0 top-0 h-full w-20 bg-surface-container-low flex-col items-center pt-10 pb-6 z-30 border-r border-outline-variant/10">
        {/* Settings button top-left (desktop) */}
        <div className="mb-4 relative group/logo">
          <button
            onClick={() => setSettingsOpen(true)}
            className="w-10 h-10 rounded-xl signature-gradient flex items-center justify-center text-white shadow-lg hover:scale-105 active:scale-95 transition-all"
          >
            <Settings size={20} strokeWidth={2} />
          </button>
          <span className="absolute left-full ml-4 px-2 py-1 bg-on-surface text-surface text-[10px] font-bold rounded opacity-0 group-hover/logo:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
            Settings
          </span>
        </div>

        {/* Nav items */}
        <div className="flex flex-col gap-8 w-full items-center">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            const showBadge = item.id === 'chat' && unreadChats > 0;
            return (
              <button
                key={item.id}
                onClick={() => onViewChange(item.id)}
                className={cn(
                  "p-3 rounded-xl transition-all duration-200 relative group",
                  isActive
                    ? "text-primary bg-primary-container/10 ring-1 ring-primary/20"
                    : "text-on-surface-variant hover:text-primary hover:bg-surface-container-high"
                )}
              >
                <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
                {showBadge && (
                  <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 rounded-full bg-red-500 border border-surface-container-low" />
                )}
                <span className="absolute left-full ml-4 px-2 py-1 bg-on-surface text-surface text-[10px] font-bold rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
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
        <header className="bg-surface/80 backdrop-blur-md sticky top-0 z-40 px-6 py-3 flex justify-between items-center border-b border-outline-variant/10">
          <div className="flex items-center gap-4">
            {/* Mobile: hamburger opens settings panel */}
            <button
              className="md:hidden text-primary cursor-pointer p-1"
              onClick={() => setSettingsOpen(true)}
              aria-label="Settings"
            >
              <Menu size={24} />
            </button>
            <h1 className="text-xl font-extrabold text-primary tracking-tight">Ali Mobile Repair POS</h1>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => window.location.reload()}
              className="p-2.5 rounded-xl bg-surface-container-high text-on-surface-variant hover:text-primary hover:bg-primary/10 transition-all active:rotate-180 group relative mr-2"
              title="Refresh App"
            >
              <RotateCw size={18} />
              <span className="absolute top-full right-0 mt-2 px-2 py-1 bg-on-surface text-surface text-[10px] font-bold rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                Refresh App
              </span>
            </button>

            <div className={`hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-widest mr-4 ${backendOk ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500 border border-red-500/20'}`}>
              <div className={`w-1.5 h-1.5 rounded-full ${backendOk ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
              {backendOk ? 'Server Active' : 'Server Offline'}
            </div>

            <div className="hidden sm:flex flex-col items-end mr-3">
              <span className="text-xs font-black text-on-surface uppercase tracking-wide">{currentUser?.username || t('nav', 'guest')}</span>
              <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">{currentUser?.role || t('nav', 'staff')}</span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-black uppercase text-lg border border-primary/20 shadow-inner">
              {(currentUser?.username || 'G').charAt(0)}
            </div>
          </div>
        </header>

        {/* View Content */}
        <main className="flex-1 p-4 md:p-8 pb-24 md:pb-8">
          <motion.div
            key={currentView}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {children}
          </motion.div>
        </main>

        {/* Bottom Nav - Mobile */}
        <nav className="md:hidden fixed bottom-0 left-0 w-full flex justify-around items-center px-4 pb-6 pt-2 bg-surface/90 backdrop-blur-lg border-t border-outline-variant/10 z-50">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            const showBadge = item.id === 'chat' && unreadChats > 0;
            return (
              <button
                key={item.id}
                onClick={() => onViewChange(item.id)}
                className={cn(
                  "flex flex-col items-center justify-center px-3 py-1.5 transition-all rounded-xl relative",
                  isActive
                    ? "bg-primary-container/10 text-primary scale-110"
                    : "text-on-surface-variant"
                )}
              >
                <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                {showBadge && (
                  <span className="absolute top-0 right-1 w-2 h-2 rounded-full bg-red-500" />
                )}
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
    </div>
  );
}
