import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  UserPlus, 
  Shield, 
  ChevronRight, 
  CheckCircle2, 
  Trash2,
  Lock,
  Mail,
  Key,
  Gamepad2, // Toggle icon
  Percent,
  Warehouse,
  FileBarChart,
  Users as UsersIcon,
  MessageCircle,
  Check
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { api } from '../lib/api';

const API_BASE = (() => {
  // @ts-ignore
  const env = import.meta.env;
  if (env?.PROD) return '/api';
  return env?.VITE_API_URL || 'http://localhost:3001/api';
})();

interface Employee {
  user_id: string;
  email: string;
  is_super_admin: boolean;
  can_give_discount: boolean;
  max_discount_limit: number;
  can_change_inventory_price: boolean;
  can_view_full_sales_report: boolean;
  can_delete_customers: boolean;
  can_delete_chats: boolean;
}

interface EmployeeManagementProps {
  onBack: () => void;
}

export function EmployeeManagement({ onBack }: EmployeeManagementProps) {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // New Employee Form State
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newPermissions, setNewPermissions] = useState<Partial<Employee>>({
    is_super_admin: false,
    can_give_discount: false,
    max_discount_limit: 0,
    can_change_inventory_price: false,
    can_view_full_sales_report: false,
    can_delete_customers: false,
    can_delete_chats: false,
  });

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    setIsLoading(true);
    try {
      // We'll need to add this to our api wrapper
      const res = await fetch(`${API_BASE}/admin/employees`);
      const data = await res.json();
      setEmployees(data);
    } catch (err) {
      console.error('Failed to fetch employees:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTogglePerm = (userId: string | null, key: keyof Employee) => {
    if (!userId) {
      // Handle for new employee form
      setNewPermissions(prev => ({
        ...prev,
        [key]: !prev[key]
      }));
      return;
    }

    // Handle for existing employee
    setEmployees(prev => prev.map(emp => {
      if (emp.user_id === userId) {
        const updated = { ...emp, [key]: !emp[key] };
        // Sync with server (debounce in production)
        updatePermissionOnServer(userId, { [key]: updated[key] });
        return updated;
      }
      return emp;
    }));
  };

  const updatePermissionOnServer = async (userId: string, permissions: Partial<Employee>) => {
    try {
      await fetch(`${API_BASE}/admin/employees/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ permissions })
      });
    } catch (err) {
      console.error('Failed to update permission:', err);
    }
  };

  const handleCreateEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      // Dummy Email Mapping Pattern
      const mappedEmail = newEmail.includes('@') ? newEmail : `${newEmail}@pos.local`;

      const res = await fetch(`${API_BASE}/admin/employees`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: mappedEmail,
          password: newPassword,
          permissions: newPermissions
        })
      });
      
      if (!res.ok) throw new Error('Failed to create account');
      
      await fetchEmployees();
      setShowAddModal(false);
      setNewEmail('');
      setNewPassword('');
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleMaxDiscountChange = (userId: string | null, value: string) => {
    const num = parseFloat(value) || 0;
    if (!userId) {
      setNewPermissions(prev => ({ ...prev, max_discount_limit: num }));
      return;
    }
    setEmployees(prev => prev.map(emp => {
      if (emp.user_id === userId) {
        const updated = { ...emp, max_discount_limit: num };
        updatePermissionOnServer(userId, { max_discount_limit: num });
        return updated;
      }
      return emp;
    }));
  };

  const permissionList = [
    { key: 'is_super_admin', label: 'Super Admin', icon: Shield, color: 'text-amber-500' },
    { key: 'can_give_discount', label: 'Permit Discounts', icon: Percent, color: 'text-blue-500' },
    { key: 'can_change_inventory_price', label: 'Inventory Pricing', icon: Warehouse, color: 'text-orange-500' },
    { key: 'can_view_full_sales_report', label: 'Full Sales Reports', icon: FileBarChart, color: 'text-purple-500' },
    { key: 'can_delete_customers', label: 'Delete Customers', icon: UsersIcon, color: 'text-indigo-500' },
    { key: 'can_delete_chats', label: 'Delete Chats', icon: MessageCircle, color: 'text-pink-500' },
  ];

  return (
    <div className="h-full flex flex-col max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-6">
          <button 
            onClick={onBack}
            className="w-12 h-12 bg-surface-container-high rounded-2xl flex items-center justify-center text-on-surface-variant hover:text-primary hover:bg-primary/10 transition-all"
          >
            <ArrowLeft size={24} />
          </button>
          <div>
            <h1 className="text-4xl font-black text-on-surface tracking-tighter">Employee <span className="text-primary italic">Management</span></h1>
            <p className="text-on-surface-variant font-medium">Control platform-wide access and create secure staff accounts.</p>
          </div>
        </div>
        
        <button 
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-6 py-4 bg-primary text-on-primary rounded-3xl font-black text-sm uppercase tracking-widest shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all"
        >
          <UserPlus size={18} />
          New Employee
        </button>
      </div>

      {/* Employee List */}
      <div className="flex-1 overflow-y-auto space-y-6 pb-12">
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-64 bg-surface-container rounded-[2.5rem]" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {employees.map((emp) => (
              <motion.div
                key={emp.user_id}
                layoutId={emp.user_id}
                className="bg-surface-container-low border border-outline-variant/10 rounded-[2.5rem] p-8 flex flex-col shadow-sm hover:shadow-xl transition-all"
              >
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center text-primary font-black text-xl border border-primary/20">
                      {emp.email.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex flex-col">
                      <span className="font-black text-on-surface truncate max-w-[150px]">
                        {emp.email.replace('@pos.local', '')}
                      </span>
                      <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">
                        {emp.is_super_admin ? 'Super Admin' : 'Staff Member'}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {emp.is_super_admin && <Shield className="text-amber-500" size={20} />}
                  </div>
                </div>

                <div className="space-y-4 flex-1">
                  <div className="grid grid-cols-2 gap-3">
                    {permissionList.map((perm) => {
                      const isActive = emp[perm.key as keyof Employee];
                      return (
                        <button
                          key={perm.key}
                          onClick={() => handleTogglePerm(emp.user_id, perm.key as keyof Employee)}
                          className={`flex items-center gap-2 p-3 rounded-2xl border transition-all ${
                            isActive 
                              ? 'bg-primary/5 border-primary/20 text-primary' 
                              : 'bg-surface-container-high border-transparent text-on-surface-variant'
                          }`}
                        >
                          <perm.icon size={14} className={isActive ? perm.color : 'text-on-surface-variant/40'} />
                          <span className="text-[10px] font-black uppercase tracking-tight">{perm.label}</span>
                          {isActive && <Check size={12} className="ml-auto" />}
                        </button>
                      );
                    })}
                  </div>

                  {emp.can_give_discount && (
                    <div className="pt-2 animate-in fade-in slide-in-from-top-2">
                      <label className="block text-[10px] font-black text-on-surface-variant uppercase tracking-widest mb-2 pl-1">
                        Max Discount Limit ($)
                      </label>
                      <input 
                        type="number"
                        value={emp.max_discount_limit}
                        onChange={(e) => handleMaxDiscountChange(emp.user_id, e.target.value)}
                        className="w-full bg-surface-container-high rounded-xl px-4 py-2.5 text-xs font-bold text-on-surface outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                      />
                    </div>
                  )}
                </div>

                <div className="mt-8 pt-6 border-t border-outline-variant/10 flex justify-between items-center text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">
                  <span>Last Active: 2h ago</span>
                  <button className="text-error hover:underline flex items-center gap-1">
                    <Lock size={12} />
                    Reset Password
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Add Employee Modal */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              onClick={() => setShowAddModal(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-xl" 
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-2xl bg-surface-container-low rounded-[3rem] border border-outline-variant/20 shadow-2xl p-10 overflow-hidden"
            >
              <div className="flex items-center gap-4 mb-8">
                <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center text-primary border border-primary/20">
                  <UserPlus size={32} />
                </div>
                <div>
                  <h2 className="text-3xl font-black text-on-surface tracking-tight">Onboard Staff</h2>
                  <p className="text-on-surface-variant font-medium">Create a secure Supabase Auth account.</p>
                </div>
                <button 
                  onClick={() => setShowAddModal(false)}
                  className="ml-auto w-12 h-12 rounded-full hover:bg-surface-container-high flex items-center justify-center text-on-surface-variant"
                >
                  <ArrowLeft size={24} />
                </button>
              </div>

              <form onSubmit={handleCreateEmployee} className="space-y-8">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest pl-1">Username</label>
                    <div className="relative">
                      <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant/40" />
                      <input 
                        type="text"
                        value={newEmail}
                        onChange={(e) => setNewEmail(e.target.value)}
                        required
                        placeholder="e.g. admin, allen"
                        className="w-full bg-surface-container-high rounded-2xl pl-12 pr-4 py-4 text-sm font-bold text-on-surface outline-none focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-on-surface-variant/30"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest pl-1">Initial Password</label>
                    <div className="relative">
                      <Key size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant/40" />
                      <input 
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required
                        placeholder="••••••••"
                        className="w-full bg-surface-container-high rounded-2xl pl-12 pr-4 py-4 text-sm font-bold text-on-surface outline-none focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-on-surface-variant/30"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest pl-1">Initial Permissions</label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {permissionList.map((perm) => {
                      const isActive = newPermissions[perm.key as keyof Employee];
                      return (
                        <button
                          key={perm.key}
                          type="button"
                          onClick={() => handleTogglePerm(null, perm.key as keyof Employee)}
                          className={`flex items-center gap-3 p-4 rounded-2xl border transition-all ${
                            isActive 
                              ? 'bg-primary/10 border-primary/30 text-primary shadow-sm' 
                              : 'bg-surface-container-high border-transparent text-on-surface-variant hover:bg-surface-container-highest'
                          }`}
                        >
                          <perm.icon size={16} className={isActive ? perm.color : 'text-on-surface-variant/40'} />
                          <span className="text-[10px] font-black uppercase tracking-tight">{perm.label}</span>
                        </button>
                      );
                    })}
                  </div>
                  
                  {newPermissions.can_give_discount && (
                     <div className="pt-2 animate-in fade-in slide-in-from-top-2">
                      <label className="block text-[10px] font-black text-on-surface-variant uppercase tracking-widest mb-2 pl-1">
                        Max Discount Limit ($)
                      </label>
                      <input 
                        type="number"
                        value={newPermissions.max_discount_limit}
                        onChange={(e) => handleMaxDiscountChange(null, e.target.value)}
                        className="w-full bg-surface-container-high rounded-2xl px-4 py-3.5 text-sm font-bold text-on-surface outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                      />
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-5 bg-on-surface text-surface rounded-3xl font-black uppercase tracking-widest shadow-2xl hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-3"
                >
                  {isSubmitting ? <RotateCw className="animate-spin" size={20} /> : <CheckCircle2 size={20} />}
                  Create Account & Initialize RBAC
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Support for spin animation if not globally available
const RotateCw = ({ className, size }: { className?: string, size?: number }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width={size || 24} 
    height={size || 24} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    <polyline points="21 3 21 9 15 9" />
  </svg>
);
