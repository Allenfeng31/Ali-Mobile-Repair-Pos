import React from 'react';
import { Users, BarChart3, Settings, ShieldCheck, Database, MessageSquare } from 'lucide-react';
import { motion } from 'motion/react';
import { useAuthStore } from '../hooks/useAuthStore';

interface AdminCard {
  id: string;
  title: string;
  icon: React.ElementType;
  description: string;
  color: string;
  gradient: string;
  href?: string;
}

const adminCards: AdminCard[] = [
  {
    id: 'employees',
    title: 'Employee Management',
    icon: Users,
    description: 'Manage accounts and granular permissions.',
    color: 'text-blue-600',
    gradient: 'from-blue-500/10 to-blue-600/5',
    href: '/admin/employees',
  },
  {
    id: 'analytics',
    title: 'Sales Analytics',
    icon: BarChart3,
    description: 'Deep dive into revenue and performance.',
    color: 'text-purple-600',
    gradient: 'from-purple-500/10 to-purple-600/5',
    href: 'https://ali-mobile-repair-pos.vercel.app/dashboard/analytics',
  },
  {
    id: 'cms',
    title: 'Storefront CMS',
    icon: Database,
    description: 'Update banners, announcements, and blogs.',
    color: 'text-orange-600',
    gradient: 'from-orange-500/10 to-orange-600/5',
    href: '/admin/cms',
  },
  {
    id: 'security',
    title: 'Security Logs',
    icon: ShieldCheck,
    description: 'Review system access and audit trails.',
    color: 'text-emerald-600',
    gradient: 'from-emerald-500/10 to-emerald-600/5',
    href: '/admin/security',
  },
  {
    id: 'notifications',
    title: 'Global Messages',
    icon: MessageSquare,
    description: 'Send broadcast alerts to all terminals.',
    color: 'text-pink-600',
    gradient: 'from-pink-500/10 to-pink-600/5',
    href: '/admin/messages',
  },
  {
    id: 'system',
    title: 'System Settings',
    icon: Settings,
    description: 'Configure global POS parameters.',
    color: 'text-slate-600',
    gradient: 'from-slate-500/10 to-slate-600/5',
    href: '/admin/settings',
  },
];

export function AdminDashboard({ onViewChange }: { onViewChange: (view: string) => void }) {
  const { permissions } = useAuthStore();
  const [activeModule, setActiveModule] = React.useState<string | null>(null);

  if (!permissions?.is_super_admin) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center p-8 bg-error-container/10 border border-error/20 rounded-[2rem] max-w-md">
          <ShieldCheck className="mx-auto mb-4 text-error" size={48} />
          <h2 className="text-2xl font-black text-on-surface mb-2">Access Denied</h2>
          <p className="text-on-surface-variant">You do not have the required permissions to access the Admin Dashboard.</p>
        </div>
      </div>
    );
  }

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto h-full flex flex-col">
      <div className="mb-12">
        <h1 className="text-5xl font-black text-on-surface tracking-tighter mb-4">
          Admin <span className="text-primary italic">Dashboard</span>
        </h1>
        <p className="text-on-surface-variant max-w-2xl font-medium">
          Welcome to the high-level management hub. Control permissions, analyze performance, and manage your infrastructure from a single premium interface.
        </p>
      </div>

      <motion.div 
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-12"
      >
        {adminCards.map((card) => (
          <motion.button
            key={card.id}
            variants={item}
            onClick={() => {
              if (card.href?.startsWith('/admin/')) {
                const view = card.href.split('/').pop() || card.id;
                onViewChange(view);
              } else if (card.href) {
                window.location.href = card.href;
              } else {
                setActiveModule(card.id);
              }
            }}
            className="group relative flex flex-col items-start p-8 bg-surface-container-low rounded-[2.5rem] border border-outline-variant/10 shadow-sm hover:shadow-2xl hover:shadow-primary/5 hover:border-primary/20 transition-all text-left overflow-hidden no-tap-highlight"
          >
            {/* Background Decoration */}
            <div className={`absolute inset-0 bg-gradient-to-br ${card.gradient} opacity-0 group-hover:opacity-100 transition-opacity`} />
            
            <div className={`w-16 h-16 ${card.color} bg-white rounded-3xl flex items-center justify-center mb-6 shadow-inner border border-outline-variant/10 group-hover:scale-110 group-hover:rotate-3 transition-transform relative z-10`}>
              <card.icon size={32} strokeWidth={2.5} />
            </div>
            
            <h3 className="text-2xl font-black text-on-surface mb-3 group-hover:text-primary transition-colors relative z-10">
              {card.title}
            </h3>
            
            <p className="text-on-surface-variant font-medium leading-relaxed relative z-10">
              {card.description}
            </p>

            {/* Bottom Arrow Indicator */}
            <div className="mt-8 flex items-center gap-2 text-xs font-black uppercase tracking-widest text-primary opacity-0 group-hover:opacity-100 translate-x-4 group-hover:translate-x-0 transition-all relative z-10">
              Open Module
              <motion.span 
                animate={{ x: [0, 5, 0] }} 
                transition={{ repeat: Infinity, duration: 1.5 }}
              >
                →
              </motion.span>
            </div>
          </motion.button>
        ))}
      </motion.div>
    </div>
  );
}
