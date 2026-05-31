import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import { ArrowRight, Calendar, Clock, ShieldCheck, Star, Wrench } from 'lucide-react';
import SeoKeywordTracker from '@/components/analytics/SeoKeywordTracker';
import { fetchRepairCatalog, type BrandEntry, type ModelEntry } from '@/lib/api';

export const dynamic = 'force-dynamic';

const PUBLIC_CAMPAIGN_STATUSES = new Set(['approved', 'published']);

type CampaignPayload = {
  draft?: {
    title?: string;
    description?: string;
    content?: string;
    slug?: string;
    readingTime?: string;
    relatedKeywords?: string[];
  };
  jsonLd?: unknown;
};

type CampaignRow = {
  id: string;
  keyword: string;
  status?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
  payload?: CampaignPayload | null;
};

type SeoArticle = {
  keyword: string;
  title: string;
  metaDescription: string;
  author: string;
  readingTime: string;
  lastUpdated: string;
  content: string;
  relatedKeywords: string[];
  rating?: number;
  reviewCount?: number;
  jsonLd?: unknown;
  repairTarget: RepairTarget;
};

type RepairTarget = {
  href: string;
  label: string;
  context: string;
  precision: 'repair' | 'model' | 'brand' | 'category';
};

function normalizeCampaignStatus(status?: string | null) {
  return (status || '').trim().toLowerCase();
}

function isPublicCampaignStatus(status?: string | null) {
  return PUBLIC_CAMPAIGN_STATUSES.has(normalizeCampaignStatus(status));
}

function getPublicSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase public credentials for SEO article page.');
  }

  return createClient(supabaseUrl, supabaseKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 90);
}

function normalizeText(text: string) {
  return text
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function displayBrandName(brand: string) {
  return /^[ptcw]\s+/i.test(brand) ? brand.slice(2).trim() : brand;
}

function getRepairIntent(text: string) {
  const normalized = normalizeText(text);
  const intents = [
    { slug: 'screen-replacement', label: 'screen replacement', tokens: ['screen', 'display', 'lcd', 'oled', 'glass', 'cracked'] },
    { slug: 'battery-replacement', label: 'battery replacement', tokens: ['battery', 'charging fast drain', 'not holding charge'] },
    { slug: 'charging-port-replacement', label: 'charging port repair', tokens: ['charging port', 'charge port', 'not charging', 'charger port'] },
    { slug: 'back-housing-replacement', label: 'back glass repair', tokens: ['back glass', 'back housing', 'rear glass', 'rear panel'] },
    { slug: 'camera-repair', label: 'camera repair', tokens: ['camera', 'lens'] },
    { slug: 'water-damage-repair', label: 'water damage repair', tokens: ['water damage', 'liquid damage', 'wet phone'] },
  ];

  return intents.find((intent) => intent.tokens.some((token) => normalized.includes(token))) || null;
}

function getCategoryIntent(text: string): 'phone' | 'tablet' | 'laptop' | 'watch' {
  const normalized = normalizeText(text);
  if (/\b(ipad|tablet|galaxy tab|tab)\b/.test(normalized)) return 'tablet';
  if (/\b(macbook|laptop|imac|computer|pc)\b/.test(normalized)) return 'laptop';
  if (/\b(apple watch|iwatch|galaxy watch|watch)\b/.test(normalized)) return 'watch';
  return 'phone';
}

function getBrandAliases(brand: BrandEntry) {
  const name = normalizeText(displayBrandName(brand.brand));
  const aliases = new Set([name, normalizeText(brand.slug)]);

  if (name.includes('iphone')) aliases.add('iphone');
  if (name.includes('ipad')) aliases.add('ipad');
  if (name.includes('samsung')) {
    aliases.add('samsung');
    aliases.add('galaxy');
  }
  if (name.includes('google') || name.includes('pixel')) {
    aliases.add('google pixel');
    aliases.add('pixel');
  }
  if (name.includes('oppo')) aliases.add('oppo');
  if (name.includes('macbook')) aliases.add('macbook');
  if (name.includes('watch')) {
    aliases.add('apple watch');
    aliases.add('iwatch');
    aliases.add('watch');
  }

  return Array.from(aliases).filter(Boolean);
}

function getMatchedBrand(brands: BrandEntry[], text: string, category: string) {
  const normalized = normalizeText(text);
  const categoryBrands = brands.filter((brand) => brand.category === category);
  return categoryBrands.find((brand) =>
    getBrandAliases(brand).some((alias) => new RegExp(`\\b${alias.replace(/\s+/g, '\\s+')}\\b`).test(normalized))
  ) || null;
}

function getModelScore(model: ModelEntry, text: string) {
  const normalized = normalizeText(text);
  const modelName = normalizeText(model.model);

  if (!modelName) return 0;
  if (normalized.includes(modelName)) return 100;
  if (model.modelCode && normalizeText(model.modelCode).split(' ').some((code) => code.length >= 4 && normalized.includes(code))) return 90;

  const tokens = modelName
    .split(' ')
    .filter((token) => token.length >= 2 && !['pro', 'max', 'plus', 'mini', 'ultra', 'series', 'gen', 'inch'].includes(token));
  if (!tokens.length) return 0;

  const matched = tokens.filter((token) => new RegExp(`\\b${token}\\b`).test(normalized)).length;
  return matched === tokens.length ? 80 : matched;
}

function resolveRepairTarget(keyword: string, title: string, description: string): Promise<RepairTarget> {
  const haystack = `${keyword} ${title} ${description}`;
  const category = getCategoryIntent(haystack);
  const repairIntent = getRepairIntent(haystack);

  return fetchRepairCatalog().then((catalog) => {
    const brand = getMatchedBrand(catalog.brands, haystack, category);

    if (!brand) {
      const categoryLabel = `${category.charAt(0).toUpperCase()}${category.slice(1)} repair`;
      return {
        href: `/repairs/${category}`,
        label: `View ${categoryLabel}`,
        context: `Matched the keyword to the ${category} repair hub.`,
        precision: 'category',
      };
    }

    const bestModel = brand.models
      .map((model) => ({ model, score: getModelScore(model, haystack) }))
      .sort((a, b) => b.score - a.score)[0];
    const model = bestModel && bestModel.score >= 2 ? bestModel.model : null;

    if (!model) {
      const brandName = displayBrandName(brand.brand);
      return {
        href: `/repairs/${category}/${brand.slug}`,
        label: `View ${brandName} repairs`,
        context: repairIntent
          ? `Matched ${brandName} and ${repairIntent.label}, but no exact model was named.`
          : `Matched ${brandName}, but no exact model was named.`,
        precision: 'brand',
      };
    }

    if (repairIntent) {
      const repair = model.repairTypes.find((item) => item.slug === repairIntent.slug)
        || model.repairTypes.find((item) => normalizeText(item.name).includes(normalizeText(repairIntent.label).split(' ')[0]));

      if (repair) {
        return {
          href: `/repairs/${category}/${brand.slug}/${model.slug}/${repair.slug}`,
          label: `View ${model.model} ${repair.name}`,
          context: `Matched this article to the closest repair service page.`,
          precision: 'repair',
        };
      }
    }

    return {
      href: `/repairs/${category}/${brand.slug}/${model.slug}`,
      label: `View ${model.model} repairs`,
      context: `Matched the keyword to this model page.`,
      precision: 'model',
    };
  });
}

function formatDate(value?: string | null) {
  if (!value) return 'Recently';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Recently';

  return new Intl.DateTimeFormat('en-AU', {
    dateStyle: 'medium',
  }).format(date);
}

async function getSeoArticle(keywordSlug: string): Promise<SeoArticle | null> {
  const supabase = getPublicSupabaseClient();
  const { data, error } = await supabase
    .from('pending_seo_campaigns')
    .select('id, keyword, status, created_at, updated_at, payload')
    .order('created_at', { ascending: false, nullsFirst: false })
    .limit(250);

  if (error) {
    console.error('[seo-page] Failed to load generated SEO campaigns:', error);
    return null;
  }

  const campaigns = (data || []) as CampaignRow[];
  const campaign = campaigns.find((row) => {
    if (!isPublicCampaignStatus(row.status)) {
      return false;
    }
    const draftSlug = row.payload?.draft?.slug;
    return draftSlug === keywordSlug || slugify(row.keyword) === keywordSlug;
  });
  const draft = campaign?.payload?.draft;

  if (!campaign || !draft?.title || !draft?.description || !draft?.content) {
    return null;
  }

  const repairTarget = await resolveRepairTarget(campaign.keyword, draft.title, draft.description);

  return {
    keyword: campaign.keyword,
    title: draft.title,
    metaDescription: draft.description,
    author: 'Ali Mobile Repair Technicians',
    readingTime: draft.readingTime || '5 min read',
    lastUpdated: formatDate(campaign.updated_at || campaign.created_at),
    content: draft.content,
    relatedKeywords: draft.relatedKeywords || ['phone repair', 'screen repair', 'battery replacement'],
    jsonLd: campaign.payload?.jsonLd,
    repairTarget,
  };
}

export async function generateMetadata({ params }: { params: Promise<{ keyword: string }> }): Promise<Metadata> {
  const { keyword } = await params;
  const article = await getSeoArticle(keyword);

  if (!article) {
    return {
      title: 'SEO Article Not Found | Ali Mobile Repair',
    };
  }

  return {
    title: `${article.title} | Ali Mobile Repair`,
    description: article.metaDescription,
  };
}

export default async function SeoArticlePage({ params }: { params: Promise<{ keyword: string }> }) {
  const { keyword } = await params;
  const article = await getSeoArticle(keyword);

  if (!article) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-[#FAFAF9] pb-24 font-sans text-[#0C0A09] selection:bg-[#CA8A04] selection:text-white">
      <SeoKeywordTracker keyword={article.keyword} slug={keyword} />
      {article.jsonLd ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(article.jsonLd) }}
        />
      ) : null}

      <div className="relative overflow-hidden border-b border-[#44403C] bg-[#1C1917] pb-20 pt-32 text-white lg:pb-28 lg:pt-40">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(202,138,4,0.15),transparent_50%)]" />
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff0a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0a_1px,transparent_1px)] bg-[size:40px_40px] opacity-20" />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <div className="mb-6 flex flex-wrap items-center gap-4 text-sm font-medium tracking-wide text-gray-300">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-emerald-400">
                <ShieldCheck className="h-4 w-4" />
                Technician-reviewed article
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="h-4 w-4 text-gray-400" />
                Reading Time: {article.readingTime}
              </span>
              <span className="flex items-center gap-1.5">
                <Calendar className="h-4 w-4 text-gray-400" />
                Updated: {article.lastUpdated}
              </span>
            </div>

            <h1 className="mb-6 text-4xl font-bold leading-[1.1] tracking-tight text-white drop-shadow-sm sm:text-5xl lg:text-6xl">
              {article.title}
            </h1>

            <p className="text-xl font-light leading-relaxed text-gray-400 sm:text-2xl">
              {article.metaDescription}
            </p>

            <div className="mt-10 flex items-center gap-6 border-t border-white/10 pt-10">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-tr from-yellow-500 to-amber-300 text-lg font-bold text-[#1C1917]">
                  A
                </div>
                <div>
                  <div className="text-sm font-semibold text-white">{article.author}</div>
                  <div className="text-xs text-gray-400">Ringwood repair team</div>
                </div>
              </div>
              <div className="h-8 w-px bg-white/10" />
              <div>
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                  ))}
                  {article.rating && <span className="ml-1 text-sm font-bold text-white">{article.rating}</span>}
                </div>
                <div className="text-xs text-gray-400">
                  {article.reviewCount ? `Based on ${article.reviewCount}+ reviews` : 'See our latest Google reviews'}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-8">
            <article
              className="prose prose-slate max-w-none prose-headings:font-bold prose-headings:tracking-tight prose-headings:text-[#1C1917] prose-p:leading-relaxed prose-p:text-[#44403C] prose-a:text-[#CA8A04] prose-a:no-underline hover:prose-a:underline prose-strong:font-semibold prose-strong:text-[#1C1917] prose-li:text-[#44403C] prose-ul:list-disc prose-blockquote:border-l-4 prose-blockquote:border-[#CA8A04] prose-blockquote:bg-yellow-50/50 prose-blockquote:px-6 prose-blockquote:py-4 prose-blockquote:italic prose-blockquote:text-[#1C1917] prose-img:rounded-2xl prose-img:shadow-xl lg:prose-xl"
              dangerouslySetInnerHTML={{ __html: article.content }}
            />

            <div className="mt-16 border-t border-gray-200 pt-8">
              <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-[#1C1917]">Related Topics</h3>
              <div className="flex flex-wrap gap-2">
                {article.relatedKeywords.map((tag) => (
                  <span key={tag} className="rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-[#44403C] shadow-sm">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-4">
            <div className="sticky top-32">
              <div className="overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all duration-300 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)]">
                <div className="relative overflow-hidden bg-[#1C1917] p-8 text-center">
                  <div className="absolute -right-12 -top-12 h-32 w-32 rounded-full bg-[#CA8A04] opacity-40 blur-[40px]" />
                  <div className="absolute -bottom-12 -left-12 h-32 w-32 rounded-full bg-yellow-600 opacity-20 blur-[40px]" />
                  <Wrench className="relative z-10 mx-auto mb-5 h-12 w-12 text-[#CA8A04]" />
                  <h3 className="relative z-10 mb-2 text-2xl font-bold tracking-tight text-white">
                    Need a hands-on check?
                  </h3>
                  <p className="relative z-10 text-sm text-gray-400">
                    Get a practical quote from our Ringwood bench.
                  </p>
                </div>

                <div className="space-y-8 p-8">
                  <ul className="space-y-4">
                    {[
                      'Clear quote before repair',
                      'Fast turnaround when parts are in stock',
                      'Premium-grade parts available',
                      '6-month warranty on eligible repairs',
                    ].map((feature) => (
                      <li key={feature} className="flex items-start gap-3">
                        <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-emerald-200 bg-emerald-50">
                          <svg className="h-3 w-3 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <span className="text-sm font-medium text-[#44403C]">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="grid gap-3 pt-2">
                    <Link href={article.repairTarget.href} className="group flex w-full items-center justify-center gap-2 rounded-xl bg-[#CA8A04] px-6 py-4 font-bold text-white shadow-lg shadow-yellow-500/25 transition-all duration-300 hover:-translate-y-0.5 hover:bg-yellow-500 hover:shadow-xl hover:shadow-yellow-500/30">
                      {article.repairTarget.label}
                      <ArrowRight className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
                    </Link>
                    <Link href="/book-repair" className="flex w-full items-center justify-center rounded-xl border border-blue-100 bg-blue-50 px-6 py-4 font-bold text-blue-700 transition hover:border-blue-200 hover:bg-blue-100">
                      Book Repair
                    </Link>
                    <p className="mt-4 text-center text-xs font-medium uppercase tracking-wider text-gray-400">
                      {article.repairTarget.context}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-6 rounded-2xl border border-gray-200 bg-[#FAFAF9] p-6 shadow-sm">
                <div className="text-sm font-bold text-[#1C1917]">Ali Mobile & Repair</div>
                <div className="mt-1 text-xs leading-5 text-[#44403C]">
                  Ringwood Square Shopping Centre Kiosk C1, Seymour St, Ringwood VIC 3134. Call 0481 058 514 for a quick model check.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
