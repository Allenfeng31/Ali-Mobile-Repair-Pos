import React from 'react';
import {
  ArrowLeft,
  CheckCircle2,
  ImagePlus,
  Loader2,
  Plus,
  ShieldCheck,
  UploadCloud,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/hooks/useAuthStore';
import {
  applyRepairResultTaxonomyChange,
  createInitialRepairResultForm,
  getRepairResultDestinationPreview,
  getRepairResultTaxonomyOptions,
  toRepairResultSubmissionFields,
  validateRepairResultSubmission,
  type RepairResultFormState,
  type RepairResultTaxonomy,
  type RepairResultDeviceCategory,
  type RepairResultStatus,
} from '@/lib/repairResultWorkflow';

interface PublicRepairResult {
  id: string;
  device_category: RepairResultDeviceCategory;
  brand: string;
  brand_slug: string;
  model: string;
  model_slug: string;
  repair_type: string;
  repair_type_slug: string;
  before_image_path: string;
  after_image_path: string;
  image_pair_alt_text: string | null;
  image_aspect_ratio: string | null;
  before_image_width: number | null;
  before_image_height: number | null;
  after_image_width: number | null;
  after_image_height: number | null;
  title: string;
  short_description: string | null;
  status: RepairResultStatus;
  privacy_checked: boolean;
  featured_on_homepage: boolean;
  featured_on_repair_hub: boolean;
  featured_on_brand_hub: boolean;
  sort_order: number;
  related_repair_url: string | null;
  created_at: string;
  updated_at: string;
  published_at: string | null;
}

type FormState = RepairResultFormState;

const STATUS_OPTIONS: Array<Extract<RepairResultStatus, 'draft' | 'published'>> = ['draft', 'published'];
const PRIVACY_CONFIRMATION =
  'I confirm no customer name, phone number, IMEI, serial number, private photo, message, notification, lock screen content or sensitive personal data is visible.';

function generateUUID() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

const INITIAL_FORM_STATE = createInitialRepairResultForm();

function statusLabel(status: string) {
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

function trimTrailingSlash(value: string) {
  return value.replace(/\/+$/, '');
}

function getRepairResultsApiBase() {
  const configured = (import.meta.env.VITE_STOREFRONT_API_BASE_URL || import.meta.env.VITE_STOREFRONT_URL || '').trim();
  if (configured) return trimTrailingSlash(configured);

  if (typeof window !== 'undefined') {
    const host = window.location.hostname;
    const protocol = window.location.protocol;

    if (host === 'localhost' || host === '127.0.0.1') {
      return `${protocol}//${host}:3000`;
    }
  }

  return 'https://www.alimobile.com.au';
}

async function getRepairResultsAuthHeaders() {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.access_token) {
    throw new Error('Staff session expired. Please sign out and sign back in.');
  }

  return {
    Authorization: `Bearer ${session.access_token}`,
  };
}

async function processImage(file: File): Promise<{ blob: Blob; width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);
      
      let { width, height } = img;
      const MAX_WIDTH = 1600;

      if (width > MAX_WIDTH) {
        height = Math.round((height * MAX_WIDTH) / width);
        width = MAX_WIDTH;
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        return reject(new Error('Failed to initialize image processor.'));
      }

      ctx.drawImage(img, 0, 0, width, height);
      
      canvas.toBlob((blob) => {
        if (!blob) return reject(new Error('Failed to export processed image.'));
        resolve({ blob, width, height });
      }, 'image/webp', 0.8);
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load image. It may be corrupt or an unsupported format.'));
    };

    img.src = url;
  });
}

export function RepairResultsView({ onBack }: { onBack: () => void }) {
  const { permissions, isLoading: permissionsLoading } = useAuthStore();
  const [form, setForm] = React.useState<FormState>(INITIAL_FORM_STATE);
  const [currentId, setCurrentId] = React.useState<string>(() => generateUUID());
  const [beforeImage, setBeforeImage] = React.useState<File | null>(null);
  const [afterImage, setAfterImage] = React.useState<File | null>(null);
  const [taxonomy, setTaxonomy] = React.useState<RepairResultTaxonomy | null>(null);
  const [taxonomyLoading, setTaxonomyLoading] = React.useState(true);
  const [autoGeneratedSeo, setAutoGeneratedSeo] = React.useState({ title: true, short_description: true, image_pair_alt_text: true });
  const [results, setResults] = React.useState<PublicRepairResult[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [updatingId, setUpdatingId] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState<string | null>(null);

  const publishedCount = results.filter((result) => result.status === 'published' && result.privacy_checked).length;
  const taxonomyOptions = taxonomy ? getRepairResultTaxonomyOptions(taxonomy, form) : { brands: [], models: [], repairTypes: [] };
  const destinationPreview = taxonomy ? getRepairResultDestinationPreview(form, taxonomy) : [];

  React.useEffect(() => {
    if (permissionsLoading || !permissions?.is_super_admin) return;
    void fetchResults();
    void fetchTaxonomy();
  }, [permissionsLoading, permissions?.is_super_admin]);

  async function fetchResults() {
    setLoading(true);
    setError(null);

    try {
      const headers = await getRepairResultsAuthHeaders();
      const response = await fetch(`${getRepairResultsApiBase()}/api/admin/repair-results`, {
        headers,
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

  async function fetchTaxonomy() {
    setTaxonomyLoading(true);

    try {
      const headers = await getRepairResultsAuthHeaders();
      const response = await fetch(`${getRepairResultsApiBase()}/api/admin/repair-results?view=taxonomy`, { headers });
      const payload = await response.json().catch(() => ({}));

      if (!response.ok || !payload.data?.categories) {
        throw new Error(payload.error || 'Failed to load the canonical repair taxonomy.');
      }

      setTaxonomy(payload.data as RepairResultTaxonomy);
    } catch (taxonomyError) {
      setError(taxonomyError instanceof Error ? taxonomyError.message : 'Failed to load the canonical repair taxonomy.');
    } finally {
      setTaxonomyLoading(false);
    }
  }

  function updateField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function updateTextField(key: keyof FormState, value: string) {
    setForm((current) => ({ ...current, [key]: value }));
    if (key === 'title' || key === 'short_description' || key === 'image_pair_alt_text') {
      setAutoGeneratedSeo((current) => ({ ...current, [key]: false }));
    }
  }

  function updateTaxonomyField(field: 'device_category' | 'brand_slug' | 'model_slug' | 'repair_type_slug', value: string) {
    if (!taxonomy) return;

    const outcome = applyRepairResultTaxonomyChange(form, taxonomy, field, value);
    const generated = outcome.generatedSeo;
    setForm({
      ...outcome.form,
      ...(generated && autoGeneratedSeo.title ? { title: generated.title } : {}),
      ...(generated && autoGeneratedSeo.short_description ? { short_description: generated.short_description } : {}),
      ...(generated && autoGeneratedSeo.image_pair_alt_text ? { image_pair_alt_text: generated.image_pair_alt_text } : {}),
    });
  }

  function resetGeneratedSeoField(field: 'title' | 'short_description' | 'image_pair_alt_text') {
    if (!taxonomy || !form.repair_type_slug) return;
    const generated = applyRepairResultTaxonomyChange(form, taxonomy, 'repair_type_slug', form.repair_type_slug).generatedSeo;
    if (!generated) return;

    setForm((current) => ({ ...current, [field]: generated[field] }));
    setAutoGeneratedSeo((current) => ({ ...current, [field]: true }));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    if (!taxonomy) {
      setError('The canonical repair taxonomy must load before saving.');
      return;
    }

    const validationError = validateRepairResultSubmission(form, taxonomy);
    if (validationError) {
      setError(validationError);
      return;
    }

    if (!beforeImage || !afterImage) {
      setError('Before and after images are required.');
      return;
    }

    if (!/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(currentId)) {
      setError('A valid UUID is required to create a repair result.');
      return;
    }

    setSaving(true);

    try {
      const beforeProcessed = await processImage(beforeImage).catch((e) => {
        throw new Error(`Before Image Error: ${e.message}`);
      });
      const afterProcessed = await processImage(afterImage).catch((e) => {
        throw new Error(`After Image Error: ${e.message}`);
      });

      const headers = await getRepairResultsAuthHeaders();
      const formData = new FormData();
      formData.set('id', currentId);
      Object.entries(toRepairResultSubmissionFields(form)).forEach(([key, value]) => {
        formData.set(key, String(value));
      });
      formData.set('before_image', beforeProcessed.blob, 'before.webp');
      formData.set('after_image', afterProcessed.blob, 'after.webp');
      formData.set('before_image_width', String(beforeProcessed.width));
      formData.set('before_image_height', String(beforeProcessed.height));
      formData.set('after_image_width', String(afterProcessed.width));
      formData.set('after_image_height', String(afterProcessed.height));

      const response = await fetch(`${getRepairResultsApiBase()}/api/admin/repair-results`, {
        method: 'POST',
        headers,
        body: formData,
      });
      const payload = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(payload.error || `Failed to save repair result (${response.status})`);
      }

      setForm(INITIAL_FORM_STATE);
      setAutoGeneratedSeo({ title: true, short_description: true, image_pair_alt_text: true });
      setCurrentId(generateUUID());
      setBeforeImage(null);
      setAfterImage(null);
      setSuccess('Repair result saved.');
      await fetchResults();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Failed to save repair result.');
    } finally {
      setSaving(false);
    }
  }

  async function updateResult(id: string, updates: Partial<Pick<PublicRepairResult, 'status' | 'privacy_checked' | 'featured_on_homepage' | 'featured_on_repair_hub' | 'featured_on_brand_hub'>>) {
    setError(null);
    setSuccess(null);
    setUpdatingId(id);

    try {
      const headers = await getRepairResultsAuthHeaders();
      const response = await fetch(`${getRepairResultsApiBase()}/api/admin/repair-results/${encodeURIComponent(id)}`, {
        method: 'PATCH',
        headers: {
          ...headers,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });
      const payload = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(payload.error || `Failed to update repair result (${response.status})`);
      }

      setSuccess('Repair result updated.');
      await fetchResults();
    } catch (updateError) {
      setError(updateError instanceof Error ? updateError.message : 'Failed to update repair result.');
    } finally {
      setUpdatingId(null);
    }
  }

  if (permissionsLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="flex items-center gap-3 rounded-[2rem] bg-neu-bg px-6 py-4 shadow-neu-flat">
          <Loader2 size={20} className="animate-spin text-neu-accent" />
          <span className="text-sm font-black text-neu-text-primary">Loading Repair Results...</span>
        </div>
      </div>
    );
  }

  if (!permissions?.is_super_admin) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center p-8 bg-neu-bg shadow-neu-pressed rounded-[2rem] max-w-md">
          <ShieldCheck className="mx-auto mb-4 text-red-500" size={48} />
          <h2 className="text-2xl font-black text-neu-text-primary mb-2">Access Denied</h2>
          <p className="text-neu-text-secondary">You do not have the required permissions to access Repair Results.</p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-neu-bg px-4 py-6 text-neu-text-primary sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
        <div className="flex flex-col justify-between gap-4 border-b border-black/5 pb-5 md:flex-row md:items-center">
          <div>
            <button
              type="button"
              onClick={onBack}
              className="mb-3 inline-flex items-center gap-2 text-sm font-bold text-neu-text-secondary hover:text-neu-text-primary"
            >
              <ArrowLeft size={16} strokeWidth={2.6} aria-hidden="true" />
              Admin Dashboard
            </button>
            <h1 className="text-3xl font-black tracking-tight text-neu-text-primary">Repair Results</h1>
            <p className="mt-2 max-w-2xl text-sm font-semibold leading-6 text-neu-text-secondary">
              Upload privacy-checked before and after repair photos for storefront display.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:min-w-72">
            <div className="rounded-[1.5rem] border border-black/5 bg-neu-bg p-4 shadow-neu-flat">
              <p className="text-xs font-black uppercase tracking-wider text-neu-text-secondary">Total</p>
              <p className="mt-1 text-2xl font-black">{results.length}</p>
            </div>
            <div className="rounded-[1.5rem] border border-emerald-200 bg-emerald-50 p-4 shadow-[0_12px_30px_rgba(16,185,129,0.12)]">
              <p className="text-xs font-black uppercase tracking-wider text-emerald-600">Published</p>
              <p className="mt-1 text-2xl font-black text-emerald-700">{publishedCount}</p>
            </div>
          </div>
        </div>

        {error && (
          <div className="rounded-[1.5rem] border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-bold text-rose-700">
            {error}
          </div>
        )}
        {success && (
          <div className="flex items-center gap-2 rounded-[1.5rem] border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-700">
            <CheckCircle2 size={18} strokeWidth={2.4} aria-hidden="true" />
            {success}
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-[minmax(0,0.96fr)_minmax(360px,0.64fr)]">
          <form onSubmit={handleSubmit} className="rounded-[2rem] border border-black/5 bg-neu-bg p-5 shadow-neu-flat">
            <div className="mb-5 flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-[1rem] bg-blue-50 text-blue-600">
                <ImagePlus size={20} strokeWidth={2.5} aria-hidden="true" />
              </span>
              <div>
                <h2 className="text-lg font-black">New result</h2>
                <p className="text-xs font-semibold text-neu-text-secondary">Images are uploaded to the private repair-results bucket.</p>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <label className="grid gap-1 text-sm font-bold text-neu-text-primary">
                Device category
                <select
                  value={form.device_category}
                  onChange={(event) => updateTaxonomyField('device_category', event.target.value)}
                  disabled={taxonomyLoading || !taxonomy}
                  className="rounded-[1rem] border border-black/10 bg-white px-3 py-2 text-sm outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
                >
                  {(taxonomy?.categories || []).map((category) => (
                    <option key={category.value} value={category.value}>
                      {category.label}
                    </option>
                  ))}
                </select>
              </label>

              <label className="grid gap-1 text-sm font-bold text-neu-text-primary">
                Brand
                <select
                  required
                  value={form.brand_slug}
                  onChange={(event) => updateTaxonomyField('brand_slug', event.target.value)}
                  disabled={taxonomyLoading || taxonomyOptions.brands.length === 0}
                  className="rounded-[1rem] border border-black/10 bg-white px-3 py-2 text-sm outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-100"
                >
                  <option value="">Select brand</option>
                  {taxonomyOptions.brands.map((brand) => <option key={brand.slug} value={brand.slug}>{brand.name}</option>)}
                </select>
              </label>

              <label className="grid gap-1 text-sm font-bold text-neu-text-primary">
                Model
                <select
                  required
                  value={form.model_slug}
                  onChange={(event) => updateTaxonomyField('model_slug', event.target.value)}
                  disabled={taxonomyOptions.models.length === 0}
                  className="rounded-[1rem] border border-black/10 bg-white px-3 py-2 text-sm outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-100"
                >
                  <option value="">Select model</option>
                  {taxonomyOptions.models.map((model) => <option key={model.slug} value={model.slug}>{model.name}</option>)}
                </select>
              </label>

              <label className="grid gap-1 text-sm font-bold text-neu-text-primary">
                Repair type
                <select
                  required
                  value={form.repair_type_slug}
                  onChange={(event) => updateTaxonomyField('repair_type_slug', event.target.value)}
                  disabled={taxonomyOptions.repairTypes.length === 0}
                  className="rounded-[1rem] border border-black/10 bg-white px-3 py-2 text-sm outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-100"
                >
                  <option value="">Select repair type</option>
                  {taxonomyOptions.repairTypes.map((repair) => <option key={repair.slug} value={repair.slug}>{repair.name}</option>)}
                </select>
              </label>

              <details className="rounded-[1.5rem] border border-black/5 bg-white p-4 md:col-span-2">
                <summary className="cursor-pointer text-sm font-black text-neu-text-primary">SEO and advanced details</summary>
                <p className="mt-2 text-xs font-semibold text-neu-text-secondary">Generated from the selected canonical taxonomy. Edited fields remain untouched when taxonomy changes.</p>
                <div className="mt-4 grid gap-4">
                  {([
                    ['title', 'Title'],
                    ['short_description', 'Short description'],
                    ['image_pair_alt_text', 'Image alt text'],
                  ] as const).map(([field, label]) => (
                    <label key={field} className="grid gap-1 text-sm font-bold text-neu-text-primary">
                      {label} <span className="text-xs font-semibold text-neu-text-secondary">{autoGeneratedSeo[field] ? 'Auto-generated' : 'Staff edited'}</span>
                      {field === 'short_description' ? (
                        <textarea value={form[field]} onChange={(event) => updateTextField(field, event.target.value)} rows={3} className="rounded-[1rem] border border-black/10 px-3 py-2 text-sm outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-100" />
                      ) : (
                        <input required={field === 'title'} value={form[field]} onChange={(event) => updateTextField(field, event.target.value)} className="rounded-[1rem] border border-black/10 px-3 py-2 text-sm outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-100" />
                      )}
                      {!autoGeneratedSeo[field] && <button type="button" onClick={() => resetGeneratedSeoField(field)} className="w-fit text-xs font-black text-blue-700 hover:text-blue-900">Reset to generated text</button>}
                    </label>
                  ))}
                  <label className="grid gap-1 text-sm font-bold text-neu-text-primary">Canonical related repair URL<input readOnly value={form.related_repair_url} className="rounded-[1rem] border border-black/10 bg-slate-50 px-3 py-2 text-sm text-neu-text-secondary" /></label>
                  <div className="grid gap-4 md:grid-cols-2">
                    <label className="grid gap-1 text-sm font-bold text-neu-text-primary">Image aspect ratio<input value={form.image_aspect_ratio} onChange={(event) => updateTextField('image_aspect_ratio', event.target.value)} className="rounded-[1rem] border border-black/10 px-3 py-2 text-sm outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-100" /></label>
                    <label className="grid gap-1 text-sm font-bold text-neu-text-primary">Sort order<input type="number" value={form.sort_order} onChange={(event) => updateTextField('sort_order', event.target.value)} className="rounded-[1rem] border border-black/10 px-3 py-2 text-sm outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-100" /></label>
                  </div>
                </div>
              </details>

              <div className="grid gap-3 rounded-[1.5rem] border border-black/5 bg-white/70 p-4 md:col-span-2">
                <label className="grid gap-2 text-sm font-bold text-neu-text-primary">
                  Before image
                  <input
                    required
                    type="file"
                    accept="image/*"
                    onChange={(event) => setBeforeImage(event.target.files?.[0] || null)}
                    className="text-sm file:mr-4 file:rounded-[1rem] file:border-0 file:bg-slate-900 file:px-4 file:py-2 file:text-sm file:font-black file:text-white"
                  />
                </label>
                <label className="grid gap-2 text-sm font-bold text-neu-text-primary">
                  After image
                  <input
                    required
                    type="file"
                    accept="image/*"
                    onChange={(event) => setAfterImage(event.target.files?.[0] || null)}
                    className="text-sm file:mr-4 file:rounded-[1rem] file:border-0 file:bg-slate-900 file:px-4 file:py-2 file:text-sm file:font-black file:text-white"
                  />
                </label>
              </div>

              <section className="grid gap-3 rounded-[1.5rem] border border-blue-100 bg-blue-50/60 p-4 md:col-span-2" aria-labelledby="repair-result-placement-heading">
                <div>
                  <h3 id="repair-result-placement-heading" className="text-sm font-black text-neu-text-primary">Where should this repair result appear?</h3>
                  <p className="mt-1 text-xs font-semibold text-neu-text-secondary">Choose each public placement explicitly. Canonical model and repair pages are determined by the selected taxonomy.</p>
                </div>

              <label className="flex items-start gap-3 rounded-[1rem] border border-black/5 bg-white p-4 text-sm font-bold text-neu-text-primary">
                <input
                  type="checkbox"
                  checked={form.featured_on_homepage}
                  onChange={(event) => updateField('featured_on_homepage', event.target.checked)}
                  className="mt-1 h-4 w-4 rounded border-slate-300 text-blue-600"
                />
                <div className="flex flex-col"><span>Featured on Homepage</span><span className="mt-1 text-xs font-semibold text-neu-text-secondary">Promotes this result on the main Storefront homepage.</span></div>
              </label>

              <label className="flex items-start gap-3 rounded-[1rem] border border-black/5 bg-white p-4 text-sm font-bold text-neu-text-primary">
                <input
                  type="checkbox"
                  checked={form.featured_on_repair_hub}
                  onChange={(event) => updateField('featured_on_repair_hub', event.target.checked)}
                  className="mt-1 h-4 w-4 rounded border-slate-300 text-blue-600"
                />
                <div className="flex flex-col">
                  <span>Feature on Repair Hub</span>
                  <span className="text-xs font-semibold text-neu-text-secondary mt-1">
                    Shows this result on its matching Phone, Tablet, Laptop or Watch Repair Hub.
                  </span>
                </div>
              </label>

              <label className="flex items-start gap-3 rounded-[1rem] border border-black/5 bg-white p-4 text-sm font-bold text-neu-text-primary">
                <input
                  type="checkbox"
                  checked={form.featured_on_brand_hub}
                  onChange={(event) => updateField('featured_on_brand_hub', event.target.checked)}
                  className="mt-1 h-4 w-4 rounded border-slate-300 text-blue-600"
                />
                <div className="flex flex-col">
                  <span>Feature on Brand Repair Hub</span>
                  <span className="text-xs font-semibold text-neu-text-secondary mt-1">
                    Shows this result on its matching brand page, such as iPhone, Samsung, Oppo, Google, iPad, MacBook or Apple Watch.
                  </span>
                </div>
              </label>

                {form.status === 'draft' && <p className="text-xs font-bold text-neu-text-secondary">Feature selections will become publicly visible only after this result is published.</p>}
              </section>

              <section className="rounded-[1.5rem] border border-black/5 bg-white p-4 md:col-span-2" aria-labelledby="repair-result-destinations-heading">
                <h3 id="repair-result-destinations-heading" className="text-sm font-black text-neu-text-primary">Will appear on</h3>
                {destinationPreview.length > 0 ? (
                  <ul className="mt-2 grid gap-1 text-xs font-semibold text-neu-text-secondary">
                    {destinationPreview.map((destination) => <li key={`${destination.label}-${destination.url}`}><span className="font-black text-neu-text-primary">{destination.label}:</span> {destination.url} · {destination.visibility}</li>)}
                  </ul>
                ) : <p className="mt-2 text-xs font-semibold text-neu-text-secondary">Select a valid category, brand, model, and repair type to preview canonical destinations.</p>}
              </section>

              <label className="flex items-start gap-3 rounded-[1.5rem] border border-emerald-200 bg-emerald-50 p-4 text-sm font-bold leading-6 text-emerald-900 md:col-span-2">
                <input
                  type="checkbox"
                  checked={form.privacy_checked}
                  onChange={(event) => updateField('privacy_checked', event.target.checked)}
                  className="mt-1 h-4 w-4 rounded border-emerald-300 text-emerald-600"
                />
                <span>{PRIVACY_CONFIRMATION}</span>
              </label>

              <label className="grid gap-1 text-sm font-bold text-neu-text-primary md:col-span-2">
                Save as
                <select value={form.status} onChange={(event) => updateField('status', event.target.value as RepairResultStatus)} className="rounded-[1rem] border border-black/10 bg-white px-3 py-2 text-sm outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-100">
                  {STATUS_OPTIONS.map((status) => <option key={status} value={status}>{statusLabel(status)}</option>)}
                </select>
              </label>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="mt-5 inline-flex items-center justify-center gap-2 rounded-[1rem] bg-blue-600 px-5 py-3 text-sm font-black text-white shadow-[0_12px_30px_rgba(37,99,235,0.22)] transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? <Loader2 size={18} className="animate-spin" aria-hidden="true" /> : <UploadCloud size={18} strokeWidth={2.5} aria-hidden="true" />}
              Save repair result
            </button>
          </form>

          <aside className="rounded-[2rem] border border-black/5 bg-neu-bg p-5 shadow-neu-flat">
            <div className="mb-5 flex items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-black">Latest results</h2>
                <p className="text-xs font-semibold text-neu-text-secondary">Server-side writes only.</p>
              </div>
              <button
                type="button"
                onClick={() => void fetchResults()}
                className="grid h-10 w-10 place-items-center rounded-[1rem] border border-black/10 text-neu-text-secondary transition hover:bg-white"
                aria-label="Refresh repair results"
              >
                {loading ? <Loader2 size={18} className="animate-spin" aria-hidden="true" /> : <Plus size={18} strokeWidth={2.5} aria-hidden="true" />}
              </button>
            </div>

            {loading ? (
              <div className="grid min-h-48 place-items-center rounded-[1.5rem] border border-dashed border-black/10 text-sm font-bold text-neu-text-secondary">
                Loading repair results...
              </div>
            ) : results.length === 0 ? (
              <div className="grid min-h-48 place-items-center rounded-[1.5rem] border border-dashed border-black/10 px-5 text-center text-sm font-bold text-neu-text-secondary">
                No repair results yet.
              </div>
            ) : (
              <div className="grid gap-3">
                {results.map((result) => (
                  <article key={result.id} className="rounded-[1.5rem] border border-black/5 bg-white p-4 shadow-neu-sm">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="text-sm font-black text-neu-text-primary">{result.title}</h3>
                        <p className="mt-1 text-xs font-semibold text-neu-text-secondary">
                          {result.model} · {result.repair_type}
                        </p>
                      </div>
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-black ${
                          result.status === 'published' && result.privacy_checked
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {statusLabel(result.status)}
                      </span>
                    </div>
                    <div className="mt-3 flex flex-wrap items-center gap-2 text-xs font-bold text-neu-text-secondary">
                      <span className="rounded-full bg-slate-100 px-2 py-1">
                        {result.device_category === 'laptop' ? 'MacBook' : statusLabel(result.device_category)}
                      </span>
                      {result.featured_on_homepage && <span className="rounded-full bg-blue-50 px-2 py-1 text-blue-700">Homepage</span>}
                      {result.featured_on_repair_hub && <span className="rounded-full bg-violet-50 px-2 py-1 text-violet-700">Repair Hub</span>}
                      {result.featured_on_brand_hub && <span className="rounded-full bg-purple-50 px-2 py-1 text-purple-700">Brand Hub</span>}
                      {result.privacy_checked && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-1 text-emerald-700">
                          <ShieldCheck size={13} strokeWidth={2.4} aria-hidden="true" />
                          Privacy checked
                        </span>
                      )}
                    </div>
                    <p className="mt-3 text-xs font-semibold text-neu-text-secondary">
                      Published: {formatDate(result.published_at)}
                    </p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {!result.privacy_checked && (
                        <button
                          type="button"
                          disabled={updatingId === result.id}
                          onClick={() => void updateResult(result.id, { privacy_checked: true })}
                          className="rounded-full bg-emerald-600 px-3 py-1.5 text-xs font-black text-white disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {updatingId === result.id ? 'Updating...' : 'Mark privacy checked'}
                        </button>
                      )}
                      {result.status !== 'published' && (
                        <button
                          type="button"
                          disabled={updatingId === result.id}
                          onClick={() => void updateResult(result.id, { status: 'published' })}
                          className="rounded-full bg-slate-950 px-3 py-1.5 text-xs font-black text-white disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {updatingId === result.id ? 'Publishing...' : 'Publish'}
                        </button>
                      )}
                      {result.featured_on_homepage && (
                        <button
                          type="button"
                          disabled={updatingId === result.id}
                          onClick={() => void updateResult(result.id, { featured_on_homepage: false })}
                          className="rounded-full bg-amber-100 px-3 py-1.5 text-xs font-black text-amber-700 hover:bg-amber-200 transition disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          Remove from homepage
                        </button>
                      )}
                      {result.featured_on_repair_hub ? (
                        <button
                          type="button"
                          disabled={updatingId === result.id}
                          onClick={() => void updateResult(result.id, { featured_on_repair_hub: false })}
                          className="rounded-full bg-violet-100 px-3 py-1.5 text-xs font-black text-violet-700 hover:bg-violet-200 transition disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          Remove from Repair Hub
                        </button>
                      ) : (
                        <button
                          type="button"
                          disabled={updatingId === result.id}
                          onClick={() => void updateResult(result.id, { featured_on_repair_hub: true })}
                          className="rounded-full border border-violet-200 bg-white px-3 py-1.5 text-xs font-black text-violet-700 hover:bg-violet-50 transition disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          Feature on Repair Hub
                        </button>
                      )}
                      {result.featured_on_brand_hub ? (
                        <button
                          type="button"
                          disabled={updatingId === result.id}
                          onClick={() => void updateResult(result.id, { featured_on_brand_hub: false })}
                          className="rounded-full bg-purple-100 px-3 py-1.5 text-xs font-black text-purple-700 hover:bg-purple-200 transition disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          Remove from Brand Hub
                        </button>
                      ) : (
                        <button
                          type="button"
                          disabled={updatingId === result.id}
                          onClick={() => void updateResult(result.id, { featured_on_brand_hub: true })}
                          className="rounded-full border border-purple-200 bg-white px-3 py-1.5 text-xs font-black text-purple-700 hover:bg-purple-50 transition disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          Feature on Brand Hub
                        </button>
                      )}
                      {result.status !== 'archived' && (
                        <button
                          type="button"
                          disabled={updatingId === result.id}
                          onClick={() => {
                            if (window.confirm('Are you sure you want to archive this result?')) {
                              void updateResult(result.id, { status: 'archived' });
                            }
                          }}
                          className="rounded-full bg-rose-100 px-3 py-1.5 text-xs font-black text-rose-700 hover:bg-rose-200 transition disabled:cursor-not-allowed disabled:opacity-60"
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
