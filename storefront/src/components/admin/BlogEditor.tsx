"use client";

import React, { useState, useCallback, useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import Underline from '@tiptap/extension-underline';
import Placeholder from '@tiptap/extension-placeholder';
import { supabase } from '@/lib/supabase';
import {
  Bold, Italic, Underline as UnderlineIcon, Heading1, Heading2, Heading3,
  List, ListOrdered, Quote, Code, Link as LinkIcon, Image as ImageIcon,
  Undo, Redo, X, Save, Send, ArrowLeft, Loader2, Unlink
} from 'lucide-react';

interface BlogPost {
  id?: string;
  title: string;
  slug: string;
  content: string;
  description: string;
  cover_image: string;
  is_published: boolean;
  published_at: string | null;
}

interface BlogEditorProps {
  post?: BlogPost | null;
  onSave: () => void;
  onCancel: () => void;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

// ── Toolbar Button ──────────────────────────────
function ToolbarButton({ 
  onClick, 
  isActive = false, 
  disabled = false,
  children, 
  title 
}: { 
  onClick: () => void; 
  isActive?: boolean; 
  disabled?: boolean;
  children: React.ReactNode; 
  title: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`p-2 rounded-xl transition-all ${
        isActive 
          ? 'bg-indigo-100 text-indigo-700 shadow-sm' 
          : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
      } ${disabled ? 'opacity-30 cursor-not-allowed' : ''}`}
    >
      {children}
    </button>
  );
}

// ── Toolbar Divider ─────────────────────────────
function ToolbarDivider() {
  return <div className="w-px h-6 bg-slate-200 mx-1" />;
}

export default function BlogEditor({ post, onSave, onCancel }: BlogEditorProps) {
  const [title, setTitle] = useState(post?.title || '');
  const [slug, setSlug] = useState(post?.slug || '');
  const [description, setDescription] = useState(post?.description || '');
  const [coverImage, setCoverImage] = useState(post?.cover_image || '');
  const [isPublished, setIsPublished] = useState(post?.is_published || false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);

  // Auto-generate slug from title
  useEffect(() => {
    if (!slugManuallyEdited && !post?.id) {
      setSlug(slugify(title));
    }
  }, [title, slugManuallyEdited, post?.id]);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
      }),
      Image.configure({
        HTMLAttributes: {
          class: 'blog-inline-image',
          style: 'max-width: 100%; height: auto; border-radius: 12px; margin: 1.5rem 0;',
        },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'blog-link',
          style: 'color: #2563eb; font-weight: 600; text-decoration: underline;',
        },
      }),
      Underline,
      Placeholder.configure({
        placeholder: 'Start writing your blog post...',
      }),
    ],
    content: post?.content || '',
    editorProps: {
      attributes: {
        class: 'prose prose-lg max-w-none focus:outline-none min-h-[400px] p-6',
      },
    },
  });

  // ── Image Upload ────────────────────────────────
  const handleImageUpload = useCallback(async () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file || !editor) return;

      setUploading(true);
      try {
        const fileName = `${Date.now()}-${file.name.replace(/\s+/g, '-')}`;
        const { data, error: uploadError } = await supabase.storage
          .from('blog-images')
          .upload(fileName, file, { cacheControl: '3600', upsert: false });

        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage
          .from('blog-images')
          .getPublicUrl(data.path);

        editor.chain().focus().setImage({ src: urlData.publicUrl }).run();
      } catch (err: any) {
        setError(`Image upload failed: ${err.message}`);
      } finally {
        setUploading(false);
      }
    };
    input.click();
  }, [editor]);

  // ── Cover Image Upload ──────────────────────────
  const handleCoverImageUpload = useCallback(async () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      setUploading(true);
      try {
        const fileName = `covers/${Date.now()}-${file.name.replace(/\s+/g, '-')}`;
        const { data, error: uploadError } = await supabase.storage
          .from('blog-images')
          .upload(fileName, file, { cacheControl: '3600', upsert: false });

        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage
          .from('blog-images')
          .getPublicUrl(data.path);

        setCoverImage(urlData.publicUrl);
      } catch (err: any) {
        setError(`Cover image upload failed: ${err.message}`);
      } finally {
        setUploading(false);
      }
    };
    input.click();
  }, []);

  // ── Link Insert ─────────────────────────────────
  const handleLink = useCallback(() => {
    if (!editor) return;
    
    if (editor.isActive('link')) {
      editor.chain().focus().unsetLink().run();
      return;
    }

    const url = window.prompt('Enter URL:');
    if (url) {
      editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
    }
  }, [editor]);

  // ── Save Post ───────────────────────────────────
  const handleSave = async (publish: boolean) => {
    if (!title.trim() || !slug.trim()) {
      setError('Title and slug are required.');
      return;
    }

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
        // Update existing
        const { error: updateError } = await supabase
          .from('storefront_blogs')
          .update(postData)
          .eq('id', post.id);
        if (updateError) throw updateError;
      } else {
        // Create new
        const { error: insertError } = await supabase
          .from('storefront_blogs')
          .insert([postData]);
        if (insertError) throw insertError;
      }
      onSave();
    } catch (err: any) {
      setError(`Save failed: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  if (!editor) return null;

  return (
    <div className="fixed inset-0 bg-slate-50 z-50 overflow-y-auto">
      {/* Top Bar */}
      <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-xl border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-6 py-3 flex items-center justify-between">
          <button 
            onClick={onCancel}
            className="flex items-center gap-2 text-slate-600 hover:text-slate-900 font-bold transition-colors"
          >
            <ArrowLeft size={20} />
            Back to CMS
          </button>
          <div className="flex items-center gap-3">
            {error && (
              <span className="text-rose-600 text-sm font-bold mr-2">{error}</span>
            )}
            <button
              onClick={() => handleSave(false)}
              disabled={saving}
              className="flex items-center gap-2 px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl font-bold text-sm transition-all disabled:opacity-50"
            >
              {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              Save Draft
            </button>
            <button
              onClick={() => handleSave(true)}
              disabled={saving}
              className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold text-sm transition-all shadow-lg shadow-indigo-100 disabled:opacity-50"
            >
              {saving ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
              {isPublished ? 'Update & Publish' : 'Publish'}
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-6 py-8">
        {/* Meta Fields */}
        <div className="bg-white rounded-3xl border border-slate-200 p-8 mb-6 shadow-sm">
          <div className="grid gap-5">
            <div>
              <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2">Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Your blog post title..."
                className="w-full text-2xl font-black text-slate-900 bg-transparent border-none focus:ring-0 p-0 placeholder:text-slate-300 outline-none"
              />
            </div>
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2">Slug</label>
                <div className="flex items-center gap-2">
                  <span className="text-slate-400 text-sm font-mono">/blog/</span>
                  <input
                    type="text"
                    value={slug}
                    onChange={(e) => { setSlug(e.target.value); setSlugManuallyEdited(true); }}
                    placeholder="url-friendly-slug"
                    className="flex-1 text-sm font-mono text-slate-700 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus:ring-2 focus:ring-indigo-200 focus:border-indigo-300 outline-none"
                  />
                </div>
              </div>
            </div>
            <div>
              <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2">Description / Excerpt</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="A brief summary for SEO and the blog listing..."
                rows={2}
                className="w-full text-sm text-slate-700 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-200 focus:border-indigo-300 outline-none resize-none"
              />
            </div>
            <div>
              <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2">Cover Image</label>
              <div className="flex items-center gap-4">
                {coverImage ? (
                  <div className="relative group">
                    <img src={coverImage} alt="Cover" className="h-20 w-32 object-cover rounded-xl border border-slate-200" />
                    <button 
                      onClick={() => setCoverImage('')}
                      className="absolute -top-2 -right-2 w-6 h-6 bg-rose-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ) : null}
                <button
                  onClick={handleCoverImageUpload}
                  disabled={uploading}
                  className="flex items-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-sm font-bold transition-all"
                >
                  <ImageIcon size={16} />
                  {uploading ? 'Uploading...' : coverImage ? 'Change Image' : 'Upload Cover'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Editor */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          {/* Toolbar */}
          <div className="border-b border-slate-200 px-4 py-2 flex items-center gap-1 flex-wrap bg-slate-50/50">
            <ToolbarButton onClick={() => editor.chain().focus().toggleBold().run()} isActive={editor.isActive('bold')} title="Bold">
              <Bold size={16} />
            </ToolbarButton>
            <ToolbarButton onClick={() => editor.chain().focus().toggleItalic().run()} isActive={editor.isActive('italic')} title="Italic">
              <Italic size={16} />
            </ToolbarButton>
            <ToolbarButton onClick={() => editor.chain().focus().toggleUnderline().run()} isActive={editor.isActive('underline')} title="Underline">
              <UnderlineIcon size={16} />
            </ToolbarButton>

            <ToolbarDivider />

            <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} isActive={editor.isActive('heading', { level: 1 })} title="Heading 1">
              <Heading1 size={16} />
            </ToolbarButton>
            <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} isActive={editor.isActive('heading', { level: 2 })} title="Heading 2">
              <Heading2 size={16} />
            </ToolbarButton>
            <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} isActive={editor.isActive('heading', { level: 3 })} title="Heading 3">
              <Heading3 size={16} />
            </ToolbarButton>

            <ToolbarDivider />

            <ToolbarButton onClick={() => editor.chain().focus().toggleBulletList().run()} isActive={editor.isActive('bulletList')} title="Bullet List">
              <List size={16} />
            </ToolbarButton>
            <ToolbarButton onClick={() => editor.chain().focus().toggleOrderedList().run()} isActive={editor.isActive('orderedList')} title="Ordered List">
              <ListOrdered size={16} />
            </ToolbarButton>
            <ToolbarButton onClick={() => editor.chain().focus().toggleBlockquote().run()} isActive={editor.isActive('blockquote')} title="Blockquote">
              <Quote size={16} />
            </ToolbarButton>
            <ToolbarButton onClick={() => editor.chain().focus().toggleCodeBlock().run()} isActive={editor.isActive('codeBlock')} title="Code Block">
              <Code size={16} />
            </ToolbarButton>

            <ToolbarDivider />

            <ToolbarButton onClick={handleLink} isActive={editor.isActive('link')} title={editor.isActive('link') ? 'Remove Link' : 'Add Link'}>
              {editor.isActive('link') ? <Unlink size={16} /> : <LinkIcon size={16} />}
            </ToolbarButton>
            <ToolbarButton onClick={handleImageUpload} disabled={uploading} title="Insert Image">
              <ImageIcon size={16} />
            </ToolbarButton>

            <ToolbarDivider />

            <ToolbarButton onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()} title="Undo">
              <Undo size={16} />
            </ToolbarButton>
            <ToolbarButton onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()} title="Redo">
              <Redo size={16} />
            </ToolbarButton>

            {uploading && (
              <span className="ml-3 text-xs text-indigo-600 font-bold flex items-center gap-1">
                <Loader2 size={12} className="animate-spin" /> Uploading image...
              </span>
            )}
          </div>

          {/* Editor Content */}
          <EditorContent editor={editor} />

          {/* Editor Styles */}
          <style>{`
            .tiptap {
              min-height: 400px;
              padding: 1.5rem;
              font-size: 1.05rem;
              line-height: 1.8;
              color: #1e293b;
            }
            .tiptap:focus {
              outline: none;
            }
            .tiptap p.is-editor-empty:first-child::before {
              color: #94a3b8;
              content: attr(data-placeholder);
              float: left;
              height: 0;
              pointer-events: none;
            }
            .tiptap h1 { font-size: 2rem; font-weight: 900; margin: 1.5rem 0 0.75rem; color: #0f172a; }
            .tiptap h2 { font-size: 1.5rem; font-weight: 800; margin: 1.25rem 0 0.6rem; color: #0f172a; }
            .tiptap h3 { font-size: 1.25rem; font-weight: 700; margin: 1rem 0 0.5rem; color: #0f172a; }
            .tiptap p { margin-bottom: 0.75rem; }
            .tiptap ul, .tiptap ol { padding-left: 1.5rem; margin-bottom: 1rem; }
            .tiptap li { margin-bottom: 0.25rem; }
            .tiptap blockquote {
              border-left: 4px solid #6366f1;
              padding: 0.75rem 1.25rem;
              margin: 1rem 0;
              background: #f1f5f9;
              border-radius: 0 12px 12px 0;
              color: #475569;
              font-style: italic;
            }
            .tiptap pre {
              background: #1e293b;
              color: #e2e8f0;
              padding: 1rem;
              border-radius: 12px;
              font-family: 'SF Mono', 'Fira Code', monospace;
              font-size: 0.9rem;
              overflow-x: auto;
              margin: 1rem 0;
            }
            .tiptap code {
              background: #f1f5f9;
              color: #6366f1;
              padding: 0.15rem 0.4rem;
              border-radius: 4px;
              font-size: 0.9em;
            }
            .tiptap pre code {
              background: none;
              color: inherit;
              padding: 0;
            }
            .tiptap img {
              max-width: 100%;
              height: auto;
              border-radius: 12px;
              margin: 1.5rem 0;
            }
            .tiptap a {
              color: #2563eb;
              font-weight: 600;
              text-decoration: underline;
            }
            .tiptap strong { font-weight: 800; }
          `}</style>
        </div>
      </div>
    </div>
  );
}
