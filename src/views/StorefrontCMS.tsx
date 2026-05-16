import React, { useState, useEffect, useCallback, lazy, Suspense } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, 
  Trash2, 
  Megaphone, 
  AlertCircle, 
  ArrowLeft,
  ToggleLeft,
  ToggleRight,
  GripVertical,
  FileText,
  Pencil,
  Calendar,
  BookOpen,
  Loader2,
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Code,
  Link as LinkIcon,
  Image as ImageIcon,
  Undo,
  Redo,
  Save,
  Send,
  X,
  Unlink,
  ShoppingBag,
  DollarSign
} from 'lucide-react';
import { supabase } from '../lib/supabase';

// ── Types ─────────────────────────────────────────
interface Announcement {
  id: string;
  message: string;
  is_active: boolean;
  display_order: number;
  created_at: string;
}

interface BlogPost {
  id?: string;
  title: string;
  slug: string;
  content: string;
  description: string;
  cover_image: string;
  is_published: boolean;
  published_at: string | null;
  created_at?: string;
  updated_at?: string;
}

interface StorefrontCMSProps {
  onBack: () => void;
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

// ── Slugify ───────────────────────────────────────
function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

// ═══════════════════════════════════════════════════
// Blog Editor Component (inline, uses TipTap)
// ═══════════════════════════════════════════════════
function BlogEditorInline({ 
  post, 
  onSave, 
  onCancel 
}: { 
  post?: BlogPost | null; 
  onSave: () => void; 
  onCancel: () => void; 
}) {
  const [title, setTitle] = useState(post?.title || '');
  const [slug, setSlug] = useState(post?.slug || '');
  const [description, setDescription] = useState(post?.description || '');
  const [coverImage, setCoverImage] = useState(post?.cover_image || '');
  const [isPublished] = useState(post?.is_published || false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);
  const [editorReady, setEditorReady] = useState(false);
  const [editorRef, setEditorRef] = useState<any>(null);

  // Auto-generate slug from title
  useEffect(() => {
    if (!slugManuallyEdited && !post?.id) {
      setSlug(slugify(title));
    }
  }, [title, slugManuallyEdited, post?.id]);

  // Lazy-load TipTap to avoid blocking initial render
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [
          { useEditor, EditorContent },
          { default: StarterKit },
          { default: TipTapImage },
          { default: TipTapLink },
          { default: TipTapUnderline },
          { default: TipTapPlaceholder }
        ] = await Promise.all([
          import('@tiptap/react'),
          import('@tiptap/starter-kit'),
          import('@tiptap/extension-image'),
          import('@tiptap/extension-link'),
          import('@tiptap/extension-underline'),
          import('@tiptap/extension-placeholder')
        ]);

        if (cancelled) return;

        // Store module refs for rendering
        setEditorRef({ useEditor, EditorContent, StarterKit, TipTapImage, TipTapLink, TipTapUnderline, TipTapPlaceholder });
        setEditorReady(true);
      } catch (err) {
        console.error('Failed to load TipTap:', err);
        setError('Failed to load editor. Please refresh.');
      }
    })();
    return () => { cancelled = true; };
  }, []);

  if (!editorReady) {
    return (
      <div className="fixed inset-0 bg-surface z-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-blue-500/20 border-t-primary rounded-full animate-spin" />
          <p className="text-zinc-400 font-bold">Loading editor...</p>
        </div>
      </div>
    );
  }

  return (
    <TipTapEditorWrapper
      editorModules={editorRef}
      post={post}
      title={title}
      setTitle={setTitle}
      slug={slug}
      setSlug={setSlug}
      description={description}
      setDescription={setDescription}
      coverImage={coverImage}
      setCoverImage={setCoverImage}
      isPublished={isPublished}
      saving={saving}
      setSaving={setSaving}
      uploading={uploading}
      setUploading={setUploading}
      error={error}
      setError={setError}
      setSlugManuallyEdited={setSlugManuallyEdited}
      onSave={onSave}
      onCancel={onCancel}
    />
  );
}

// ── TipTap Editor Wrapper (rendered after modules load) ──
function TipTapEditorWrapper({
  editorModules,
  post,
  title, setTitle,
  slug, setSlug,
  description, setDescription,
  coverImage, setCoverImage,
  isPublished,
  saving, setSaving,
  uploading, setUploading,
  error, setError,
  setSlugManuallyEdited,
  onSave,
  onCancel
}: any) {
  const { useEditor, EditorContent, StarterKit, TipTapImage, TipTapLink, TipTapUnderline, TipTapPlaceholder } = editorModules;

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: { levels: [1, 2, 3] } }),
      TipTapImage.configure({
        HTMLAttributes: {
          class: 'blog-inline-image',
          style: 'max-width: 100%; height: auto; border-radius: 12px; margin: 1.5rem 0;',
        },
      }),
      TipTapLink.configure({
        openOnClick: false,
        HTMLAttributes: { style: 'color: #2563eb; font-weight: 600; text-decoration: underline;' },
      }),
      TipTapUnderline,
      TipTapPlaceholder.configure({ placeholder: 'Start writing your blog post...' }),
    ],
    content: post?.content || '',
  });

  const handleImageUpload = useCallback(async () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async (e: any) => {
      const file = e.target?.files?.[0];
      if (!file || !editor) return;
      setUploading(true);
      try {
        const fileName = `${Date.now()}-${file.name.replace(/\s+/g, '-')}`;
        const { data, error: uploadError } = await supabase.storage
          .from('blog-images')
          .upload(fileName, file, { cacheControl: '3600', upsert: false });
        if (uploadError) throw uploadError;
        const { data: urlData } = supabase.storage.from('blog-images').getPublicUrl(data.path);
        editor.chain().focus().setImage({ src: urlData.publicUrl }).run();
      } catch (err: any) {
        setError(`Image upload failed: ${err.message}`);
      } finally {
        setUploading(false);
      }
    };
    input.click();
  }, [editor]);

  const handleCoverImageUpload = useCallback(async () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async (e: any) => {
      const file = e.target?.files?.[0];
      if (!file) return;
      setUploading(true);
      try {
        const fileName = `covers/${Date.now()}-${file.name.replace(/\s+/g, '-')}`;
        const { data, error: uploadError } = await supabase.storage
          .from('blog-images')
          .upload(fileName, file, { cacheControl: '3600', upsert: false });
        if (uploadError) throw uploadError;
        const { data: urlData } = supabase.storage.from('blog-images').getPublicUrl(data.path);
        setCoverImage(urlData.publicUrl);
      } catch (err: any) {
        setError(`Cover upload failed: ${err.message}`);
      } finally {
        setUploading(false);
      }
    };
    input.click();
  }, []);

  const handleLink = useCallback(() => {
    if (!editor) return;
    if (editor.isActive('link')) { editor.chain().focus().unsetLink().run(); return; }
    const url = window.prompt('Enter URL:');
    if (url) editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  }, [editor]);

  const handleSave = async (publish: boolean) => {
    if (!title.trim() || !slug.trim()) { setError('Title and slug are required.'); return; }
    setSaving(true);
    setError(null);
    const postData = {
      title: title.trim(),
      slug: slug.trim(),
      content: editor?.getHTML() || '',
      description: description.trim(),
      cover_image: coverImage.trim(),
      is_published: publish,
      published_at: publish ? new Date().toISOString() : null,
      updated_at: new Date().toISOString(),
    };
    try {
      if (post?.id) {
        const { error: e } = await supabase.from('storefront_blogs').update(postData).eq('id', post.id);
        if (e) throw e;
      } else {
        const { error: e } = await supabase.from('storefront_blogs').insert([postData]);
        if (e) throw e;
      }
      onSave();
    } catch (err: any) {
      setError(`Save failed: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  if (!editor) return null;

  // Toolbar button helper
  const TB = ({ onClick, isActive = false, disabled = false, children, title: t }: any) => (
    <button type="button" onClick={onClick} disabled={disabled} title={t}
      className={`p-2 rounded-2xl transition-all ${isActive ? 'bg-blue-500/10 text-blue-500' : 'text-zinc-400 hover:text-white hover:bg-zinc-900'} ${disabled ? 'opacity-30 cursor-not-allowed' : ''}`}>
      {children}
    </button>
  );

  return (
    <div className="fixed inset-0 bg-surface z-50 overflow-y-auto">
      {/* Top Bar */}
      <div className="sticky top-0 z-10 bg-surface/80 backdrop-blur-xl border-b border-zinc-800/20">
        <div className="max-w-5xl mx-auto px-6 py-3 flex items-center justify-between">
          <button onClick={onCancel} className="flex items-center gap-2 text-zinc-400 hover:text-white font-bold transition-colors">
            <ArrowLeft size={20} /> Back to CMS
          </button>
          <div className="flex items-center gap-3">
            {error && <span className="text-red-500 text-sm font-bold mr-2">{error}</span>}
            <button onClick={() => handleSave(false)} disabled={saving}
              className="flex items-center gap-2 px-5 py-2.5 bg-zinc-900 hover:bg-zinc-800 text-white rounded-2xl font-bold text-sm transition-all disabled:opacity-50">
              {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />} Save Draft
            </button>
            <button onClick={() => handleSave(true)} disabled={saving}
              className="flex items-center gap-2 px-5 py-2.5 bg-blue-500 hover:bg-blue-500/90 text-white rounded-2xl font-bold text-sm transition-all shadow-lg disabled:opacity-50">
              {saving ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
              {isPublished ? 'Update & Publish' : 'Publish'}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-8">
        {/* Meta Fields */}
        <div className="bg-zinc-900/50 rounded-3xl border border-zinc-800/10 p-8 mb-6">
          <div className="grid gap-5">
            <div>
              <label className="block text-xs font-black uppercase tracking-widest text-zinc-400 mb-2">Title</label>
              <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Your blog post title..."
                className="w-full text-2xl font-black text-white bg-transparent border-none focus:ring-0 p-0 placeholder:text-outline outline-none" />
            </div>
            <div>
              <label className="block text-xs font-black uppercase tracking-widest text-zinc-400 mb-2">Slug</label>
              <div className="flex items-center gap-2">
                <span className="text-zinc-400 text-sm font-mono">/blog/</span>
                <input type="text" value={slug} onChange={(e) => { setSlug(e.target.value); setSlugManuallyEdited(true); }}
                  placeholder="url-friendly-slug"
                  className="flex-1 text-sm font-mono text-white bg-zinc-900 border border-zinc-800/20 rounded-2xl px-3 py-2 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/30 outline-none" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-black uppercase tracking-widest text-zinc-400 mb-2">Description / Excerpt</label>
              <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="A brief summary for SEO..."
                rows={2} className="w-full text-sm text-white bg-zinc-900 border border-zinc-800/20 rounded-2xl px-4 py-3 focus:ring-2 focus:ring-blue-500/20 outline-none resize-none" />
            </div>
            <div>
              <label className="block text-xs font-black uppercase tracking-widest text-zinc-400 mb-2">Cover Image</label>
              <div className="flex items-center gap-4">
                {coverImage && (
                  <div className="relative group">
                    <img src={coverImage} alt="Cover" className="h-20 w-32 object-cover rounded-2xl border border-zinc-800/20" />
                    <button onClick={() => setCoverImage('')}
                      className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <X size={12} />
                    </button>
                  </div>
                )}
                <button onClick={handleCoverImageUpload} disabled={uploading}
                  className="flex items-center gap-2 px-4 py-2.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 rounded-2xl text-sm font-bold transition-all">
                  <ImageIcon size={16} /> {uploading ? 'Uploading...' : coverImage ? 'Change Image' : 'Upload Cover'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Editor */}
        <div className="bg-zinc-900/50 rounded-3xl border border-zinc-800/10 overflow-hidden">
          {/* Toolbar */}
          <div className="border-b border-zinc-800/20 px-4 py-2 flex items-center gap-1 flex-wrap bg-zinc-900/50">
            <TB onClick={() => editor.chain().focus().toggleBold().run()} isActive={editor.isActive('bold')} title="Bold"><Bold size={16} /></TB>
            <TB onClick={() => editor.chain().focus().toggleItalic().run()} isActive={editor.isActive('italic')} title="Italic"><Italic size={16} /></TB>
            <TB onClick={() => editor.chain().focus().toggleUnderline().run()} isActive={editor.isActive('underline')} title="Underline"><UnderlineIcon size={16} /></TB>
            <div className="w-px h-6 bg-outline-variant/20 mx-1" />
            <TB onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} isActive={editor.isActive('heading', { level: 1 })} title="H1"><Heading1 size={16} /></TB>
            <TB onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} isActive={editor.isActive('heading', { level: 2 })} title="H2"><Heading2 size={16} /></TB>
            <TB onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} isActive={editor.isActive('heading', { level: 3 })} title="H3"><Heading3 size={16} /></TB>
            <div className="w-px h-6 bg-outline-variant/20 mx-1" />
            <TB onClick={() => editor.chain().focus().toggleBulletList().run()} isActive={editor.isActive('bulletList')} title="Bullet List"><List size={16} /></TB>
            <TB onClick={() => editor.chain().focus().toggleOrderedList().run()} isActive={editor.isActive('orderedList')} title="Ordered List"><ListOrdered size={16} /></TB>
            <TB onClick={() => editor.chain().focus().toggleBlockquote().run()} isActive={editor.isActive('blockquote')} title="Blockquote"><Quote size={16} /></TB>
            <TB onClick={() => editor.chain().focus().toggleCodeBlock().run()} isActive={editor.isActive('codeBlock')} title="Code"><Code size={16} /></TB>
            <div className="w-px h-6 bg-outline-variant/20 mx-1" />
            <TB onClick={handleLink} isActive={editor.isActive('link')} title={editor.isActive('link') ? 'Remove Link' : 'Add Link'}>
              {editor.isActive('link') ? <Unlink size={16} /> : <LinkIcon size={16} />}
            </TB>
            <TB onClick={handleImageUpload} disabled={uploading} title="Insert Image"><ImageIcon size={16} /></TB>
            <div className="w-px h-6 bg-outline-variant/20 mx-1" />
            <TB onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()} title="Undo"><Undo size={16} /></TB>
            <TB onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()} title="Redo"><Redo size={16} /></TB>
            {uploading && <span className="ml-3 text-xs text-blue-500 font-bold flex items-center gap-1"><Loader2 size={12} className="animate-spin" /> Uploading...</span>}
          </div>
          {/* Editor Area */}
          <EditorContent editor={editor} />
          <style>{`
            .tiptap { min-height: 400px; padding: 1.5rem; font-size: 1.05rem; line-height: 1.8; color: var(--on-surface, #1e293b); }
            .tiptap:focus { outline: none; }
            .tiptap p.is-editor-empty:first-child::before { color: #94a3b8; content: attr(data-placeholder); float: left; height: 0; pointer-events: none; }
            .tiptap h1 { font-size: 2rem; font-weight: 900; margin: 1.5rem 0 0.75rem; }
            .tiptap h2 { font-size: 1.5rem; font-weight: 800; margin: 1.25rem 0 0.6rem; }
            .tiptap h3 { font-size: 1.25rem; font-weight: 700; margin: 1rem 0 0.5rem; }
            .tiptap p { margin-bottom: 0.75rem; }
            .tiptap ul, .tiptap ol { padding-left: 1.5rem; margin-bottom: 1rem; }
            .tiptap li { margin-bottom: 0.25rem; }
            .tiptap blockquote { border-left: 4px solid var(--primary, #6366f1); padding: 0.75rem 1.25rem; margin: 1rem 0; background: var(--surface-container, #f1f5f9); border-radius: 0 12px 12px 0; font-style: italic; }
            .tiptap pre { background: #1e293b; color: #e2e8f0; padding: 1rem; border-radius: 12px; font-family: monospace; font-size: 0.9rem; overflow-x: auto; margin: 1rem 0; }
            .tiptap code { background: var(--surface-container, #f1f5f9); padding: 0.15rem 0.4rem; border-radius: 4px; font-size: 0.9em; }
            .tiptap pre code { background: none; color: inherit; padding: 0; }
            .tiptap img { max-width: 100%; height: auto; border-radius: 12px; margin: 1.5rem 0; }
            .tiptap a { color: #2563eb; font-weight: 600; text-decoration: underline; }
            .tiptap strong { font-weight: 800; }
          `}</style>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════
// Main CMS Page
// ═══════════════════════════════════════════════════
export function StorefrontCMS({ onBack }: StorefrontCMSProps) {
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

  // ═══════════════════════════════════════
  // Data Fetching
  // ═══════════════════════════════════════
  useEffect(() => {
    fetchAnnouncements();
    fetchBlogPosts();
    fetchUpsells();
  }, []);

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
      setBlogError('Failed to load blog posts. Run storefront_blogs.sql first.');
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
      display_order: announcements.length > 0 ? Math.max(...announcements.map(a => a.display_order)) + 1 : 0,
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

  const toggleActive = (id: string, current: boolean) => {
    handleUpdateAnnouncement(id, { is_active: !current });
  };

  // ═══════════════════════════════════════
  // Blog CRUD
  // ═══════════════════════════════════════
  const handleDeleteBlogPost = async (id: string) => {
    if (!confirm('Delete this blog post permanently?')) return;
    const { error } = await supabase.from('storefront_blogs').delete().eq('id', id);
    if (error) {
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
      setUpsellError(`Error: ${error.message} (${error.code})`);
    } else {
      setUpsells(data || []);
      setUpsellError(null);
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
      setUpsellError(`Add Error: ${error.message} (${error.code})`);
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
      setUpsellError(`Update Error: ${error.message} (${error.code})`);
    } else {
      setUpsells(upsells.map(u => u.id === id ? { ...u, ...updates } : u));
      setUpsellError(null);
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
      setUpsellError(`Delete Error: ${error.message} (${error.code})`);
    } else {
      setUpsells(upsells.filter(u => u.id !== id));
      setUpsellError(null);
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
      <BlogEditorInline
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
    <div className="p-8 max-w-5xl mx-auto h-full flex flex-col overflow-y-auto">
      {/* Header */}
      <div className="flex items-center gap-6 mb-12">
        <button
          onClick={onBack}
          className="w-14 h-14 bg-[var(--color-neu-bg)] shadow-[var(--shadow-neu-flat)] rounded-2xl flex items-center justify-center text-gray-500 hover:text-blue-600 active:shadow-[var(--shadow-neu-pressed)] active:scale-95 transition-all border border-white/20"
        >
          <ArrowLeft size={24} strokeWidth={3} />
        </button>
        <div>
          <h1 className="text-5xl font-black text-black tracking-tight [text-shadow:-4px_4px_6px_var(--color-neu-shadow-dark)]">
            Storefront <span className="text-blue-600 italic">CMS</span>
          </h1>
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-2 bg-white/50 px-4 py-1.5 rounded-full inline-block shadow-[var(--shadow-neu-sm)]">Announcements, Blogs & Upsells</p>
        </div>
      </div>

      {/* ═══════════════════════════════════════ */}
      {/* Section 1: Announcements */}
      {/* ═══════════════════════════════════════ */}
      <section className="mb-16">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-black text-black flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl shadow-[var(--shadow-neu-sm)] flex items-center justify-center text-blue-600"><Megaphone size={22} strokeWidth={3} /></div>
            Top Announcement Bar
          </h2>
          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center gap-3 px-6 py-4 bg-blue-600 text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-[0_10px_20px_rgba(37,99,235,0.3)] hover:brightness-110 active:scale-95 transition-all"
          >
            <Plus size={20} strokeWidth={3} />
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
              <div className="bg-[var(--color-neu-bg)] shadow-[var(--shadow-neu-flat)] border border-blue-600/20 rounded-3xl p-6 flex items-center gap-4">
                <div className="flex-1 bg-[var(--color-neu-bg)] shadow-[var(--shadow-neu-pressed)] rounded-2xl p-1.5 border border-black/5">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddAnnouncement()}
                    placeholder="Type your announcement message..."
                    autoFocus
                    className="w-full text-base font-black text-black bg-transparent px-4 py-3 placeholder:text-gray-300 outline-none"
                  />
                </div>
                <button
                  onClick={handleAddAnnouncement}
                  disabled={addingAnnouncement || !newMessage.trim()}
                  className="flex items-center gap-2 bg-blue-600 text-white px-5 py-3 rounded-2xl font-black text-sm hover:brightness-110 transition-all disabled:opacity-50"
                >
                  {addingAnnouncement ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} strokeWidth={3} />}
                  Save
                </button>
                <button
                  onClick={() => { setShowAddForm(false); setNewMessage(''); }}
                  className="p-2.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all"
                >
                  <X size={18} strokeWidth={3} />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Announcements List */}
        {loadingAnnouncements ? (
          <div className="flex flex-col items-center justify-center py-20 bg-[var(--color-neu-bg)] shadow-[var(--shadow-neu-pressed)] rounded-[3rem] text-gray-400 gap-4 border border-black/5">
            <div className="w-10 h-10 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin" />
            <p className="font-black text-sm uppercase tracking-widest">Loading announcements...</p>
          </div>
        ) : announcements.length === 0 ? (
          <div className="text-center py-20 bg-[var(--color-neu-bg)] shadow-[var(--shadow-neu-pressed)] rounded-[3rem] border border-black/5">
            <Megaphone size={48} className="mx-auto mb-4 text-gray-300" />
            <h3 className="text-xl font-black text-black mb-2">No active announcements</h3>
            <p className="text-gray-500 mb-8 max-w-sm mx-auto font-bold">Create your first announcement to show it on the top bar of your public storefront.</p>
            <button onClick={() => setShowAddForm(true)} className="text-blue-600 font-black hover:underline">
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
                  className="bg-[var(--color-neu-bg)] shadow-[var(--shadow-neu-flat)] border border-white/20 rounded-3xl p-6 flex items-center gap-6 group hover:shadow-[var(--shadow-neu-sm)] transition-all"
                >
                  <div className="w-10 h-10 bg-[var(--color-neu-bg)] shadow-[var(--shadow-neu-pressed)] rounded-2xl flex items-center justify-center text-gray-400 group-hover:text-blue-600 transition-colors">
                    <GripVertical size={20} strokeWidth={3} />
                  </div>
                  <div className="flex-1">
                    <input
                      type="text"
                      value={item.message}
                      onChange={(e) => setAnnouncements(announcements.map(a => a.id === item.id ? { ...a, message: e.target.value } : a))}
                      onBlur={(e) => handleUpdateAnnouncement(item.id, { message: e.target.value })}
                      className="w-full text-lg font-black text-black bg-transparent border-none focus:ring-0 p-0 placeholder:text-gray-300 outline-none"
                      placeholder="Enter announcement message..."
                    />
                    <div className="flex items-center gap-4 mt-2">
                      <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 bg-white/50 px-2.5 py-0.5 rounded-full shadow-[var(--shadow-neu-sm)]">
                        Order #{item.display_order}
                      </span>
                      <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 bg-white/50 px-2.5 py-0.5 rounded-full shadow-[var(--shadow-neu-sm)]">
                        Added {new Date(item.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => toggleActive(item.id, item.is_active)}
                      className={`p-3 rounded-2xl transition-all flex items-center gap-2 font-black text-xs ${
                        item.is_active
                          ? 'bg-green-50 text-green-600 shadow-[var(--shadow-neu-pressed)] border border-green-100'
                          : 'bg-[var(--color-neu-bg)] shadow-[var(--shadow-neu-flat)] text-gray-400'
                      }`}
                    >
                      {item.is_active ? <ToggleRight size={20} strokeWidth={3} /> : <ToggleLeft size={20} strokeWidth={3} />}
                      {item.is_active ? 'ACTIVE' : 'INACTIVE'}
                    </button>
                    <button
                      onClick={() => handleDeleteAnnouncement(item.id)}
                      className="p-3 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all"
                    >
                      <Trash2 size={20} strokeWidth={3} />
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

        {announcementError && (
          <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-2xl text-red-600 text-sm font-black mt-4 shadow-[var(--shadow-neu-sm)]">
            <AlertCircle size={18} strokeWidth={3} /> {announcementError}
          </div>
        )}
      </section>

      {/* ═══════════════════════════════════════ */}
      {/* Section 2: Blog Management */}
      {/* ═══════════════════════════════════════ */}
      <section className="pb-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-black text-black flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl shadow-[var(--shadow-neu-sm)] flex items-center justify-center text-blue-600"><BookOpen size={22} strokeWidth={3} /></div>
            Blog Management
          </h2>
          <button
            onClick={() => { setEditingPost(null); setEditorOpen(true); }}
            className="flex items-center gap-3 px-6 py-4 bg-blue-600 text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-[0_10px_20px_rgba(37,99,235,0.3)] hover:brightness-110 active:scale-95 transition-all"
          >
            <Plus size={20} strokeWidth={3} />
            New Blog Post
          </button>
        </div>

        {loadingBlogs ? (
          <div className="flex flex-col items-center justify-center py-20 bg-[var(--color-neu-bg)] shadow-[var(--shadow-neu-pressed)] rounded-[3rem] text-gray-400 gap-4 border border-black/5">
            <div className="w-10 h-10 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin" />
            <p className="font-black text-sm uppercase tracking-widest">Loading blog posts...</p>
          </div>
        ) : blogError ? (
          <div className="text-center py-16 bg-[var(--color-neu-bg)] shadow-[var(--shadow-neu-pressed)] rounded-[3rem] border border-black/5">
            <AlertCircle size={48} className="mx-auto mb-4 text-amber-500" />
            <h3 className="text-lg font-black text-black mb-2">Blog Table Not Found</h3>
            <p className="text-gray-500 max-w-md mx-auto text-sm mb-6 font-bold">
              Run <code className="bg-blue-50 px-1.5 py-0.5 rounded text-blue-600 font-black">storefront_blogs.sql</code> in your Supabase SQL Editor.
            </p>
          </div>
        ) : blogPosts.length === 0 ? (
          <div className="text-center py-20 bg-[var(--color-neu-bg)] shadow-[var(--shadow-neu-pressed)] rounded-[3rem] border border-black/5">
            <FileText size={48} className="mx-auto mb-4 text-gray-300" />
            <h3 className="text-xl font-black text-black mb-2">No blog posts yet</h3>
            <p className="text-gray-500 mb-8 max-w-sm mx-auto font-bold">Start creating content for your storefront blog.</p>
            <button onClick={() => { setEditingPost(null); setEditorOpen(true); }} className="text-blue-600 font-black hover:underline">
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
                  className="bg-[var(--color-neu-bg)] shadow-[var(--shadow-neu-flat)] border border-white/20 rounded-3xl p-6 flex items-center gap-6 group hover:shadow-[var(--shadow-neu-sm)] transition-all"
                >
                  {post.cover_image ? (
                    <img src={post.cover_image} alt="" className="w-16 h-16 rounded-2xl object-cover border border-white/20 shadow-[var(--shadow-neu-sm)] shrink-0" />
                  ) : (
                    <div className="w-16 h-16 rounded-2xl bg-[var(--color-neu-bg)] shadow-[var(--shadow-neu-pressed)] flex items-center justify-center shrink-0">
                      <FileText size={24} className="text-gray-400" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-black text-black truncate">{post.title}</h3>
                    <div className="flex items-center gap-3 mt-1.5">
                      <span className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full ${
                        post.is_published ? 'bg-green-50 text-green-600 shadow-[var(--shadow-neu-sm)]' : 'bg-amber-50 text-amber-600 shadow-[var(--shadow-neu-sm)]'
                      }`}>
                        {post.is_published ? 'Published' : 'Draft'}
                      </span>
                      <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 bg-white/50 px-2.5 py-0.5 rounded-full shadow-[var(--shadow-neu-sm)] flex items-center gap-1">
                        <Calendar size={10} />
                        {post.published_at ? new Date(post.published_at).toLocaleDateString() : new Date(post.created_at || '').toLocaleDateString()}
                      </span>
                      <span className="text-[10px] font-mono text-gray-400 bg-white/50 px-2.5 py-0.5 rounded-full shadow-[var(--shadow-neu-sm)]">/blog/{post.slug}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button onClick={() => { setEditingPost(post); setEditorOpen(true); }}
                      className="p-3 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-2xl transition-all" title="Edit">
                      <Pencil size={18} strokeWidth={3} />
                    </button>
                    <button onClick={() => handleDeleteBlogPost(post.id!)}
                      className="p-3 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all" title="Delete">
                      <Trash2 size={18} strokeWidth={3} />
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </section>

      {/* ═══════════════════════════════════════ */}
      {/* Section 3: Cart Upsells & Accessories  */}
      {/* ═══════════════════════════════════════ */}
      <section className="pb-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-black text-black flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl shadow-[var(--shadow-neu-sm)] flex items-center justify-center text-blue-600"><ShoppingBag size={22} strokeWidth={3} /></div>
            Cart Upsells & Accessories
          </h2>
          <button
            onClick={() => setShowAddUpsellForm(true)}
            className="flex items-center gap-3 px-6 py-4 bg-blue-600 text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-[0_10px_20px_rgba(37,99,235,0.3)] hover:brightness-110 active:scale-95 transition-all"
          >
            <Plus size={20} strokeWidth={3} />
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
              <div className="bg-[var(--color-neu-bg)] shadow-[var(--shadow-neu-flat)] border border-blue-600/20 rounded-3xl p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1.5 pl-2">Name *</label>
                    <div className="bg-[var(--color-neu-bg)] shadow-[var(--shadow-neu-pressed)] rounded-2xl p-1.5 border border-black/5">
                      <input
                        type="text"
                        value={newUpsellName}
                        onChange={(e) => setNewUpsellName(e.target.value)}
                        placeholder="e.g. Premium Tempered Glass"
                        autoFocus
                        className="w-full text-base font-black text-black bg-transparent px-4 py-3 placeholder:text-gray-300 outline-none"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1.5 pl-2">Description</label>
                    <div className="bg-[var(--color-neu-bg)] shadow-[var(--shadow-neu-pressed)] rounded-2xl p-1.5 border border-black/5">
                      <input
                        type="text"
                        value={newUpsellDescription}
                        onChange={(e) => setNewUpsellDescription(e.target.value)}
                        placeholder="e.g. Protect your screen from scratches"
                        className="w-full text-base font-black text-black bg-transparent px-4 py-3 placeholder:text-gray-300 outline-none"
                      />
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1.5 pl-2">Regular Price ($)</label>
                    <div className="bg-[var(--color-neu-bg)] shadow-[var(--shadow-neu-pressed)] rounded-2xl p-1.5 border border-black/5">
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={newUpsellRegularPrice}
                        onChange={(e) => setNewUpsellRegularPrice(e.target.value)}
                        placeholder="39.99"
                        className="w-full text-base font-black text-black bg-transparent px-4 py-3 placeholder:text-gray-300 outline-none"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1.5 pl-2">Bundle Price ($)</label>
                    <div className="bg-[var(--color-neu-bg)] shadow-[var(--shadow-neu-pressed)] rounded-2xl p-1.5 border border-black/5">
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={newUpsellBundlePrice}
                        onChange={(e) => setNewUpsellBundlePrice(e.target.value)}
                        placeholder="25.00"
                        className="w-full text-base font-black text-black bg-transparent px-4 py-3 placeholder:text-gray-300 outline-none"
                      />
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3 pt-2">
                  <button
                    onClick={handleAddUpsell}
                    disabled={addingUpsell || !newUpsellName.trim()}
                    className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-2xl font-black text-sm hover:brightness-110 transition-all disabled:opacity-50"
                  >
                    {addingUpsell ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} strokeWidth={3} />}
                    Save Upsell
                  </button>
                  <button
                    onClick={() => { setShowAddUpsellForm(false); setNewUpsellName(''); setNewUpsellDescription(''); setNewUpsellRegularPrice(''); setNewUpsellBundlePrice(''); }}
                    className="px-4 py-3 text-gray-500 hover:text-red-500 font-black text-sm rounded-2xl transition-all"
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
          <div className="flex flex-col items-center justify-center py-20 bg-[var(--color-neu-bg)] shadow-[var(--shadow-neu-pressed)] rounded-[3rem] text-gray-400 gap-4 border border-black/5">
            <div className="w-10 h-10 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin" />
            <p className="font-black text-sm uppercase tracking-widest">Loading upsells...</p>
          </div>
        ) : upsellError && upsells.length === 0 ? (
          <div className="text-center py-16 bg-[var(--color-neu-bg)] shadow-[var(--shadow-neu-pressed)] rounded-[3rem] border border-black/5">
            <AlertCircle size={48} className="mx-auto mb-4 text-amber-500" />
            <h3 className="text-lg font-black text-black mb-2">Supabase Error Detected</h3>
            <p className="text-gray-500 max-w-lg mx-auto text-sm mb-6 bg-[var(--color-neu-bg)] shadow-[var(--shadow-neu-pressed)] p-4 rounded-2xl font-mono break-all">
              {upsellError}
            </p>
            <p className="text-gray-500 max-w-md mx-auto text-sm mb-6 font-bold">
              If the error says "relation does not exist", please ensure you have run the SQL script in your Supabase SQL Editor.
            </p>
            <button 
              onClick={() => { setUpsellError(null); fetchUpsells(); }}
              className="text-blue-600 font-black hover:underline"
            >
              Try to refresh table connection →
            </button>
          </div>
        ) : upsells.length === 0 ? (
          <div className="text-center py-20 bg-[var(--color-neu-bg)] shadow-[var(--shadow-neu-pressed)] rounded-[3rem] border border-black/5">
            <ShoppingBag size={48} className="mx-auto mb-4 text-gray-300" />
            <h3 className="text-xl font-black text-black mb-2">No upsell items yet</h3>
            <p className="text-gray-500 mb-8 max-w-sm mx-auto font-bold">Add accessories and add-ons that customers can bundle with their repair.</p>
            <button
              onClick={() => setShowAddUpsellForm(true)}
              className="text-blue-600 font-black hover:underline"
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
                  className="bg-[var(--color-neu-bg)] shadow-[var(--shadow-neu-flat)] border border-white/20 rounded-3xl p-6 flex items-center gap-6 group hover:shadow-[var(--shadow-neu-sm)] transition-all"
                >
                  <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 shrink-0 shadow-[var(--shadow-neu-sm)]">
                    <DollarSign size={20} strokeWidth={3} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <input
                      type="text"
                      value={item.name}
                      onChange={(e) => setUpsells(upsells.map(u => u.id === item.id ? { ...u, name: e.target.value } : u))}
                      onBlur={(e) => handleUpdateUpsell(item.id, { name: e.target.value })}
                      className="w-full text-lg font-black text-black bg-transparent border-none focus:ring-0 p-0 placeholder:text-gray-300 outline-none"
                      placeholder="Upsell name..."
                    />
                    <input
                      type="text"
                      value={item.description}
                      onChange={(e) => setUpsells(upsells.map(u => u.id === item.id ? { ...u, description: e.target.value } : u))}
                      onBlur={(e) => handleUpdateUpsell(item.id, { description: e.target.value })}
                      className="w-full text-sm text-gray-500 bg-transparent border-none focus:ring-0 p-0 mt-0.5 placeholder:text-gray-300 outline-none font-bold"
                      placeholder="Description..."
                    />
                    <div className="flex items-center gap-4 mt-2">
                      <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 bg-white/50 px-2.5 py-0.5 rounded-full shadow-[var(--shadow-neu-sm)]">
                        RRP ${Number(item.regular_price).toFixed(2)}
                      </span>
                      <span className="text-[10px] font-black uppercase tracking-widest text-green-600 bg-green-50 px-2.5 py-0.5 rounded-full shadow-[var(--shadow-neu-sm)]">
                        Bundle ${Number(item.bundle_price).toFixed(2)}
                      </span>
                      <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 bg-white/50 px-2.5 py-0.5 rounded-full shadow-[var(--shadow-neu-sm)]">
                        Added {new Date(item.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => toggleUpsellActive(item.id, item.is_active)}
                      className={`p-3 rounded-2xl transition-all flex items-center gap-2 font-black text-xs ${
                        item.is_active
                          ? 'bg-green-50 text-green-600 shadow-[var(--shadow-neu-pressed)] border border-green-100'
                          : 'bg-[var(--color-neu-bg)] shadow-[var(--shadow-neu-flat)] text-gray-400'
                      }`}
                    >
                      {item.is_active ? <ToggleRight size={20} strokeWidth={3} /> : <ToggleLeft size={20} strokeWidth={3} />}
                      {item.is_active ? 'ACTIVE' : 'INACTIVE'}
                    </button>

                    <button
                      onClick={() => handleDeleteUpsell(item.id)}
                      className="p-3 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all"
                    >
                      <Trash2 size={20} strokeWidth={3} />
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

        {upsellError && !loadingUpsells && upsells.length > 0 && (
          <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-2xl text-red-600 text-sm font-black mt-4 shadow-[var(--shadow-neu-sm)]">
            <AlertCircle size={18} strokeWidth={3} />
            {upsellError}
          </div>
        )}
      </section>
    </div>
  );
}
