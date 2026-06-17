"use client";

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, CheckCircle2, ImagePlus, Loader2, Plus, ShieldCheck, UploadCloud } from 'lucide-react';
import {
  REPAIR_RESULT_CATEGORIES,
  type PublicRepairResult,
  type RepairResultDeviceCategory,
  type RepairResultStatus,
} from '@/lib/repair-results';

const STATUS_OPTIONS: RepairResultStatus[] = ['draft', 'approved', 'published', 'archived'];
const PRIVACY_CONFIRMATION =
  '“I confirm no customer name, phone number, IMEI, serial number, private photo, message, notification, lock screen content or sensitive personal data is visible.”';

interface FormState {
  device_category: RepairResultDeviceCategory;
  brand: string;
  brand_slug: string;
  model: string;
  model_slug: string;
  repair_type: string;
  repair_type_slug: string;
  title: string;
  short_description: string;
  image_pair_alt_text: string;
  image_aspect_ratio: string;
  related_repair_url: string;
  featured_on_homepage: boolean;
  sort_order: string;
  status: RepairResultStatus;
  privacy_checked: boolean;
}

const INITIAL_FORM_STATE: FormState = {
  device_category: 'phone',
  brand: '',
  brand_slug: '',
  model: '',
  model_slug: '',
  repair_type: '',
  repair_type_slug: '',
  title: '',
  short_description: '',
  image_pair_alt_text: '',
  image_aspect_ratio: '4:3',
  related_repair_url: '',
  featured_on_homepage: false,
  sort_order: '0',
  status: 'draft',
  privacy_checked: false,
};

function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function generateUUID(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  // Fallback for older browsers (e.g. older iPad POS terminals)
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

function statusLabel(status: RepairResultStatus) {
  return status.charAt(0).toUpperCase() + status.slice(1);
}

function formatDate(value: string | null) {
  if (!value) return 'Not published';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Not published';

  return new Intl.DateTimeFormat('en-AU', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date);
}

export default function RepairResultsDashboardPage() {
  const [form, setForm] = useState<FormState>(INITIAL_FORM_STATE);
  const [beforeImage, setBeforeImage] = useState<File | null>(null);
  const [afterImage, setAfterImage] = useState<File | null>(null);
  const [results, setResults] = useState<PublicRepairResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [currentId, setCurrentId] = useState<string>('');
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    setCurrentId(generateUUID());
  }, []);

  const publishedCount = useMemo(
    () => results.filter((result) => result.status === 'published' && result.privacy_checked).length,
    [results]
  );

  const isDirty = useMemo(() => {
    return JSON.stringify(form) !== JSON.stringify(INITIAL_FORM_STATE) || beforeImage !== null || afterImage !== null;
  }, [form, beforeImage, afterImage]);

  useEffect(() => {
    if (!isDirty) return;
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty]);

  useEffect(() => {
    void fetchResults();
  }, []);

  async function fetchResults() {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/admin/repair-results', {
        cache: 'no-store',
      });
      const payload = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(payload.error || `Failed to load repair results (${response.status})`);
      }

      setResults(payload.data || []);
    } catch (fetchError) {
      setError(fetchError instanceof Error ? fetchError.message : 'Failed to load repair results.');
    } finally {
      setLoading(false);
    }
  }

  function updateField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function updateTextField(key: keyof FormState, value: string) {
    setForm((current) => {
      const next = { ...current, [key]: value };

      if (key === 'brand' && !current.brand_slug) next.brand_slug = slugify(value);
      if (key === 'model' && !current.model_slug) next.model_slug = slugify(value);
      if (key === 'repair_type' && !current.repair_type_slug) next.repair_type_slug = slugify(value);
      if (key === 'model' && !current.title) {
        next.title = value && current.repair_type ? `${value} ${current.repair_type}` : value;
      }
      if (key === 'repair_type' && !current.title) {
        next.title = current.model && value ? `${current.model} ${value}` : value;
      }

      return next;
    });
  }

  function startEdit(result: PublicRepairResult) {
    setEditingId(result.id);
    setForm({
      device_category: result.device_category,
      brand: result.brand,
      brand_slug: result.brand_slug,
      model: result.model,
      model_slug: result.model_slug,
      repair_type: result.repair_type,
      repair_type_slug: result.repair_type_slug,
      title: result.title,
      short_description: result.short_description || '',
      image_pair_alt_text: result.image_pair_alt_text || '',
      image_aspect_ratio: result.image_aspect_ratio || '4:3',
      related_repair_url: result.related_repair_url || '',
      featured_on_homepage: result.featured_on_homepage,
      sort_order: String(result.sort_order),
      status: result.status,
      privacy_checked: result.privacy_checked,
    });
    setBeforeImage(null);
    setAfterImage(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function cancelEdit() {
    if (isDirty && !window.confirm('You have unsaved changes. Discard?')) {
      return;
    }
    setEditingId(null);
    setForm(INITIAL_FORM_STATE);
    setBeforeImage(null);
    setAfterImage(null);
    setCurrentId(generateUUID());
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    if (form.status === 'published' && !form.privacy_checked) {
      setError('Privacy confirmation is required before publishing.');
      return;
    }

    if (!editingId && (!beforeImage || !afterImage)) {
      setError('Before and after images are required.');
      return;
    }

    setSaving(true);

    try {
      const method = editingId ? 'PATCH' : 'POST';
      const endpoint = editingId ? `/api/admin/repair-results/${encodeURIComponent(editingId as string)}` : '/api/admin/repair-results';

      const formData = new FormData();
      if (!editingId) {
        formData.set('id', currentId);
      }
      Object.entries(form).forEach(([key, value]) => {
        formData.set(key, String(value));
      });
      if (beforeImage) formData.set('before_image', beforeImage);
      if (afterImage) formData.set('after_image', afterImage);

      const response = await fetch(endpoint, {
        method,
        body: formData,
      });
      const payload = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(payload.error || `Failed to save repair result (${response.status})`);
      }

      if (payload.idempotentReplay) {
        setSuccess('Repair result already saved.');
      } else if (payload.warning) {
        setSuccess(payload.warning);
      } else {
        setSuccess('Repair result saved.');
      }
      
      if (!editingId) {
        setCurrentId(generateUUID());
      } else {
        setEditingId(null);
        setCurrentId(generateUUID());
      }
      setForm(INITIAL_FORM_STATE);
      setBeforeImage(null);
      setAfterImage(null);
      await fetchResults();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Failed to save repair result.');
    } finally {
      setSaving(false);
    }
  }

  async function updateResult(id: string, updates: Partial<Pick<PublicRepairResult, 'status' | 'privacy_checked' | 'featured_on_homepage'>>) {
    setError(null);
    setSuccess(null);
    setUpdatingId(id);

    try {
      const response = await fetch(`/api/admin/repair-results/${encodeURIComponent(id)}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });
      const payload = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(payload.error || `Failed to update repair result (${response.status})`);
      }

      if (payload.warning) {
        setSuccess(payload.warning);
      } else {
        setSuccess('Repair result updated.');
      }
      await fetchResults();
    } catch (updateError) {
      setError(updateError instanceof Error ? updateError.message : 'Failed to update repair result.');
    } finally {
      setUpdatingId(null);
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-6 text-slate-950 sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
        <div className="flex flex-col justify-between gap-4 border-b border-slate-200 pb-5 md:flex-row md:items-center">
          <div>
            <Link 
              href="/dashboard" 
              className="mb-3 inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-slate-950"
              onClick={(e) => {
                if (isDirty && !window.confirm('You have unsaved changes. Are you sure you want to leave?')) {
                  e.preventDefault();
                }
              }}
            >
              <ArrowLeft size={16} strokeWidth={2.6} aria-hidden="true" />
              Dashboard
            </Link>
            <h1 className="text-3xl font-black tracking-tight text-slate-950">Repair Results</h1>
            <p className="mt-2 max-w-2xl text-sm font-semibold leading-6 text-slate-600">
              Upload privacy-checked before and after repair photos for storefront display.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:min-w-72">
            <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
              <p className="text-xs font-black uppercase tracking-wider text-slate-400">Total</p>
              <p className="mt-1 text-2xl font-black">{results.length}</p>
            </div>
            <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 shadow-sm">
              <p className="text-xs font-black uppercase tracking-wider text-emerald-600">Published</p>
              <p className="mt-1 text-2xl font-black text-emerald-700">{publishedCount}</p>
            </div>
          </div>
        </div>

        {error && (
          <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-bold text-rose-700">
            {error}
          </div>
        )}
        {success && (
          <div className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-700">
            <CheckCircle2 size={18} strokeWidth={2.4} aria-hidden="true" />
            {success}
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-[minmax(0,0.96fr)_minmax(360px,0.64fr)]">
          <form onSubmit={handleSubmit} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-5 flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-lg bg-blue-50 text-blue-600">
                <ImagePlus size={20} strokeWidth={2.5} aria-hidden="true" />
              </span>
              <div>
                <h2 className="text-lg font-black">{editingId ? 'Edit result' : 'New result'}</h2>
                <p className="text-xs font-semibold text-slate-500">Images are uploaded to the private repair-results bucket.</p>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <label className="grid gap-1 text-sm font-bold text-slate-700">
                Device category
                <select
                  value={form.device_category}
                  onChange={(event) => updateField('device_category', event.target.value as RepairResultDeviceCategory)}
                  className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
                >
                  {REPAIR_RESULT_CATEGORIES.map((category) => (
                    <option key={category.value} value={category.value}>
                      {category.label}
                    </option>
                  ))}
                </select>
              </label>

              <label className="grid gap-1 text-sm font-bold text-slate-700">
                Status
                <select
                  value={form.status}
                  onChange={(event) => updateField('status', event.target.value as RepairResultStatus)}
                  className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
                >
                  {STATUS_OPTIONS.map((status) => (
                    <option key={status} value={status}>
                      {statusLabel(status)}
                    </option>
                  ))}
                </select>
              </label>

              <label className="grid gap-1 text-sm font-bold text-slate-700">
                Brand
                <input
                  required
                  value={form.brand}
                  onChange={(event) => updateTextField('brand', event.target.value)}
                  className="rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
                />
              </label>

              <label className="grid gap-1 text-sm font-bold text-slate-700">
                Brand slug
                <input
                  required
                  value={form.brand_slug}
                  onChange={(event) => updateTextField('brand_slug', slugify(event.target.value))}
                  className="rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
                />
              </label>

              <label className="grid gap-1 text-sm font-bold text-slate-700">
                Model
                <input
                  required
                  value={form.model}
                  onChange={(event) => updateTextField('model', event.target.value)}
                  className="rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
                />
              </label>

              <label className="grid gap-1 text-sm font-bold text-slate-700">
                Model slug
                <input
                  required
                  value={form.model_slug}
                  onChange={(event) => updateTextField('model_slug', slugify(event.target.value))}
                  className="rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
                />
              </label>

              <label className="grid gap-1 text-sm font-bold text-slate-700">
                Repair type
                <input
                  required
                  value={form.repair_type}
                  onChange={(event) => updateTextField('repair_type', event.target.value)}
                  className="rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
                />
              </label>

              <label className="grid gap-1 text-sm font-bold text-slate-700">
                Repair type slug
                <input
                  required
                  value={form.repair_type_slug}
                  onChange={(event) => updateTextField('repair_type_slug', slugify(event.target.value))}
                  className="rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
                />
              </label>

              <label className="grid gap-1 text-sm font-bold text-slate-700 md:col-span-2">
                Title
                <input
                  required
                  value={form.title}
                  onChange={(event) => updateTextField('title', event.target.value)}
                  className="rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
                />
              </label>

              <label className="grid gap-1 text-sm font-bold text-slate-700 md:col-span-2">
                Short description
                <textarea
                  value={form.short_description}
                  onChange={(event) => updateTextField('short_description', event.target.value)}
                  rows={3}
                  className="rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
                />
              </label>

              <label className="grid gap-1 text-sm font-bold text-slate-700 md:col-span-2">
                Image alt text
                <input
                  value={form.image_pair_alt_text}
                  onChange={(event) => updateTextField('image_pair_alt_text', event.target.value)}
                  className="rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
                />
              </label>

              <label className="grid gap-1 text-sm font-bold text-slate-700">
                Related repair URL
                <input
                  value={form.related_repair_url}
                  onChange={(event) => updateTextField('related_repair_url', event.target.value)}
                  placeholder="/repairs/phone/iphone/iphone-13/screen-replacement"
                  className="rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
                />
              </label>

              <label className="grid gap-1 text-sm font-bold text-slate-700">
                Image aspect ratio
                <input
                  value={form.image_aspect_ratio}
                  onChange={(event) => updateTextField('image_aspect_ratio', event.target.value)}
                  className="rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
                />
              </label>

              <label className="grid gap-1 text-sm font-bold text-slate-700">
                Sort order
                <input
                  type="number"
                  value={form.sort_order}
                  onChange={(event) => updateTextField('sort_order', event.target.value)}
                  className="rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
                />
              </label>

              <div className="grid gap-3 rounded-lg border border-slate-200 bg-slate-50 p-4 md:col-span-2">
                {editingId ? (
                  <p className="text-sm font-bold text-slate-700">
                    For new repair photos, create a new Repair Result.
                  </p>
                ) : (
                  <>
                    <label className="grid gap-2 text-sm font-bold text-slate-700">
                      Before image (damaged screen before repair)
                      <input
                        required
                        type="file"
                        accept="image/*"
                        onChange={(event) => setBeforeImage(event.target.files?.[0] || null)}
                        className="text-sm file:mr-4 file:rounded-lg file:border-0 file:bg-slate-900 file:px-4 file:py-2 file:text-sm file:font-black file:text-white"
                      />
                    </label>
                    <label className="grid gap-2 text-sm font-bold text-slate-700">
                      After image (repaired screen after repair)
                      <input
                        required
                        type="file"
                        accept="image/*"
                        onChange={(event) => setAfterImage(event.target.files?.[0] || null)}
                        className="text-sm file:mr-4 file:rounded-lg file:border-0 file:bg-slate-900 file:px-4 file:py-2 file:text-sm file:font-black file:text-white"
                      />
                    </label>
                  </>
                )}
              </div>

              <label className="flex items-start gap-3 rounded-lg border border-slate-200 bg-white p-4 text-sm font-bold text-slate-700 md:col-span-2">
                <input
                  type="checkbox"
                  checked={form.featured_on_homepage}
                  onChange={(event) => updateField('featured_on_homepage', event.target.checked)}
                  className="mt-1 h-4 w-4 rounded border-slate-300 text-blue-600"
                />
                <span>Featured on homepage</span>
              </label>

              <label className="flex items-start gap-3 rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm font-bold leading-6 text-emerald-900 md:col-span-2">
                <input
                  type="checkbox"
                  checked={form.privacy_checked}
                  onChange={(event) => updateField('privacy_checked', event.target.checked)}
                  className="mt-1 h-4 w-4 rounded border-emerald-300 text-emerald-600"
                />
                <span>{PRIVACY_CONFIRMATION}</span>
              </label>
            </div>

            <div className="mt-5 flex gap-3">
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 py-3 text-sm font-black text-white shadow-sm shadow-blue-600/20 transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving ? <Loader2 size={18} className="animate-spin" aria-hidden="true" /> : <UploadCloud size={18} strokeWidth={2.5} aria-hidden="true" />}
                {editingId ? 'Update repair result' : 'Save repair result'}
              </button>
              {editingId && (
                <button
                  type="button"
                  onClick={cancelEdit}
                  disabled={saving}
                  className="inline-flex items-center justify-center rounded-lg bg-slate-200 px-5 py-3 text-sm font-black text-slate-800 transition hover:bg-slate-300 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Cancel edit
                </button>
              )}
            </div>
          </form>

          <aside className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-5 flex items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-black">Latest results</h2>
                <p className="text-xs font-semibold text-slate-500">Server-side writes only.</p>
              </div>
              <button
                type="button"
                onClick={() => void fetchResults()}
                className="grid h-10 w-10 place-items-center rounded-lg border border-slate-200 text-slate-600 transition hover:bg-slate-50"
                aria-label="Refresh repair results"
              >
                {loading ? <Loader2 size={18} className="animate-spin" aria-hidden="true" /> : <Plus size={18} strokeWidth={2.5} aria-hidden="true" />}
              </button>
            </div>

            {loading ? (
              <div className="grid min-h-48 place-items-center rounded-lg border border-dashed border-slate-200 text-sm font-bold text-slate-400">
                Loading repair results...
              </div>
            ) : results.length === 0 ? (
              <div className="grid min-h-48 place-items-center rounded-lg border border-dashed border-slate-200 px-5 text-center text-sm font-bold text-slate-400">
                No repair results yet.
              </div>
            ) : (
              <div className="grid gap-3">
                {results.map((result) => (
                  <article key={result.id} className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="text-sm font-black text-slate-950">{result.title}</h3>
                        <p className="mt-1 text-xs font-semibold text-slate-500">
                          {result.model} · {result.repair_type}
                        </p>
                      </div>
                      <span className={`rounded-full px-2.5 py-1 text-xs font-black ${
                        result.status === 'published' && result.privacy_checked
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-slate-100 text-slate-600'
                      }`}>
                        {statusLabel(result.status)}
                      </span>
                    </div>
                    <div className="mt-3 flex flex-wrap items-center gap-2 text-xs font-bold text-slate-500">
                      <span className="rounded-full bg-slate-100 px-2 py-1">{result.device_category === 'laptop' ? 'MacBook' : statusLabel(result.device_category as RepairResultStatus)}</span>
                      {result.featured_on_homepage && <span className="rounded-full bg-blue-50 px-2 py-1 text-blue-700">Homepage</span>}
                      {result.privacy_checked && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-1 text-emerald-700">
                          <ShieldCheck size={13} strokeWidth={2.4} aria-hidden="true" />
                          Privacy checked
                        </span>
                      )}
                    </div>
                    <p className="mt-3 text-xs font-semibold text-slate-400">{formatDate(result.published_at)}</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <button
                        type="button"
                        disabled={updatingId === result.id}
                        onClick={() => startEdit(result)}
                        className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-black text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        Edit
                      </button>
                      {!result.privacy_checked && (
                        <button
                          type="button"
                          disabled={updatingId === result.id}
                          onClick={() => void updateResult(result.id, { privacy_checked: true })}
                          className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-black text-emerald-700 transition hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          Mark privacy checked
                        </button>
                      )}
                      {result.status !== 'published' && (
                        <button
                          type="button"
                          disabled={updatingId === result.id}
                          onClick={() => void updateResult(result.id, { status: 'published' })}
                          className="rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-xs font-black text-blue-700 transition hover:bg-blue-100 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          Publish
                        </button>
                      )}
                      {result.featured_on_homepage && (
                        <button
                          type="button"
                          disabled={updatingId === result.id}
                          onClick={() => void updateResult(result.id, { featured_on_homepage: false })}
                          className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-black text-amber-700 transition hover:bg-amber-100 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          Remove from homepage
                        </button>
                      )}
                      {result.status !== 'archived' && (
                        <button
                          type="button"
                          disabled={updatingId === result.id}
                          onClick={() => {
                            if (window.confirm('Are you sure you want to archive this result? It will be removed from the homepage and public storefront.')) {
                              void updateResult(result.id, { status: 'archived', featured_on_homepage: false });
                            }
                          }}
                          className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-black text-rose-700 transition hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          Archive
                        </button>
                      )}
                    </div>
                  </article>
                ))}
              </div>
            )}
          </aside>
        </div>
      </div>
    </main>
  );
}
