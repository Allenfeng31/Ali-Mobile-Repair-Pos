import { create } from 'zustand';
import { supabase } from '../lib/supabase';

interface Permissions {
  is_super_admin: boolean;
  can_give_discount: boolean;
  max_discount_limit: number;
  can_change_inventory_price: boolean;
  can_view_full_sales_report: boolean;
  can_delete_customers: boolean;
  can_delete_chats: boolean;
}

interface AuthState {
  user: any | null;
  permissions: Permissions | null;
  isLoading: boolean;
  error: string | null;
  
  setUser: (user: any | null) => void;
  fetchPermissions: (userId: string) => Promise<void>;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  permissions: null,
  isLoading: true,
  error: null,

  setUser: (user) => set({ user }),

  fetchPermissions: async (userId: string) => {
    set({ isLoading: true, error: null });
    try {
      const { api } = await import('../lib/api');
      const data = await api.getPermissions(userId);
      set({ permissions: data || null, isLoading: false });
    } catch (err: any) {
      console.error('Error fetching permissions:', err);
      // Fallback to direct supabase in case backend is down
      try {
        const { data, error } = await supabase
          .from('employee_permissions')
          .select('*')
          .eq('user_id', userId)
          .maybeSingle();
        if (error) throw error;
        set({ permissions: data || null, isLoading: false });
      } catch (innerErr: any) {
        set({ error: err.message, isLoading: false });
      }
    }
  },

  logout: async () => {
    await supabase.auth.signOut();
    localStorage.removeItem('pos_session');
    set({ user: null, permissions: null });
  },
}));
