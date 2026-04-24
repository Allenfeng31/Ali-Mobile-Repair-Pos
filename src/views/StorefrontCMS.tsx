import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  Plus, 
  Trash2, 
  Edit2, 
  Save, 
  X, 
  GripVertical,
  CheckCircle2,
  AlertCircle,
  Megaphone,
  Layout
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { api } from '../lib/api';

interface Announcement {
  id: string;
  message: string;
  is_active: boolean;
  display_order: number;
}

interface StorefrontCMSProps {
  onBack: () => void;
}

export function StorefrontCMS({ onBack }: StorefrontCMSProps) {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ message: '', is_active: true, display_order: 0 });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    setIsLoading(true);
    try {
      const data = await api.getAnnouncements();
      setAnnouncements(data);
    } catch (err) {
      console.error('Failed to fetch announcements:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    try {
      setAnnouncements(prev => prev.map(a => a.id === id ? { ...a, is_active: !currentStatus } : a));
      await api.updateAnnouncement(id, { is_active: !currentStatus });
    } catch (err) {
      console.error('Failed to toggle status:', err);
      fetchAnnouncements(); // Rollback
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this announcement?')) return;
    try {
      setAnnouncements(prev => prev.filter(a => a.id !== id));
      await api.deleteAnnouncement(id);
    } catch (err) {
      console.error('Failed to delete announcement:', err);
      fetchAnnouncements(); // Rollback
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (editingId) {
        await api.updateAnnouncement(editingId, formData);
      } else {
        await api.createAnnouncement(formData);
      }
      await fetchAnnouncements();
      setShowAddModal(false);
      setEditingId(null);
      setFormData({ message: '', is_active: true, display_order: 0 });
    } catch (err) {
      console.error('Failed to save announcement:', err);
      alert('Failed to save announcement. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const openEditModal = (announcement: Announcement) => {
    setEditingId(announcement.id);
    setFormData({
      message: announcement.message,
      is_active: announcement.is_active,
      display_order: announcement.display_order
    });
    setShowAddModal(true);
  };

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
            <h1 className="text-4xl font-black text-on-surface tracking-tighter">Storefront <span className="text-primary italic">CMS</span></h1>
            <p className="text-on-surface-variant font-medium">Manage public-facing messages and top announcement banners.</p>
          </div>
        </div>
        
        <button 
          onClick={() => {
            setEditingId(null);
            setFormData({ message: '', is_active: true, display_order: announcements.length });
            setShowAddModal(true);
          }}
          className="flex items-center gap-2 px-6 py-4 bg-primary text-on-primary rounded-3xl font-black text-sm uppercase tracking-widest shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all"
        >
          <Plus size={18} />
          New Announcement
        </button>
      </div>

      {/* Announcements List */}
      <div className="flex-1 overflow-y-auto space-y-6 pb-12">
        {isLoading ? (
          <div className="grid grid-cols-1 gap-4 animate-pulse">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-24 bg-surface-container rounded-3xl" />
            ))}
          </div>
        ) : announcements.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-on-surface-variant/40 bg-surface-container-low rounded-[3rem] border border-dashed border-outline-variant/20">
            <Megaphone size={64} strokeWidth={1} className="mb-4" />
            <p className="text-lg font-black tracking-tight">No announcements found</p>
            <p className="font-medium">Create your first promo banner to appear on the storefront.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {announcements.map((announcement) => (
              <motion.div
                key={announcement.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-surface-container-low border border-outline-variant/10 rounded-3xl p-6 flex items-center gap-6 shadow-sm hover:shadow-md transition-all group"
              >
                <div className="text-on-surface-variant/20 cursor-grab active:cursor-grabbing p-1">
                  <GripVertical size={20} />
                </div>
                
                <div className={`w-12 h-12 flex-shrink-0 rounded-2xl flex items-center justify-center ${announcement.is_active ? 'bg-primary/10 text-primary' : 'bg-surface-container-high text-on-surface-variant/40'}`}>
                  <Megaphone size={24} />
                </div>

                <div className="flex-1">
                  <p className={`text-lg font-bold leading-tight ${announcement.is_active ? 'text-on-surface' : 'text-on-surface-variant/40 line-through'}`}>
                    {announcement.message}
                  </p>
                  <div className="flex items-center gap-4 mt-1">
                    <span className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant/60">
                      Order: {announcement.display_order}
                    </span>
                    <span className={`text-[10px] font-black uppercase tracking-widest ${announcement.is_active ? 'text-emerald-500' : 'text-on-surface-variant/40'}`}>
                      {announcement.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button 
                    onClick={() => handleToggleActive(announcement.id, announcement.is_active)}
                    className={`p-3 rounded-xl transition-all ${announcement.is_active ? 'text-amber-500 bg-amber-500/10 hover:bg-amber-500/20' : 'text-emerald-500 bg-emerald-500/10 hover:bg-emerald-500/20'}`}
                    title={announcement.is_active ? 'Deactivate' : 'Activate'}
                  >
                    <Layout size={18} />
                  </button>
                  <button 
                    onClick={() => openEditModal(announcement)}
                    className="p-3 text-primary bg-primary/10 rounded-xl hover:bg-primary/20 transition-all"
                    title="Edit"
                  >
                    <Edit2 size={18} />
                  </button>
                  <button 
                    onClick={() => handleDelete(announcement.id)}
                    className="p-3 text-error bg-error/10 rounded-xl hover:bg-error/20 transition-all"
                    title="Delete"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
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
              className="relative w-full max-w-xl bg-surface-container-low rounded-[3rem] border border-outline-variant/20 shadow-2xl p-10"
            >
              <div className="flex items-center gap-4 mb-8">
                <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center text-primary border border-primary/20">
                  <Megaphone size={32} />
                </div>
                <div>
                  <h2 className="text-3xl font-black text-on-surface tracking-tight">
                    {editingId ? 'Edit Announcement' : 'New Announcement'}
                  </h2>
                  <p className="text-on-surface-variant font-medium">Create a high-impact promo for your storefront.</p>
                </div>
                <button 
                  onClick={() => setShowAddModal(false)}
                  className="ml-auto w-12 h-12 rounded-full hover:bg-surface-container-high flex items-center justify-center text-on-surface-variant"
                >
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-8">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest pl-1">Message Content</label>
                  <textarea 
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    required
                    placeholder="e.g. 🔥 FLASH SALE: 20% OFF ALL SCREEN REPAIRS THIS WEEKEND!"
                    className="w-full bg-surface-container-high rounded-2xl px-6 py-4 text-sm font-bold text-on-surface outline-none focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-on-surface-variant/30 min-h-[120px] resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest pl-1">Display Order</label>
                    <input 
                      type="number"
                      value={formData.display_order}
                      onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) || 0 })}
                      className="w-full bg-surface-container-high rounded-2xl px-6 py-4 text-sm font-bold text-on-surface outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest pl-1">Status</label>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, is_active: !formData.is_active })}
                      className={`w-full flex items-center justify-center gap-3 rounded-2xl px-6 py-4 text-sm font-black uppercase tracking-widest transition-all ${formData.is_active ? 'bg-emerald-500/10 text-emerald-500' : 'bg-surface-container-high text-on-surface-variant/40'}`}
                    >
                      {formData.is_active ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
                      {formData.is_active ? 'Active' : 'Inactive'}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-5 bg-on-surface text-surface rounded-3xl font-black uppercase tracking-widest shadow-2xl hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-3"
                >
                  {isSubmitting ? <span className="w-5 h-5 border-2 border-surface border-t-transparent rounded-full animate-spin" /> : <Save size={20} />}
                  {editingId ? 'Update Promo' : 'Launch Announcement'}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
