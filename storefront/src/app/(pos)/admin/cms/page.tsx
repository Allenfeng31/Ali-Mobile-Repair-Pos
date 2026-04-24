"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, Megaphone, Plus, Trash2, ToggleLeft, ToggleRight,
  GripVertical, AlertCircle, FileText, Pencil, Eye, EyeOff,
  Calendar, Loader2, BookOpen, ShoppingBag, DollarSign
} from 'lucide-react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import dynamic from 'next/dynamic';

// Lazy-load the blog editor (heavy TipTap bundle)
const BlogEditor = dynamic(() => import('@/components/admin/BlogEditor'), {
  loading: () => (
    <div className="fixed inset-0 bg-slate-50 z-50 flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <Loader2 size={32} className="animate-spin text-indigo-600" />
        <p className="text-slate-500 font-bold">Loading editor...</p>
      </div>
    </div>
  ),
  ssr: false,
});

// ═══════════════════════════════════════
// Types
// ═══════════════════════════════════════
interface Announcement {
  id: string;
  message: string;
  is_active: boolean;
  display_order: number;
  created_at: string;
}

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  content: string;
  description: string;
  cover_image: string;
  is_published: boolean;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

interface Upsell {
  id: string;
  name: string;
  description: string;
  regular_price: number;
  bundle_price: number;
  is_active: boolean;
  created_at: string;
}

// ═══════════════════════════════════════
// Main CMS Page
// ═══════════════════════════════════════
export default function StorefrontCMSPage() {
  // ── Announcement State ──────────────────
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loadingAnnouncements, setLoadingAnnouncements] = useState(true);
  const [announcementError, setAnnouncementError] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const [addingAnnouncement, setAddingAnnouncement] = useState(false);

  // ── Blog State ──────────────────────────
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [loadingBlogs, setLoadingBlogs] = useState(true);
  const [blogError, setBlogError] = useState<string | null>(null);
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);

  // ── Upsell State ───────────────────────
  const [upsells, setUpsells] = useState<Upsell[]>([]);
  const [loadingUpsells, setLoadingUpsells] = useState(true);
  const [upsellError, setUpsellError] = useState<string | null>(null);
  const [showAddUpsellForm, setShowAddUpsellForm] = useState(false);
  const [addingUpsell, setAddingUpsell] = useState(false);
  const [newUpsellName, setNewUpsellName] = useState('');
  const [newUpsellDescription, setNewUpsellDescription] = useState('');
  const [newUpsellRegularPrice, setNewUpsellRegularPrice] = useState('');
  const [newUpsellBundlePrice, setNewUpsellBundlePrice] = useState('');

  // ═══════════════════════════════════════
  // Data Fetching
  // ═══════════════════════════════════════
  useEffect(() => {
    fetchAnnouncements();
    fetchBlogPosts();
    fetchUpsells();
  }, []);

  const fetchAnnouncements = async () => {
    setLoadingAnnouncements(true);
    const { data, error } = await supabase
      .from('storefront_announcements')
      .select('*')
      .order('display_order', { ascending: true });

    if (error) {
      console.error('Error fetching announcements:', error);
      setAnnouncementError('Failed to load announcements');
    } else {
      setAnnouncements(data || []);
    }
    setLoadingAnnouncements(false);
  };

  const fetchBlogPosts = async () => {
    setLoadingBlogs(true);
    const { data, error } = await supabase
      .from('storefront_blogs')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching blog posts:', error);
      setBlogError('Failed to load blog posts. Make sure the storefront_blogs table exists.');
    } else {
      setBlogPosts(data || []);
    }
    setLoadingBlogs(false);
  };

  // ═══════════════════════════════════════
  // Announcement CRUD
  // ═══════════════════════════════════════
  const handleAddAnnouncement = async () => {
    if (!newMessage.trim()) return;

    setAddingAnnouncement(true);
    const newAnnouncement = {
      message: newMessage.trim(),
      is_active: true,
      display_order: announcements.length > 0
        ? Math.max(...announcements.map(a => a.display_order)) + 1
        : 0,
    };

    const { data, error } = await supabase
      .from('storefront_announcements')
      .insert([newAnnouncement])
      .select();

    if (error) {
      console.error('Error adding announcement:', error);
      setAnnouncementError('Failed to add announcement');
    } else if (data) {
      setAnnouncements([...announcements, data[0]]);
      setNewMessage('');
      setShowAddForm(false);
    }
    setAddingAnnouncement(false);
  };

  const handleUpdateAnnouncement = async (id: string, updates: Partial<Announcement>) => {
    const { error } = await supabase
      .from('storefront_announcements')
      .update(updates)
      .eq('id', id);

    if (error) {
      console.error('Error updating announcement:', error);
      setAnnouncementError('Failed to update announcement');
    } else {
      setAnnouncements(announcements.map(a => a.id === id ? { ...a, ...updates } : a));
    }
  };

  const handleDeleteAnnouncement = async (id: string) => {
    if (!confirm('Delete this announcement?')) return;

    const { error } = await supabase
      .from('storefront_announcements')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting announcement:', error);
      setAnnouncementError('Failed to delete announcement');
    } else {
      setAnnouncements(announcements.filter(a => a.id !== id));
    }
  };

  const toggleAnnouncementActive = (id: string, current: boolean) => {
    handleUpdateAnnouncement(id, { is_active: !current });
  };

  // ═══════════════════════════════════════
  // Blog CRUD
  // ═══════════════════════════════════════
  const handleDeleteBlogPost = async (id: string) => {
    if (!confirm('Delete this blog post permanently?')) return;

    const { error } = await supabase
      .from('storefront_blogs')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting blog post:', error);
      setBlogError('Failed to delete blog post');
    } else {
      setBlogPosts(blogPosts.filter(p => p.id !== id));
    }
  };

  const handleEditorSave = () => {
    setEditorOpen(false);
    setEditingPost(null);
    fetchBlogPosts();
  };

  // ═══════════════════════════════════════
  // Upsell CRUD
  // ═══════════════════════════════════════
  const fetchUpsells = async () => {
    setLoadingUpsells(true);
    const { data, error } = await supabase
      .from('storefront_upsells')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching upsells:', error);
      setUpsellError('Failed to load upsells. Make sure the storefront_upsells table exists.');
    } else {
      setUpsells(data || []);
    }
    setLoadingUpsells(false);
  };

  const handleAddUpsell = async () => {
    if (!newUpsellName.trim()) return;

    setAddingUpsell(true);
    const newItem = {
      name: newUpsellName.trim(),
      description: newUpsellDescription.trim(),
      regular_price: parseFloat(newUpsellRegularPrice) || 0,
      bundle_price: parseFloat(newUpsellBundlePrice) || 0,
      is_active: true,
    };

    const { data, error } = await supabase
      .from('storefront_upsells')
      .insert([newItem])
      .select();

    if (error) {
      console.error('Error adding upsell:', error);
      setUpsellError('Failed to add upsell');
    } else if (data) {
      setUpsells([data[0], ...upsells]);
      setNewUpsellName('');
      setNewUpsellDescription('');
      setNewUpsellRegularPrice('');
      setNewUpsellBundlePrice('');
      setShowAddUpsellForm(false);
    }
    setAddingUpsell(false);
  };

  const handleUpdateUpsell = async (id: string, updates: Partial<Upsell>) => {
    const { error } = await supabase
      .from('storefront_upsells')
      .update(updates)
      .eq('id', id);

    if (error) {
      console.error('Error updating upsell:', error);
      setUpsellError('Failed to update upsell');
    } else {
      setUpsells(upsells.map(u => u.id === id ? { ...u, ...updates } : u));
    }
  };

  const handleDeleteUpsell = async (id: string) => {
    if (!confirm('Delete this upsell item?')) return;

    const { error } = await supabase
      .from('storefront_upsells')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting upsell:', error);
      setUpsellError('Failed to delete upsell');
    } else {
      setUpsells(upsells.filter(u => u.id !== id));
    }
  };

  const toggleUpsellActive = (id: string, current: boolean) => {
    handleUpdateUpsell(id, { is_active: !current });
  };

  // ═══════════════════════════════════════
  // Blog Editor Overlay
  // ═══════════════════════════════════════
  if (editorOpen) {
    return (
      <BlogEditor
        post={editingPost}
        onSave={handleEditorSave}
        onCancel={() => { setEditorOpen(false); setEditingPost(null); }}
      />
    );
  }

  // ═══════════════════════════════════════
  // Render
  // ═══════════════════════════════════════
  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-6 mb-12">
          <Link
            href="/dashboard"
            className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-slate-600 hover:text-indigo-600 hover:shadow-lg transition-all border border-slate-200"
          >
            <ArrowLeft size={24} />
          </Link>
          <div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tighter">
              Storefront <span className="text-indigo-600 italic">CMS</span>
            </h1>
            <p className="text-slate-500 font-medium">Manage announcements and blog content.</p>
          </div>
        </div>

        {/* ═══════════════════════════════════════ */}
        {/* Section 1: Announcements */}
        {/* ═══════════════════════════════════════ */}
        <section className="mb-16">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <Megaphone className="text-indigo-600" size={24} />
              Top Announcement Bar
            </h2>
            <button
              onClick={() => setShowAddForm(true)}
              className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100"
            >
              <Plus size={20} />
              Add Announcement
            </button>
          </div>

          {/* Add Announcement Form */}
          <AnimatePresence>
            {showAddForm && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden mb-4"
              >
                <div className="bg-white border border-indigo-200 rounded-3xl p-6 flex items-center gap-4">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddAnnouncement()}
                    placeholder="Type your announcement message..."
                    autoFocus
                    className="flex-1 text-lg font-bold text-slate-900 bg-transparent border-none focus:ring-0 p-0 placeholder:text-slate-300 outline-none"
                  />
                  <button
                    onClick={handleAddAnnouncement}
                    disabled={addingAnnouncement || !newMessage.trim()}
                    className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-indigo-700 transition-all disabled:opacity-50"
                  >
                    {addingAnnouncement ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
                    Save
                  </button>
                  <button
                    onClick={() => { setShowAddForm(false); setNewMessage(''); }}
                    className="p-2.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-all"
                  >
                    <AlertCircle size={18} />
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Announcements List */}
          {loadingAnnouncements ? (
            <div className="flex flex-col items-center justify-center py-20 bg-white border-2 border-dashed border-slate-200 rounded-[2.5rem] text-slate-400 gap-4">
              <Loader2 size={32} className="animate-spin text-indigo-600" />
              <p className="font-bold">Loading announcements...</p>
            </div>
          ) : announcements.length === 0 ? (
            <div className="text-center py-20 bg-white border-2 border-dashed border-slate-200 rounded-[2.5rem]">
              <Megaphone size={48} className="mx-auto mb-4 text-slate-300" />
              <h3 className="text-xl font-bold text-slate-900 mb-2">No active announcements</h3>
              <p className="text-slate-500 mb-8 max-w-sm mx-auto">Create your first announcement to show it on the top bar of your public storefront.</p>
              <button
                onClick={() => setShowAddForm(true)}
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
                    <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-300 group-hover:text-indigo-300 transition-colors">
                      <GripVertical size={20} />
                    </div>

                    <div className="flex-1">
                      <input
                        type="text"
                        value={item.message}
                        onChange={(e) => setAnnouncements(announcements.map(a => a.id === item.id ? { ...a, message: e.target.value } : a))}
                        onBlur={(e) => handleUpdateAnnouncement(item.id, { message: e.target.value })}
                        className="w-full text-lg font-bold text-slate-900 bg-transparent border-none focus:ring-0 p-0 placeholder:text-slate-300 outline-none"
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
                        onClick={() => toggleAnnouncementActive(item.id, item.is_active)}
                        className={`p-3 rounded-2xl transition-all flex items-center gap-2 font-bold text-xs ${
                          item.is_active
                            ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
                            : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
                        }`}
                      >
                        {item.is_active ? <ToggleRight size={20} /> : <ToggleLeft size={20} />}
                        {item.is_active ? 'ACTIVE' : 'INACTIVE'}
                      </button>

                      <button
                        onClick={() => handleDeleteAnnouncement(item.id)}
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

          {announcementError && (
            <div className="flex items-center gap-3 p-4 bg-rose-50 border border-rose-100 rounded-2xl text-rose-600 text-sm font-bold mt-4">
              <AlertCircle size={18} />
              {announcementError}
            </div>
          )}
        </section>

        {/* ═══════════════════════════════════════ */}
        {/* Section 2: Blog Management */}
        {/* ═══════════════════════════════════════ */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <BookOpen className="text-indigo-600" size={24} />
              Blog Management
            </h2>
            <button
              onClick={() => { setEditingPost(null); setEditorOpen(true); }}
              className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100"
            >
              <Plus size={20} />
              New Blog Post
            </button>
          </div>

          {loadingBlogs ? (
            <div className="flex flex-col items-center justify-center py-20 bg-white border-2 border-dashed border-slate-200 rounded-[2.5rem] text-slate-400 gap-4">
              <Loader2 size={32} className="animate-spin text-indigo-600" />
              <p className="font-bold">Loading blog posts...</p>
            </div>
          ) : blogError ? (
            <div className="text-center py-16 bg-white border-2 border-dashed border-slate-200 rounded-[2.5rem]">
              <AlertCircle size={48} className="mx-auto mb-4 text-amber-400" />
              <h3 className="text-lg font-bold text-slate-900 mb-2">Blog Table Not Found</h3>
              <p className="text-slate-500 max-w-md mx-auto text-sm mb-6">
                Run the <code className="bg-slate-100 px-1.5 py-0.5 rounded text-indigo-600 font-bold">storefront_blogs.sql</code> script in your Supabase SQL Editor to create the table.
              </p>
            </div>
          ) : blogPosts.length === 0 ? (
            <div className="text-center py-20 bg-white border-2 border-dashed border-slate-200 rounded-[2.5rem]">
              <FileText size={48} className="mx-auto mb-4 text-slate-300" />
              <h3 className="text-xl font-bold text-slate-900 mb-2">No blog posts yet</h3>
              <p className="text-slate-500 mb-8 max-w-sm mx-auto">Start creating content for your storefront blog.</p>
              <button
                onClick={() => { setEditingPost(null); setEditorOpen(true); }}
                className="text-indigo-600 font-bold hover:underline"
              >
                Write your first post →
              </button>
            </div>
          ) : (
            <div className="grid gap-4">
              <AnimatePresence>
                {blogPosts.map((post, index) => (
                  <motion.div
                    key={post.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ delay: index * 0.05 }}
                    className="bg-white border border-slate-200 rounded-3xl p-6 flex items-center gap-6 group hover:shadow-xl hover:border-indigo-100 transition-all"
                  >
                    {/* Cover thumbnail */}
                    {post.cover_image ? (
                      <img
                        src={post.cover_image}
                        alt=""
                        className="w-16 h-16 rounded-2xl object-cover border border-slate-200 shrink-0"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center shrink-0">
                        <FileText size={24} className="text-slate-300" />
                      </div>
                    )}

                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-bold text-slate-900 truncate">{post.title}</h3>
                      <div className="flex items-center gap-3 mt-1.5">
                        <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${
                          post.is_published
                            ? 'bg-emerald-50 text-emerald-600'
                            : 'bg-amber-50 text-amber-600'
                        }`}>
                          {post.is_published ? 'Published' : 'Draft'}
                        </span>
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 bg-slate-50 px-2 py-0.5 rounded-full flex items-center gap-1">
                          <Calendar size={10} />
                          {post.published_at
                            ? new Date(post.published_at).toLocaleDateString()
                            : new Date(post.created_at).toLocaleDateString()
                          }
                        </span>
                        <span className="text-[10px] font-mono text-slate-400 bg-slate-50 px-2 py-0.5 rounded-full">
                          /blog/{post.slug}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => { setEditingPost(post); setEditorOpen(true); }}
                        className="p-3 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-2xl transition-all"
                        title="Edit post"
                      >
                        <Pencil size={18} />
                      </button>
                      <button
                        onClick={() => handleDeleteBlogPost(post.id)}
                        className="p-3 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-2xl transition-all"
                        title="Delete post"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}

          {blogError && !loadingBlogs && blogPosts.length > 0 && (
            <div className="flex items-center gap-3 p-4 bg-rose-50 border border-rose-100 rounded-2xl text-rose-600 text-sm font-bold mt-4">
              <AlertCircle size={18} />
              {blogError}
            </div>
          )}
        </section>

        {/* ═══════════════════════════════════════ */}
        {/* Section 3: Cart Upsells & Accessories  */}
        {/* ═══════════════════════════════════════ */}
        <section className="mt-16">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <ShoppingBag className="text-indigo-600" size={24} />
              Cart Upsells & Accessories
            </h2>
            <button
              onClick={() => setShowAddUpsellForm(true)}
              className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100"
            >
              <Plus size={20} />
              Add Upsell
            </button>
          </div>

          {/* Add Upsell Form */}
          <AnimatePresence>
            {showAddUpsellForm && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden mb-4"
              >
                <div className="bg-white border border-indigo-200 rounded-3xl p-6 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-1.5">Name *</label>
                      <input
                        type="text"
                        value={newUpsellName}
                        onChange={(e) => setNewUpsellName(e.target.value)}
                        placeholder="e.g. Premium Tempered Glass"
                        autoFocus
                        className="w-full text-base font-bold text-slate-900 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 placeholder:text-slate-300 outline-none focus:border-indigo-400 transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-1.5">Description</label>
                      <input
                        type="text"
                        value={newUpsellDescription}
                        onChange={(e) => setNewUpsellDescription(e.target.value)}
                        placeholder="e.g. Protect your screen from scratches"
                        className="w-full text-base font-bold text-slate-900 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 placeholder:text-slate-300 outline-none focus:border-indigo-400 transition-colors"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-1.5">Regular Price ($)</label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={newUpsellRegularPrice}
                        onChange={(e) => setNewUpsellRegularPrice(e.target.value)}
                        placeholder="39.99"
                        className="w-full text-base font-bold text-slate-900 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 placeholder:text-slate-300 outline-none focus:border-indigo-400 transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-1.5">Bundle Price ($)</label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={newUpsellBundlePrice}
                        onChange={(e) => setNewUpsellBundlePrice(e.target.value)}
                        placeholder="25.00"
                        className="w-full text-base font-bold text-slate-900 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 placeholder:text-slate-300 outline-none focus:border-indigo-400 transition-colors"
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-3 pt-2">
                    <button
                      onClick={handleAddUpsell}
                      disabled={addingUpsell || !newUpsellName.trim()}
                      className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-indigo-700 transition-all disabled:opacity-50"
                    >
                      {addingUpsell ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
                      Save Upsell
                    </button>
                    <button
                      onClick={() => { setShowAddUpsellForm(false); setNewUpsellName(''); setNewUpsellDescription(''); setNewUpsellRegularPrice(''); setNewUpsellBundlePrice(''); }}
                      className="p-2.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-all"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Upsells List */}
          {loadingUpsells ? (
            <div className="flex flex-col items-center justify-center py-20 bg-white border-2 border-dashed border-slate-200 rounded-[2.5rem] text-slate-400 gap-4">
              <Loader2 size={32} className="animate-spin text-indigo-600" />
              <p className="font-bold">Loading upsells...</p>
            </div>
          ) : upsellError && upsells.length === 0 ? (
            <div className="text-center py-16 bg-white border-2 border-dashed border-slate-200 rounded-[2.5rem]">
              <AlertCircle size={48} className="mx-auto mb-4 text-amber-400" />
              <h3 className="text-lg font-bold text-slate-900 mb-2">Upsells Table Not Found</h3>
              <p className="text-slate-500 max-w-md mx-auto text-sm mb-6">
                Run the <code className="bg-slate-100 px-1.5 py-0.5 rounded text-indigo-600 font-bold">storefront_upsells.sql</code> script in your Supabase SQL Editor to create the table.
              </p>
            </div>
          ) : upsells.length === 0 ? (
            <div className="text-center py-20 bg-white border-2 border-dashed border-slate-200 rounded-[2.5rem]">
              <ShoppingBag size={48} className="mx-auto mb-4 text-slate-300" />
              <h3 className="text-xl font-bold text-slate-900 mb-2">No upsell items yet</h3>
              <p className="text-slate-500 mb-8 max-w-sm mx-auto">Add accessories and add-ons that customers can bundle with their repair.</p>
              <button
                onClick={() => setShowAddUpsellForm(true)}
                className="text-indigo-600 font-bold hover:underline"
              >
                Add your first upsell →
              </button>
            </div>
          ) : (
            <div className="grid gap-4">
              <AnimatePresence>
                {upsells.map((item, index) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ delay: index * 0.05 }}
                    className="bg-white border border-slate-200 rounded-3xl p-6 flex items-center gap-6 group hover:shadow-xl hover:border-indigo-100 transition-all"
                  >
                    <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-400 shrink-0">
                      <DollarSign size={20} />
                    </div>

                    <div className="flex-1 min-w-0">
                      <input
                        type="text"
                        value={item.name}
                        onChange={(e) => setUpsells(upsells.map(u => u.id === item.id ? { ...u, name: e.target.value } : u))}
                        onBlur={(e) => handleUpdateUpsell(item.id, { name: e.target.value })}
                        className="w-full text-lg font-bold text-slate-900 bg-transparent border-none focus:ring-0 p-0 placeholder:text-slate-300 outline-none"
                        placeholder="Upsell name..."
                      />
                      <input
                        type="text"
                        value={item.description}
                        onChange={(e) => setUpsells(upsells.map(u => u.id === item.id ? { ...u, description: e.target.value } : u))}
                        onBlur={(e) => handleUpdateUpsell(item.id, { description: e.target.value })}
                        className="w-full text-sm text-slate-500 bg-transparent border-none focus:ring-0 p-0 mt-0.5 placeholder:text-slate-300 outline-none"
                        placeholder="Description..."
                      />
                      <div className="flex items-center gap-4 mt-2">
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 bg-slate-50 px-2 py-0.5 rounded-full">
                          RRP ${Number(item.regular_price).toFixed(2)}
                        </span>
                        <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                          Bundle ${Number(item.bundle_price).toFixed(2)}
                        </span>
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 bg-slate-50 px-2 py-0.5 rounded-full">
                          Added {new Date(item.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => toggleUpsellActive(item.id, item.is_active)}
                        className={`p-3 rounded-2xl transition-all flex items-center gap-2 font-bold text-xs ${
                          item.is_active
                            ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
                            : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
                        }`}
                      >
                        {item.is_active ? <ToggleRight size={20} /> : <ToggleLeft size={20} />}
                        {item.is_active ? 'ACTIVE' : 'INACTIVE'}
                      </button>

                      <button
                        onClick={() => handleDeleteUpsell(item.id)}
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

          {upsellError && !loadingUpsells && upsells.length > 0 && (
            <div className="flex items-center gap-3 p-4 bg-rose-50 border border-rose-100 rounded-2xl text-rose-600 text-sm font-bold mt-4">
              <AlertCircle size={18} />
              {upsellError}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
