import React from 'react';
import { 
  LayoutDashboard, 
  Package, 
  BarChart3, 
  Users, 
  Settings, 
  Menu,
  Search,
  LogOut
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'motion/react';

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
  { id: 'settings', label: 'Settings', icon: Settings },
];

export function Layout({ children, currentView, onViewChange, onLogout, currentUser, t }: LayoutProps) {
  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex fixed left-0 top-0 h-full w-20 bg-surface-container-low flex-col items-center pt-10 pb-6 z-30 border-r border-outline-variant/10">
        <div className="mb-4">
          <div className="w-10 h-10 rounded-xl signature-gradient flex items-center justify-center text-white shadow-lg">
            <span className="font-headline font-black text-xl">P</span>
          </div>
        </div>
        <div className="flex flex-col gap-8 w-full items-center">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
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
                <span className="absolute left-full ml-4 px-2 py-1 bg-on-surface text-surface text-[10px] font-bold rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>

        {/* Desktop Logout Button */}
        {onLogout && (
          <div className="mt-auto w-full px-4 flex justify-center">
            <button
              onClick={onLogout}
              className="p-3 rounded-xl transition-all duration-200 relative group text-error hover:bg-error/10"
            >
              <LogOut size={24} strokeWidth={2} />
              <span className="absolute left-full ml-4 px-2 py-1 bg-error text-white text-[10px] font-bold rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                {t('nav', 'signOut')}
              </span>
            </button>
          </div>
        )}
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 md:ml-20 flex flex-col min-h-screen">
        {/* Top Bar */}
        <header className="bg-surface/80 backdrop-blur-md sticky top-0 z-40 px-6 py-3 flex justify-between items-center border-b border-outline-variant/10">
          <div className="flex items-center gap-4">
            <Menu className="text-primary md:hidden cursor-pointer" />
            <h1 className="text-xl font-extrabold text-primary tracking-tight">Ali Mobile Repair POS</h1>
          </div>
          <div className="flex items-center gap-3">
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
            return (
              <button
                key={item.id}
                onClick={() => onViewChange(item.id)}
                className={cn(
                  "flex flex-col items-center justify-center px-3 py-1.5 transition-all rounded-xl",
                  isActive 
                    ? "bg-primary-container/10 text-primary scale-110" 
                    : "text-on-surface-variant"
                )}
              >
                <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                <span className="text-[10px] font-bold uppercase tracking-wider mt-1">{item.label}</span>
              </button>
            );
          })}
          
          {/* Mobile Logout Button */}
          {onLogout && (
            <button
              onClick={onLogout}
              className="flex flex-col items-center justify-center px-3 py-1.5 transition-all rounded-xl text-error hover:bg-error/10"
            >
              <LogOut size={20} strokeWidth={2} />
              <span className="text-[10px] font-bold uppercase tracking-wider mt-1">Exit</span>
            </button>
          )}
        </nav>
      </div>
    </div>
  );
}
