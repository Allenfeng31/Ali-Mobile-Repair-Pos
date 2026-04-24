import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  Trash2, 
  Save, 
  Megaphone, 
  AlertCircle, 
  ChevronRight, 
  ArrowLeft,
  ToggleLeft,
  ToggleRight,
  GripVertical
} from 'lucide-react';
import { supabase } from '../lib/supabase';

interface Announcement {
  id: string;
  message: string;
  is_active: boolean;
  display_order: number;
  created_at: string;
}

interface StorefrontCMSProps {
  onBack: () => void;
}

export function StorefrontCMS({ onBack }: StorefrontCMSProps) {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('storefront_announcements')
      .select('*')
      .order('display_order', { ascending: true });

    if (error) {
      console.error('Error fetching announcements:', error);
      setError('Failed to load announcements');
    } else {
      setAnnouncements(data || []);
    }
    setLoading(false);
  };

  const handleAdd = async () => {
    const newAnnouncement = {
      message: 'New Announcement',
      is_active: true,
      display_order: announcements.length > 0 ? Math.max(...announcements.map(a => a.display_order)) + 1 : 0
    };

    const { data, error } = await supabase
      .from('storefront_announcements')
      .insert([newAnnouncement])
      .select();

    if (error) {
      console.error('Error adding announcement:', error);
    } else if (data) {
      setAnnouncements([...announcements, data[0]]);
    }
  };

  const handleUpdate = async (id: string, updates: Partial<Announcement>) => {
    setSaving(true);
    const { error } = await supabase
      .from('storefront_announcements')
      .update(updates)
      .eq('id', id);

    if (error) {
      console.error('Error updating announcement:', error);
      setError('Failed to update announcement');
    } else {
      setAnnouncements(announcements.map(a => a.id === id ? { ...a, ...updates } : a));
    }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this announcement?')) return;

    const { error } = await supabase
      .from('storefront_announcements')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting announcement:', error);
      setError('Failed to delete announcement');
    } else {
      setAnnouncements(announcements.filter(a => a.id !== id));
    }
  };

  const toggleActive = (id: string, current: boolean) => {
    handleUpdate(id, { is_active: !current });
  };

  return (
    <div className="p-8 max-w-5xl mx-auto h-full flex flex-col">
      <div className="flex items-center gap-6 mb-12">
        <button 
          onClick={onBack}
          className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-slate-600 hover:text-indigo-600 hover:shadow-lg transition-all border border-slate-200"
        >
          <ArrowLeft size={24} />
        </button>
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter">
            Storefront <span className="text-indigo-600 italic">CMS</span>
          </h1>
          <p className="text-slate-500 font-medium">Manage top announcement bar and promo carousel.</p>
        </div>
      </div>

      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Megaphone className="text-indigo-600" size={24} />
            Top Announcement Bar
          </h2>
          <button 
            onClick={handleAdd}
            className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100"
          >
            <Plus size={20} />
            Add Announcement
          </button>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 bg-slate-50 border-2 border-dashed border-slate-200 rounded-[2.5rem] text-slate-400 gap-4">
            <div className="w-10 h-10 border-4 border-indigo-600/20 border-t-indigo-600 rounded-full animate-spin" />
            <p className="font-bold">Loading contents...</p>
          </div>
        ) : announcements.length === 0 ? (
          <div className="text-center py-20 bg-slate-50 border-2 border-dashed border-slate-200 rounded-[2.5rem]">
            <Megaphone size={48} className="mx-auto mb-4 text-slate-300" />
            <h3 className="text-xl font-bold text-slate-900 mb-2">No active announcements</h3>
            <p className="text-slate-500 mb-8 max-w-sm mx-auto">Create your first announcement to show it on the top bar of your public storefront.</p>
            <button 
              onClick={handleAdd}
              className="text-indigo-600 font-bold hover:underline"
            >
              Get started by adding one →
            </button>
          </div>
        ) : (
          <div className="grid gap-4">
            <AnimatePresence>
              {announcements.map((item, index) => (
                <motion.div 
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-white border border-slate-200 rounded-3xl p-6 flex items-center gap-6 group hover:shadow-xl hover:border-indigo-100 transition-all"
                >
                  <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-300 group-hover:text-indigo-300 transition-colors cursor-grab active:cursor-grabbing">
                    <GripVertical size={20} />
                  </div>
                  
                  <div className="flex-1">
                    <input 
                      type="text" 
                      value={item.message}
                      onChange={(e) => setAnnouncements(announcements.map(a => a.id === item.id ? { ...a, message: e.target.value } : a))}
                      onBlur={(e) => handleUpdate(item.id, { message: e.target.value })}
                      className="w-full text-lg font-bold text-slate-900 bg-transparent border-none focus:ring-0 p-0 placeholder:text-slate-300"
                      placeholder="Enter announcement message..."
                    />
                    <div className="flex items-center gap-4 mt-2">
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 bg-slate-50 px-2 py-0.5 rounded-full">
                        Order #{item.display_order}
                      </span>
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 bg-slate-50 px-2 py-0.5 rounded-full">
                        Added {new Date(item.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => toggleActive(item.id, item.is_active)}
                      className={`p-3 rounded-2xl transition-all flex items-center gap-2 font-bold text-xs ${item.is_active ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100' : 'bg-slate-100 text-slate-400 hover:bg-slate-200'}`}
                    >
                      {item.is_active ? <ToggleRight size={20} /> : <ToggleLeft size={20} />}
                      {item.is_active ? 'ACTIVE' : 'INACTIVE'}
                    </button>
                    
                    <button 
                      onClick={() => handleDelete(item.id)}
                      className="p-3 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-2xl transition-all"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

        {error && (
          <div className="flex items-center gap-3 p-4 bg-rose-50 border border-rose-100 rounded-2xl text-rose-600 text-sm font-bold">
            <AlertCircle size={18} />
            {error}
          </div>
        )}
      </div>

      <div className="mt-12 p-8 bg-indigo-50 border border-indigo-100 rounded-[2.5rem]">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-white rounded-2xl text-indigo-600 shadow-sm border border-indigo-100">
            <AlertCircle size={24} />
          </div>
          <div>
            <h4 className="font-bold text-indigo-900 mb-1">Coming Soon: Visual Banner Editor</h4>
            <p className="text-indigo-700/70 text-sm leading-relaxed">
              We're currently building the visual editor for hero banners and promo cards. 
              Soon you'll be able to upload images directly and link them to repair categories.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
