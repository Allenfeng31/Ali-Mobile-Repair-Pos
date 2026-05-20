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
import { cn } from '../lib/utils';
import { getApiBaseUrl } from '../lib/apiBase';

const API_BASE = getApiBaseUrl();

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
      setNewPermissions(prev => ({
        ...prev,
        [key]: !prev[key]
      }));
      return;
    }

    setEmployees(prev => prev.map(emp => {
      if (emp.user_id === userId) {
        const updated = { ...emp, [key]: !emp[key] };
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
    { key: 'can_give_discount', label: 'Permit Discounts', icon: Percent, color: 'text-blue-600' },
    { key: 'can_change_inventory_price', label: 'Inventory Pricing', icon: Warehouse, color: 'text-orange-600' },
    { key: 'can_view_full_sales_report', label: 'Full Sales Reports', icon: FileBarChart, color: 'text-purple-600' },
    { key: 'can_delete_customers', label: 'Delete Customers', icon: UsersIcon, color: 'text-indigo-600' },
    { key: 'can_delete_chats', label: 'Delete Chats', icon: MessageCircle, color: 'text-pink-600' },
  ];

  return (
    <div className="h-full flex flex-col max-w-7xl mx-auto px-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-12">
        <div className="flex items-center gap-6">
          <button
            onClick={onBack}
            className="w-14 h-14 bg-[var(--color-neu-bg)] shadow-[var(--shadow-neu-flat)] rounded-2xl flex items-center justify-center text-gray-500 hover:text-blue-600 active:shadow-[var(--shadow-neu-pressed)] active:scale-95 transition-all border border-white/20"
          >
            <ArrowLeft size={24} strokeWidth={3} />
          </button>
          <div>
            <h1 className="text-5xl font-black text-black tracking-tight [text-shadow:-4px_4px_6px_var(--color-neu-shadow-dark)]">
              Staff <span className="text-blue-600 italic">Access</span>
            </h1>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-2 bg-white/50 px-4 py-1.5 rounded-full inline-block shadow-[var(--shadow-neu-sm)]">
              RBAC Control & Security Initialization
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-4 px-8 py-5 bg-blue-600 text-white rounded-3xl font-black text-sm uppercase tracking-widest shadow-[0_10px_20px_rgba(37,99,235,0.3)] hover:brightness-110 active:scale-95 transition-all"
        >
          <UserPlus size={20} strokeWidth={3} />
          New Employee
        </button>
      </div>

      {/* Employee List */}
      <div className="flex-1 overflow-y-auto space-y-8 pb-12 custom-scrollbar">
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-pulse">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-80 bg-[var(--color-neu-bg)] shadow-[var(--shadow-neu-flat)] rounded-[3rem]" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {employees.map((emp) => (
              <motion.div
                key={emp.user_id}
                layout
                className="bg-[var(--color-neu-bg)] shadow-[var(--shadow-neu-flat)] rounded-[3rem] p-10 flex flex-col border border-white/20 hover:shadow-[var(--shadow-neu-sm)] transition-all"
              >
                <div className="flex items-start justify-between mb-8">
                  <div className="flex items-center gap-6">
                    <div className="w-16 h-16 bg-[var(--color-neu-bg)] shadow-[var(--shadow-neu-pressed)] rounded-2xl flex items-center justify-center text-blue-600 font-black text-2xl border border-white/40">
                      {emp.email.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xl font-black text-black truncate max-w-[150px] tracking-tight">
                        {emp.email.replace('@pos.local', '')}
                      </span>
                      <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">
                        {emp.is_super_admin ? 'Super Admin' : 'Staff Member'}
                      </span>
                    </div>
                  </div>
                  {emp.is_super_admin && (
                    <div className="p-3 bg-amber-50 rounded-2xl shadow-[var(--shadow-neu-sm)] border border-amber-100">
                      <Shield className="text-amber-500" size={24} strokeWidth={3} />
                    </div>
                  )}
                </div>

                <div className="space-y-6 flex-1">
                  <div className="grid grid-cols-2 gap-4">
                    {permissionList.map((perm) => {
                      const isActive = emp[perm.key as keyof Employee];
                      return (
                        <button
                          key={perm.key}
                          onClick={() => handleTogglePerm(emp.user_id, perm.key as keyof Employee)}
                          className={cn(
                            "flex items-center gap-3 p-4 rounded-2xl transition-all border",
                            isActive
                              ? "bg-blue-50 border-blue-100 shadow-[var(--shadow-neu-pressed)] text-blue-600"
                              : "bg-[var(--color-neu-bg)] border-white/10 shadow-[var(--shadow-neu-sm)] text-gray-400 opacity-60"
                          )}
                        >
                          <perm.icon size={16} strokeWidth={isActive ? 3 : 2} />
                          <span className="text-[10px] font-black uppercase tracking-tight">{perm.label}</span>
                        </button>
                      );
                    })}
                  </div>

                  {emp.can_give_discount && (
                    <div className="pt-4 animate-in fade-in slide-in-from-top-4">
                      <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 pl-2">
                        Max Discount Limit ($)
                      </label>
                      <div className="bg-[var(--color-neu-bg)] shadow-[var(--shadow-neu-pressed)] rounded-2xl p-1.5 border border-black/5">
                        <input
                          type="number"
                          value={emp.max_discount_limit}
                          onChange={(e) => handleMaxDiscountChange(emp.user_id, e.target.value)}
                          className="w-full bg-transparent px-5 py-3.5 text-sm font-black text-black outline-none placeholder:text-gray-300"
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div className="mt-10 pt-8 border-t border-black/5 flex justify-between items-center text-[10px] font-black text-gray-400 uppercase tracking-widest">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    <span>Last Active: 2h ago</span>
                  </div>
                  <button className="text-red-500 hover:text-red-600 flex items-center gap-2 font-black">
                    <Lock size={12} strokeWidth={3} />
                    Reset
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
              className="absolute inset-0 bg-black/40 backdrop-blur-md"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-2xl bg-[var(--color-neu-bg)] rounded-[3.5rem] shadow-[var(--shadow-neu-flat)] border border-white/40 p-12 overflow-hidden"
            >
              <div className="flex items-center gap-6 mb-12">
                <div className="w-20 h-20 bg-[var(--color-neu-bg)] shadow-[var(--shadow-neu-pressed)] rounded-[1.5rem] flex items-center justify-center text-blue-600 border border-white/60">
                  <UserPlus size={40} strokeWidth={3} />
                </div>
                <div>
                  <h2 className="text-4xl font-black text-black tracking-tight">Onboard Staff</h2>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">Initialize Supabase Credentials</p>
                </div>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="ml-auto w-14 h-14 bg-[var(--color-neu-bg)] shadow-[var(--shadow-neu-flat)] rounded-full flex items-center justify-center text-gray-400 active:shadow-[var(--shadow-neu-pressed)] transition-all"
                >
                  <ArrowLeft size={24} strokeWidth={3} />
                </button>
              </div>

              <form onSubmit={handleCreateEmployee} className="space-y-10">
                <div className="grid grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-2">Username</label>
                    <div className="bg-[var(--color-neu-bg)] shadow-[var(--shadow-neu-pressed)] rounded-[2rem] p-1.5 border border-black/5 flex items-center px-4">
                      <Mail size={20} strokeWidth={3} className="text-gray-300 ml-2" />
                      <input
                        type="text"
                        value={newEmail}
                        onChange={(e) => setNewEmail(e.target.value)}
                        required
                        placeholder="e.g. admin"
                        className="w-full bg-transparent px-4 py-4 text-sm font-black text-black outline-none placeholder:text-gray-300"
                      />
                    </div>
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-2">Initial Password</label>
                    <div className="bg-[var(--color-neu-bg)] shadow-[var(--shadow-neu-pressed)] rounded-[2rem] p-1.5 border border-black/5 flex items-center px-4">
                      <Key size={20} strokeWidth={3} className="text-gray-300 ml-2" />
                      <input
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required
                        placeholder="••••••••"
                        className="w-full bg-transparent px-4 py-4 text-sm font-black text-black outline-none placeholder:text-gray-300"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-2">Policy Configuration</label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {permissionList.map((perm) => {
                      const isActive = newPermissions[perm.key as keyof Employee];
                      return (
                        <button
                          key={perm.key}
                          type="button"
                          onClick={() => handleTogglePerm(null, perm.key as keyof Employee)}
                          className={cn(
                            "flex items-center gap-3 p-5 rounded-2xl transition-all border",
                            isActive
                              ? "bg-blue-50 border-blue-200 shadow-[var(--shadow-neu-pressed)] text-blue-600"
                              : "bg-[var(--color-neu-bg)] border-white/20 shadow-[var(--shadow-neu-flat)] text-gray-400"
                          )}
                        >
                          <perm.icon size={18} strokeWidth={isActive ? 3 : 2} />
                          <span className="text-[10px] font-black uppercase tracking-tight">{perm.label}</span>
                        </button>
                      );
                    })}
                  </div>

                  {newPermissions.can_give_discount && (
                    <div className="pt-4 animate-in fade-in slide-in-from-top-4">
                      <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 pl-2">
                        Max Discount Limit ($)
                      </label>
                      <div className="bg-[var(--color-neu-bg)] shadow-[var(--shadow-neu-pressed)] rounded-[2rem] p-1.5 border border-black/5">
                        <input
                          type="number"
                          value={newPermissions.max_discount_limit}
                          onChange={(e) => handleMaxDiscountChange(null, e.target.value)}
                          className="w-full bg-transparent px-6 py-4 text-sm font-black text-black outline-none"
                        />
                      </div>
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-6 bg-blue-600 text-white rounded-[2rem] font-black uppercase tracking-[0.2em] shadow-[0_15px_30px_rgba(37,99,235,0.4)] hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-4"
                >
                  {isSubmitting ? <RotateCw className="animate-spin" size={24} strokeWidth={3} /> : <CheckCircle2 size={24} strokeWidth={3} />}
                  Create & Initialize Account
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

const RotateCw = ({ className, size, strokeWidth }: { className?: string, size?: number, strokeWidth?: number }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size || 24}
    height={size || 24}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={strokeWidth || 2}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    <polyline points="21 3 21 9 15 9" />
  </svg>
);
