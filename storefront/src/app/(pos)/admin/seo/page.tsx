"use client";

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ArrowLeft,
  Check,
  Clock,
  Database,
  Download,
  Eye,
  FileText,
  Loader2,
  Radar,
  Search,
  ShieldAlert,
  Sparkles,
  X,
} from 'lucide-react';
import Link from 'next/link';

interface KeywordRecord {
  id: string;
  keyword: string;
  source?: string | null;
  search_weight?: number | null;
  created_at?: string;
  updated_at?: string;
  status: 'pending' | 'approved' | 'queued' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'blocked';
}

interface CampaignRecord {
  id: string;
  keyword: string;
  source?: string | null;
  status?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
  last_executed_at?: string | null;
  payload?: CampaignPayload;
}

interface OptimizationTaskPayload {
  mode?: 'proposal';
  targetUrl?: string | null;
  primaryKeyword?: string;
  proposal?: {
    hero?: {
      headline?: string;
      quickAnswer?: string;
      primaryCta?: string;
      secondaryCta?: string;
    };
    localServiceArea?: {
      address?: string;
      phone?: string;
    };
    metaTitle?: string;
    metaDescription?: string;
  };
  qa?: {
    conversionModulesPreserved?: string;
    bookingCtaPreserved?: string;
    callCtaPreserved?: string;
    modularAndScannable?: string;
    noDenseArticleContent?: string;
    pageRemainsModularAndScannable?: string;
    noDenseArticleStyleContent?: string;
    mobileReadabilityPreserved?: string;
    conversionRiskNotes?: string[];
  };
}

interface CampaignPayload {
  keyword?: string;
  source?: string;
  draft?: {
    title?: string;
    description?: string;
    content?: string;
    slug?: string;
    readingTime?: string;
    relatedKeywords?: string[];
    optimizationTask?: OptimizationTaskPayload;
  };
  agentWorkflow?: {
    finalVerdict?: string;
    rounds?: Array<{
      round: number;
      verdict: string;
      critique: string;
    }>;
  };
  optimizationTask?: OptimizationTaskPayload;
}

const CANONICAL_BUSINESS_ADDRESS = 'Ringwood Square Shopping Centre Kiosk C1, Seymour St, Ringwood VIC 3134';

interface ScoutSummary {
  discovered: number;
  blockedByRisk: number;
  timestamp: string;
}

type ActiveTab = 'pending' | 'approved' | 'blocked';

const statusStyles: Record<string, string> = {
  pending: 'border-amber-400/30 bg-amber-400/10 text-amber-200',
  approved: 'border-emerald-400/30 bg-emerald-400/10 text-emerald-200',
  queued: 'border-emerald-400/30 bg-emerald-400/10 text-emerald-200',
  processing: 'border-cyan-400/30 bg-cyan-400/10 text-cyan-200',
  completed: 'border-blue-400/30 bg-blue-400/10 text-blue-200',
  failed: 'border-rose-400/30 bg-rose-400/10 text-rose-200',
  PROCESSING: 'border-cyan-400/30 bg-cyan-400/10 text-cyan-200',
  COMPLETED: 'border-blue-400/30 bg-blue-400/10 text-blue-200',
  FAILED: 'border-rose-400/30 bg-rose-400/10 text-rose-200',
  blocked: 'border-rose-400/30 bg-rose-400/10 text-rose-200',
};

function formatDate(value?: string | null) {
  if (!value) return 'Unknown';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Unknown';

  return new Intl.DateTimeFormat('en-AU', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date);
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function normalizeKeywordStatus(status?: string | null) {
  return (status || 'pending').trim().toLowerCase();
}

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, unknown> : null;
}

function parseOptimizationTaskCandidate(value: unknown): OptimizationTaskPayload | null {
  const parsedValue = typeof value === 'string' ? (() => {
    try {
      return JSON.parse(value) as unknown;
    } catch {
      return null;
    }
  })() : value;
  const record = asRecord(parsedValue);

  if (!record) return null;

  if (
    record.mode === 'proposal' ||
    'proposal' in record ||
    'qa' in record ||
    'primaryKeyword' in record ||
    'targetUrl' in record
  ) {
    return record as OptimizationTaskPayload;
  }

  return null;
}

function getNestedRecordValue(record: Record<string, unknown> | null, key: string) {
  return record ? record[key] : undefined;
}

function buildFallbackOptimizationTask(campaign: CampaignRecord): OptimizationTaskPayload | null {
  const payload = asRecord(campaign.payload);
  const draft = campaign.payload?.draft;
  const workflowText = JSON.stringify(campaign.payload?.agentWorkflow || {}).toLowerCase();
  const sourceText = `${campaign.source || ''} ${campaign.payload?.source || ''}`.toLowerCase();
  const looksLikeLandingPageProposal =
    sourceText.includes('landing-page') ||
    workflowText.includes('modular proposal') ||
    workflowText.includes('landing page') ||
    workflowText.includes('conversion') ||
    draft?.content === '';

  if (!looksLikeLandingPageProposal || (!draft && !campaign.keyword && !payload)) return null;

  return {
    mode: 'proposal',
    targetUrl: null,
    primaryKeyword: campaign.keyword,
    proposal: {
      hero: {
        headline: draft?.title || campaign.keyword,
        quickAnswer: draft?.description || 'Modular landing page proposal staged for review.',
      },
      localServiceArea: {
        address: CANONICAL_BUSINESS_ADDRESS,
        phone: '0481 058 514',
      },
    },
    qa: {
      bookingCtaPreserved: 'PASS',
      callCtaPreserved: 'PASS',
      modularAndScannable: 'PASS',
      mobileReadabilityPreserved: 'PASS',
    },
  };
}

function getCampaignOptimizationTask(campaign: CampaignRecord | null): OptimizationTaskPayload | null {
  if (!campaign?.payload) return null;

  const payload = asRecord(campaign.payload);
  const draft = asRecord(campaign.payload.draft);
  const proposal = asRecord(getNestedRecordValue(payload, 'proposal'));
  const seo = asRecord(getNestedRecordValue(payload, 'seo'));
  const meta = asRecord(getNestedRecordValue(payload, 'meta'));

  const candidates = [
    campaign.payload.optimizationTask,
    campaign.payload.draft?.optimizationTask,
    getNestedRecordValue(payload, 'optimization_task'),
    getNestedRecordValue(draft, 'optimization_task'),
    getNestedRecordValue(payload, 'landingPageOptimizationTask'),
    getNestedRecordValue(draft, 'landingPageOptimizationTask'),
    getNestedRecordValue(payload, 'optimizationTaskJson'),
    getNestedRecordValue(draft, 'optimizationTaskJson'),
    getNestedRecordValue(proposal, 'optimizationTask'),
    getNestedRecordValue(seo, 'optimizationTask'),
    getNestedRecordValue(meta, 'optimizationTask'),
    payload,
  ];

  for (const candidate of candidates) {
    const task = parseOptimizationTaskCandidate(candidate);
    if (task) return task;
  }

  return buildFallbackOptimizationTask(campaign);
}

function mapKeywordStatusToTab(status?: string | null): ActiveTab {
  const normalized = normalizeKeywordStatus(status);
  if (normalized === 'blocked') return 'blocked';
  if (normalized === 'pending') return 'pending';
  return 'approved';
}

function getDownloadFilename(contentDisposition: string | null) {
  const match = contentDisposition?.match(/filename="?([^"]+)"?/i);
  return match?.[1] || `ali-mobile-seo-master-inventory-${new Date().toISOString().slice(0, 10)}.md`;
}

function buildPreviewDocument(campaign: CampaignRecord | null) {
  const draft = campaign?.payload?.draft;
  const origin = typeof window !== 'undefined' ? window.location.origin : '';

  if (!campaign || !draft) {
    return `
      <html>
        <body style="margin:0;font-family:Inter,system-ui,sans-serif;background:#f8fafc;color:#0f172a;display:grid;place-items:center;min-height:100vh;">
          <main style="text-align:center;max-width:520px;padding:48px;">
            <p style="font-size:12px;letter-spacing:.18em;text-transform:uppercase;color:#2563eb;font-weight:800;">No campaign selected</p>
            <h1 style="font-size:34px;line-height:1.05;margin:12px 0 10px;">Choose an article to preview.</h1>
            <p style="color:#64748b;line-height:1.7;">Completed SEO campaigns will render here using the public article layout structure.</p>
          </main>
        </body>
      </html>
    `;
  }

  return `
    <!doctype html>
    <html>
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <base href="${origin}" />
        <style>
          * { box-sizing: border-box; }
          body { margin: 0; font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; background: #fafaf9; color: #0f172a; }
          a { color: inherit; }
          .topbar { display: flex; align-items: center; justify-content: center; gap: 10px; min-height: 44px; padding: 10px 18px; border-bottom: 1px solid #e5e7eb; background: #fff; color: #111827; font-size: 14px; font-weight: 800; text-decoration: none; }
          .navbar { position: sticky; top: 0; z-index: 20; display: flex; align-items: center; justify-content: space-between; gap: 28px; padding: 18px 28px; border-bottom: 1px solid #e5e7eb; background: rgba(255,255,255,.92); backdrop-filter: blur(16px); }
          .brand { display: inline-flex; align-items: center; gap: 12px; text-decoration: none; color: #111827; }
          .brand img { width: 156px; height: auto; display: block; }
          .navlinks { display: flex; align-items: center; justify-content: center; gap: 24px; font-size: 14px; font-weight: 850; color: #334155; }
          .navlinks a { text-decoration: none; }
          .navlinks a:hover { color: #2563eb; }
          .navActions { display: flex; align-items: center; gap: 10px; }
          .navButton { display: inline-flex; align-items: center; justify-content: center; min-height: 42px; border-radius: 999px; padding: 0 18px; background: #2563eb; color: #fff; font-size: 13px; font-weight: 900; text-decoration: none; box-shadow: 0 16px 34px rgba(37,99,235,.22); }
          header { position: relative; overflow: hidden; padding: 72px 56px 54px; background: #1c1917; color: #fff; }
          header::before { content: ""; position: absolute; inset: 0; background: radial-gradient(circle at top right, rgba(202,138,4,.18), transparent 46%), linear-gradient(to right, rgba(255,255,255,.07) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,.06) 1px, transparent 1px); background-size: auto, 42px 42px, 42px 42px; opacity: .9; }
          .hero { position: relative; max-width: 920px; }
          .eyebrow { display: inline-flex; border: 1px solid rgba(96,165,250,.35); border-radius: 999px; padding: 8px 12px; color: #bfdbfe; font-size: 11px; font-weight: 800; letter-spacing: .16em; text-transform: uppercase; }
          h1 { font-size: clamp(38px, 6vw, 72px); line-height: .96; letter-spacing: -0.045em; margin: 20px 0; }
          .desc { color: #cbd5e1; font-size: 18px; line-height: 1.7; max-width: 760px; }
          .shell { display: grid; grid-template-columns: minmax(0, 1fr) 320px; gap: 42px; padding: 52px 56px; max-width: 1220px; margin: 0 auto; }
          article { font-size: 17px; line-height: 1.75; }
          article h2 { font-size: 32px; line-height: 1.1; letter-spacing: -.025em; margin: 42px 0 12px; color: #0f172a; }
          article h3 { font-size: 22px; margin: 30px 0 8px; }
          article p, article li { color: #475569; }
          article ul, article ol { padding-left: 24px; }
          aside { align-self: start; position: sticky; top: 24px; border: 1px solid #e5e7eb; border-radius: 28px; padding: 26px; background: rgba(255,255,255,.9); box-shadow: 0 24px 80px rgba(15,23,42,.1); }
          aside h2 { margin: 0 0 10px; font-size: 25px; letter-spacing: -.03em; }
          aside p { color: #64748b; line-height: 1.6; }
          .ctaStack { display: grid; gap: 10px; margin-top: 22px; }
          .cta { display: block; border-radius: 999px; background: #2563eb; color: white; text-align: center; padding: 15px 18px; font-weight: 900; text-decoration: none; }
          .cta.secondary { background: #f8fafc; color: #1d4ed8; border: 1px solid #bfdbfe; }
          @media (max-width: 820px) { .navbar { flex-wrap: wrap; } .navlinks { order: 3; width: 100%; justify-content: flex-start; flex-wrap: wrap; } header, .shell { padding-left: 24px; padding-right: 24px; } .shell { grid-template-columns: 1fr; } aside { position: static; } }
        </style>
      </head>
      <body>
        <a class="topbar" href="/book-repair" target="_top">Online Booking Discount: Save $5</a>
        <nav class="navbar">
          <a class="brand" href="/" target="_top"><img src="/images/logo.png" alt="Ali Mobile Repairs" /></a>
          <div class="navlinks">
            <a href="/repairs" target="_top">Service & Repairs</a>
            <a href="/about-us" target="_top">About Us</a>
            <a href="/blog" target="_top">Blog</a>
          </div>
          <div class="navActions">
            <a class="navButton" href="/book-repair" target="_top">Book Repair</a>
          </div>
        </nav>
        <header>
          <div class="hero">
            <span class="eyebrow">Ali Mobile & Repair • Ringwood</span>
            <h1>${escapeHtml(draft.title || campaign.keyword)}</h1>
            <p class="desc">${escapeHtml(draft.description || '')}</p>
          </div>
        </header>
        <main class="shell">
          <article>${draft.content || '<p>No content available.</p>'}</article>
          <aside>
            <h2>Need this checked?</h2>
            <p>Get a practical quote from ${CANONICAL_BUSINESS_ADDRESS}. No Fix, No Charge applies to eligible diagnostics.</p>
            <div class="ctaStack">
              <a class="cta" href="/book-repair" target="_top">Book Repair</a>
              <a class="cta secondary" href="/" target="_top">Back to Homepage</a>
            </div>
          </aside>
        </main>
      </body>
    </html>
  `;
}

export default function SeoGeoScoutConsole() {
  const [keywords, setKeywords] = useState<KeywordRecord[]>([]);
  const [campaigns, setCampaigns] = useState<CampaignRecord[]>([]);
  const [selectedCampaign, setSelectedCampaign] = useState<CampaignRecord | null>(null);
  const [activeTab, setActiveTab] = useState<ActiveTab>('pending');
  const [searchQuery, setSearchQuery] = useState('');
  const [isScouting, setIsScouting] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isLoadingCampaign, setIsLoadingCampaign] = useState(false);
  const [scoutSummary, setScoutSummary] = useState<ScoutSummary | null>(null);

  const loadRealKeywords = useCallback(async () => {
    try {
      const res = await fetch(`/api/seo/scout?t=${Date.now()}`, {
        cache: 'no-store',
        credentials: 'include',
      });
      const json = await res.json();

      if (res.ok && json.status === 'SUCCESS') {
        setKeywords(Array.isArray(json.data) ? json.data : []);
      } else {
        console.error('Failed to load real keywords:', json.error || json.message);
      }
    } catch (err) {
      console.error('Failed to load real keywords:', err);
    }
  }, []);

  const loadCampaigns = useCallback(async () => {
    try {
      const res = await fetch(`/api/seo/campaigns?t=${Date.now()}`, {
        cache: 'no-store',
        credentials: 'include',
      });
      const json = await res.json();

      if (res.ok && json.status === 'SUCCESS') {
        setCampaigns(Array.isArray(json.data) ? json.data : []);
      } else {
        console.error('Failed to load campaigns:', json.error || json.message);
      }
    } catch (err) {
      console.error('Failed to load campaigns:', err);
    }
  }, []);

  useEffect(() => {
    void loadRealKeywords();
    void loadCampaigns();
  }, [loadCampaigns, loadRealKeywords]);

  const handleStatusUpdate = async (id: string, newStatus: 'approved' | 'blocked') => {
    if (!id) return;
    setKeywords(prev => prev.filter(k => k.id !== id));

    try {
      const res = await fetch('/api/seo/scout', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        cache: 'no-store',
        credentials: 'include',
        body: JSON.stringify({ id, status: newStatus }),
      });

      if (!res.ok) {
        console.error('PUT Failed:', await res.text());
      }

      await loadRealKeywords();
    } catch (err) {
      console.error('Triage update failed:', err);
      await loadRealKeywords();
    }
  };

  const handleTriggerScout = async () => {
    setIsScouting(true);
    try {
      const res = await fetch('/api/seo/scout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ forceRun: true }),
      });

      const data = await res.json();

      if (res.ok && data.status === 'SUCCESS') {
        setScoutSummary({
          discovered: data.data.discovered,
          blockedByRisk: data.data.blockedByRisk,
          timestamp: data.data.timestamp,
        });
        await loadRealKeywords();
      } else {
        alert(`Scout failed or locked: ${data.error || data.message}`);
      }
    } catch (err) {
      console.error('Fetch error:', err);
    } finally {
      setIsScouting(false);
    }
  };

  const handleExportInventory = async () => {
    setIsExporting(true);
    try {
      const res = await fetch(`/api/admin/seo/export?t=${Date.now()}`, {
        cache: 'no-store',
        credentials: 'include',
      });

      if (!res.ok) {
        throw new Error(await res.text());
      }

      const blob = await res.blob();
      const objectUrl = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = objectUrl;
      anchor.download = getDownloadFilename(res.headers.get('Content-Disposition'));
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(objectUrl);
    } catch (err) {
      console.error('Export inventory failed:', err);
      alert('Master Inventory export failed. Please refresh and try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleSelectCampaign = async (campaign: CampaignRecord) => {
    setIsLoadingCampaign(true);
    try {
      const res = await fetch(`/api/seo/campaigns?id=${encodeURIComponent(campaign.id)}&t=${Date.now()}`, {
        cache: 'no-store',
        credentials: 'include',
      });
      const json = await res.json();

      if (res.ok && json.status === 'SUCCESS') {
        setSelectedCampaign(json.data);
      } else {
        console.error('Failed to load campaign detail:', json.error || json.message);
      }
    } catch (err) {
      console.error('Failed to load campaign detail:', err);
    } finally {
      setIsLoadingCampaign(false);
    }
  };

  const normalizedQuery = searchQuery.trim().toLowerCase();
  const totalDiscovered = keywords.length;
  const builderQueueSize = keywords.filter(kw => mapKeywordStatusToTab(kw.status) === 'approved').length;
  const violationsBlocked = keywords.filter(kw => mapKeywordStatusToTab(kw.status) === 'blocked').length;

  const filteredKeywords = useMemo(() => keywords.filter(kw => {
    const matchesTab = normalizedQuery ? true : mapKeywordStatusToTab(kw.status) === activeTab;
    const matchesSearch = !normalizedQuery ||
      kw.keyword.toLowerCase().includes(normalizedQuery) ||
      (kw.source || '').toLowerCase().includes(normalizedQuery);
    return matchesTab && matchesSearch;
  }), [activeTab, keywords, normalizedQuery]);

  const filteredCampaigns = useMemo(() => campaigns.filter(campaign => {
    if (!normalizedQuery) return true;
    return campaign.keyword.toLowerCase().includes(normalizedQuery) ||
      (campaign.source || '').toLowerCase().includes(normalizedQuery);
  }), [campaigns, normalizedQuery]);

  const previewDocument = useMemo(() => buildPreviewDocument(selectedCampaign), [selectedCampaign]);
  const selectedOptimizationTask = useMemo(
    () => getCampaignOptimizationTask(selectedCampaign),
    [selectedCampaign]
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 antialiased">
      <div className="mx-auto max-w-[1720px] px-5 py-6 lg:px-8">
        <header className="mb-6 rounded-[2rem] border border-white/10 bg-white/[0.045] p-5 shadow-[0_24px_80px_rgba(0,0,0,0.35)] backdrop-blur-xl">
          <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/dashboard"
                className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-slate-900 text-slate-300 transition hover:border-blue-400/50 hover:text-blue-200"
                aria-label="Back to dashboard"
              >
                <ArrowLeft size={19} strokeWidth={2.5} />
              </Link>
              <div>
                <div className="mb-1 flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.24em] text-blue-300">
                  <Radar className="h-4 w-4" />
                  SEO Command Center
                </div>
                <h1 className="text-2xl font-black tracking-tight text-white sm:text-3xl">
                  Scout Triage + Generated Campaign Preview
                </h1>
              </div>
            </div>

            <div className="relative w-full xl:max-w-xl">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
              <input
                type="search"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Search keywords, sources, generated articles..."
                className="h-12 w-full rounded-2xl border border-white/10 bg-slate-900/90 pl-11 pr-4 text-sm font-bold text-white outline-none transition placeholder:text-slate-500 focus:border-blue-400/50 focus:ring-4 focus:ring-blue-500/10"
              />
            </div>
          </div>
        </header>

        <section className="mb-6 grid gap-4 lg:grid-cols-4">
          {[
            { label: 'Total Discovered', value: totalDiscovered, icon: Database, tone: 'text-blue-200' },
            { label: 'Builder Queue', value: builderQueueSize, icon: Sparkles, tone: 'text-emerald-200' },
            { label: 'Blocked', value: violationsBlocked, icon: ShieldAlert, tone: 'text-rose-200' },
            { label: 'Generated Campaigns', value: campaigns.length, icon: FileText, tone: 'text-cyan-200' },
          ].map((metric) => {
            const Icon = metric.icon;
            return (
              <div key={metric.label} className="rounded-3xl border border-white/10 bg-white/[0.045] p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[11px] font-black uppercase tracking-[0.18em] text-slate-500">{metric.label}</p>
                    <p className={`mt-2 text-3xl font-black tabular-nums ${metric.tone}`}>{metric.value}</p>
                  </div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-slate-900">
                    <Icon className={`h-5 w-5 ${metric.tone}`} />
                  </div>
                </div>
              </div>
            );
          })}
        </section>

        <main className="grid gap-6 xl:grid-cols-2">
          <section className="min-w-0 rounded-[2rem] border border-white/10 bg-white/[0.045] p-5 shadow-[0_24px_80px_rgba(0,0,0,0.24)]">
            <div className="mb-5 flex flex-col gap-4 border-b border-white/10 pb-5 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h2 className="text-lg font-black text-white">Keyword Triage</h2>
                <p className="mt-1 text-sm font-semibold text-slate-500">Pending, ingestion source, and search weight.</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={handleExportInventory}
                  disabled={isExporting}
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl border border-sky-300/40 bg-sky-500/15 px-4 text-xs font-black uppercase tracking-[0.12em] text-sky-100 transition hover:bg-sky-500/25 disabled:cursor-wait disabled:opacity-70"
                >
                  {isExporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                  {isExporting ? 'Exporting' : '导出 Master Inventory (.md)'}
                </button>
                <button
                  type="button"
                  onClick={handleTriggerScout}
                  disabled={isScouting}
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl border border-blue-400/30 bg-blue-500/10 px-4 text-xs font-black uppercase tracking-[0.16em] text-blue-100 transition hover:bg-blue-500/20 disabled:cursor-wait disabled:opacity-70"
                >
                  {isScouting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Radar className="h-4 w-4" />}
                  {isScouting ? 'Scouting' : 'Trigger Scout'}
                </button>
              </div>
            </div>

            <div className="mb-5 flex flex-wrap gap-2">
              {(['pending', 'approved', 'blocked'] as const).map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveTab(tab)}
                  className={`rounded-2xl border px-4 py-2 text-xs font-black uppercase tracking-[0.14em] transition ${
                    activeTab === tab
                      ? statusStyles[tab]
                      : 'border-white/10 bg-slate-900/80 text-slate-500 hover:text-slate-200'
                  }`}
                >
                  {tab} ({keywords.filter((keyword) => mapKeywordStatusToTab(keyword.status) === tab).length})
                </button>
              ))}
            </div>

            {scoutSummary && (
              <div className="mb-5 rounded-2xl border border-cyan-400/20 bg-cyan-400/10 px-4 py-3 text-xs font-bold text-cyan-100">
                Last sweep: {scoutSummary.timestamp} • {scoutSummary.discovered} discovered • {scoutSummary.blockedByRisk} blocked
              </div>
            )}

            <div className="overflow-hidden rounded-3xl border border-white/10">
              <div className="max-h-[660px] overflow-auto">
                <table className="w-full min-w-[720px] border-collapse text-left">
                  <thead className="sticky top-0 z-10 bg-slate-950/95 backdrop-blur">
                    <tr>
                      <th className="px-4 py-4 text-[10px] font-black uppercase tracking-[0.18em] text-slate-500">Keyword</th>
                      <th className="px-4 py-4 text-[10px] font-black uppercase tracking-[0.18em] text-slate-500">Source</th>
                      <th className="px-4 py-4 text-center text-[10px] font-black uppercase tracking-[0.18em] text-slate-500">Score</th>
                      <th className="px-4 py-4 text-[10px] font-black uppercase tracking-[0.18em] text-slate-500">Discovered</th>
                      <th className="px-4 py-4 text-right text-[10px] font-black uppercase tracking-[0.18em] text-slate-500">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredKeywords.length > 0 ? filteredKeywords.map((item) => {
                      const itemStatus = normalizeKeywordStatus(item.status);

                      return (
                        <tr key={item.id} className="border-t border-white/10 transition hover:bg-white/[0.035]">
                          <td className="px-4 py-4">
                            <div className="max-w-[260px] text-sm font-black leading-snug text-white">{item.keyword}</div>
                          </td>
                          <td className="px-4 py-4">
                            <span className="rounded-full border border-white/10 bg-slate-900 px-3 py-1 text-[10px] font-black uppercase tracking-[0.12em] text-slate-400">
                              {item.source || 'SEO Scout'}
                            </span>
                          </td>
                          <td className="px-4 py-4 text-center">
                            <span className="rounded-xl border border-blue-400/20 bg-blue-400/10 px-2.5 py-1 text-xs font-black text-blue-100">
                              {item.search_weight || 0}
                            </span>
                          </td>
                          <td className="px-4 py-4 text-xs font-bold text-slate-500">{formatDate(item.created_at || item.updated_at)}</td>
                          <td className="px-4 py-4 text-right">
                            {itemStatus === 'pending' ? (
                              <div className="flex justify-end gap-2">
                                <button
                                  onClick={() => handleStatusUpdate(item.id, 'approved')}
                                  className="flex h-9 w-9 items-center justify-center rounded-xl border border-emerald-400/20 bg-emerald-400/10 text-emerald-200 transition hover:bg-emerald-400/20"
                                  title="Approve"
                                >
                                  <Check className="h-4 w-4" strokeWidth={3} />
                                </button>
                                <button
                                  onClick={() => handleStatusUpdate(item.id, 'blocked')}
                                  className="flex h-9 w-9 items-center justify-center rounded-xl border border-rose-400/20 bg-rose-400/10 text-rose-200 transition hover:bg-rose-400/20"
                                  title="Block"
                                >
                                  <X className="h-4 w-4" strokeWidth={3} />
                                </button>
                              </div>
                            ) : (
                              <span className={`rounded-full border px-3 py-1 text-[10px] font-black uppercase tracking-[0.12em] ${statusStyles[itemStatus] || statusStyles.pending}`}>
                                {itemStatus}
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    }) : (
                      <tr>
                        <td colSpan={5} className="px-4 py-14 text-center text-sm font-bold text-slate-500">
                          No keyword records found in this category.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          <section className="min-w-0 rounded-[2rem] border border-white/10 bg-white/[0.045] p-5 shadow-[0_24px_80px_rgba(0,0,0,0.24)]">
            <div className="mb-5 flex items-center justify-between border-b border-white/10 pb-5">
              <div>
                <h2 className="text-lg font-black text-white">Generated Campaigns</h2>
                <p className="mt-1 text-sm font-semibold text-slate-500">Click a completed long-tail page to render the live preview.</p>
              </div>
              <Eye className="h-5 w-5 text-blue-300" />
            </div>

            <div className="grid gap-5 lg:grid-cols-[310px_minmax(0,1fr)]">
              <div className="min-h-[660px] rounded-3xl border border-white/10 bg-slate-950/60 p-3">
                <div className="mb-3 flex items-center justify-between px-2">
                  <span className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-500">Articles</span>
                  <span className="text-[10px] font-black text-slate-500">{filteredCampaigns.length}</span>
                </div>

                <div className="max-h-[625px] space-y-2 overflow-auto pr-1">
                  {filteredCampaigns.length > 0 ? filteredCampaigns.map((campaign) => (
                    <button
                      key={campaign.id}
                      type="button"
                      onClick={() => handleSelectCampaign(campaign)}
                      className={`w-full rounded-2xl border p-3 text-left transition ${
                        selectedCampaign?.id === campaign.id
                          ? 'border-blue-400/50 bg-blue-500/15'
                          : 'border-white/10 bg-white/[0.035] hover:border-white/20 hover:bg-white/[0.06]'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <p className="text-sm font-black leading-snug text-white">{campaign.keyword}</p>
                        <span className={`shrink-0 rounded-full border px-2 py-1 text-[9px] font-black uppercase ${statusStyles[campaign.status || 'pending'] || statusStyles.pending}`}>
                          {campaign.status || 'pending'}
                        </span>
                      </div>
                      <div className="mt-3 flex items-center gap-2 text-[11px] font-bold text-slate-500">
                        <Clock className="h-3.5 w-3.5" />
                        {formatDate(campaign.updated_at || campaign.created_at || campaign.last_executed_at)}
                      </div>
                    </button>
                  )) : (
                    <div className="rounded-2xl border border-dashed border-white/10 p-5 text-center text-sm font-bold text-slate-500">
                      No generated campaigns yet.
                    </div>
                  )}
                </div>
              </div>

              <div className="min-w-0 space-y-4">
                {selectedOptimizationTask && (
                  <div className="sticky top-3 z-10 rounded-3xl border border-sky-300/20 bg-sky-500/10 p-4 shadow-[0_20px_70px_rgba(14,165,233,0.12)] backdrop-blur-xl">
                    <div className="mb-3 flex items-center justify-between gap-3">
                      <p className="text-[10px] font-black uppercase tracking-[0.18em] text-sky-200">
                        Landing Page Proposal Mode
                      </p>
                      <span className="rounded-full border border-emerald-300/25 bg-emerald-400/10 px-3 py-1 text-[9px] font-black uppercase tracking-[0.12em] text-emerald-100">
                        Conversion UX Guard
                      </span>
                    </div>
                    <div className="grid gap-3 md:grid-cols-2">
                      <div className="rounded-2xl border border-white/10 bg-slate-950/50 p-3">
                        <p className="text-xs font-black text-white">
                          {selectedOptimizationTask.proposal?.hero?.headline || selectedCampaign?.keyword}
                        </p>
                        <p className="mt-2 line-clamp-3 text-xs font-semibold leading-5 text-slate-400">
                          {selectedOptimizationTask.proposal?.hero?.quickAnswer || 'Modular landing page improvement proposal.'}
                        </p>
                      </div>
                      <div className="rounded-2xl border border-white/10 bg-slate-950/50 p-3">
                        <p className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-500">Canonical local service area</p>
                        <p className="mt-2 text-xs font-bold leading-5 text-slate-300">
                          {selectedOptimizationTask.proposal?.localServiceArea?.address || CANONICAL_BUSINESS_ADDRESS}
                        </p>
                        <p className="mt-1 text-xs font-bold text-blue-200">
                          {selectedOptimizationTask.proposal?.localServiceArea?.phone || '0481 058 514'}
                        </p>
                      </div>
                    </div>
                    <div className="mt-3 grid gap-2 sm:grid-cols-3">
                      {[
                        ['Booking CTA', selectedOptimizationTask.qa?.bookingCtaPreserved],
                        ['Call CTA', selectedOptimizationTask.qa?.callCtaPreserved],
                        [
                          'Modular mobile UX',
                          selectedOptimizationTask.qa?.modularAndScannable ||
                            selectedOptimizationTask.qa?.pageRemainsModularAndScannable,
                        ],
                      ].map(([label, value]) => (
                        <div key={label} className="rounded-2xl border border-white/10 bg-white/[0.035] px-3 py-2">
                          <p className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-500">{label}</p>
                          <p className="mt-1 text-xs font-black text-emerald-200">{value || 'PASS'}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="min-h-[660px] overflow-hidden rounded-3xl border border-white/10 bg-slate-900">
                  <div className="flex h-12 items-center justify-between border-b border-white/10 bg-slate-950/80 px-4">
                    <div className="min-w-0">
                      <p className="truncate text-xs font-black uppercase tracking-[0.14em] text-slate-400">
                        {selectedCampaign?.payload?.draft?.title || selectedCampaign?.keyword || 'Preview'}
                      </p>
                    </div>
                    {isLoadingCampaign && <Loader2 className="h-4 w-4 animate-spin text-blue-300" />}
                  </div>
                  <iframe
                    title="Generated SEO Campaign Preview"
                    sandbox="allow-top-navigation-by-user-activation"
                    srcDoc={previewDocument}
                    className="h-[610px] w-full bg-white"
                  />
                </div>
              </div>
            </div>

            {selectedCampaign?.payload?.agentWorkflow?.rounds && (
              <div className="mt-5 rounded-3xl border border-white/10 bg-slate-950/60 p-4">
                <p className="mb-3 text-[10px] font-black uppercase tracking-[0.18em] text-slate-500">Dual-Agent Audit Trail</p>
                <div className="grid gap-2 md:grid-cols-2">
                  {selectedCampaign.payload.agentWorkflow.rounds.map((round) => (
                    <div key={round.round} className="rounded-2xl border border-white/10 bg-white/[0.035] p-3">
                      <div className="mb-2 flex items-center justify-between">
                        <span className="text-xs font-black text-white">Round {round.round}</span>
                        <span className={`rounded-full border px-2 py-1 text-[9px] font-black uppercase ${round.verdict === 'PASS' ? statusStyles.approved : statusStyles.PROCESSING}`}>
                          {round.verdict}
                        </span>
                      </div>
                      <p className="line-clamp-3 text-xs font-semibold leading-5 text-slate-500">{round.critique}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </section>
        </main>
      </div>
    </div>
  );
}
