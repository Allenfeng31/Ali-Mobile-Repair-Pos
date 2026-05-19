import { execFile } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

const execFileAsync = promisify(execFile);
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..');

for (const envPath of [
  path.join(repoRoot, '.env'),
  path.join(repoRoot, 'server/.env'),
  path.join(repoRoot, 'storefront/.env.local'),
  path.join(repoRoot, 'storefront/.env'),
]) {
  dotenv.config({ path: envPath });
}

const POLL_INTERVAL_MS = Number(process.env.SEO_WORKER_POLL_INTERVAL_MS || 15_000);
const MAX_BATCH_SIZE = Number(process.env.SEO_WORKER_BATCH_SIZE || 5);
const QUEUE_STATUSES = ['approved', 'queued'] as const;

type SeoKeywordStatus = 'approved' | 'queued' | 'PROCESSING' | 'COMPLETED' | 'FAILED';

type SeoKeywordRow = {
  id: string;
  keyword: string;
  source?: string | null;
  search_weight?: number | null;
  status: SeoKeywordStatus;
};

type GeneratedSeoDraft = {
  title: string;
  description: string;
  date: string;
  image: string;
  slug: string;
  content: string;
};

const bannedBuilderWords = [
  'Revolutionize',
  'Furthermore',
  'Elevate',
  'In conclusion',
  'Seamless',
  'Delve',
  'Testament',
];

function getSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error(
      'Missing Supabase credentials. Set NEXT_PUBLIC_SUPABASE_URL or VITE_SUPABASE_URL, plus SUPABASE_SERVICE_ROLE_KEY.'
    );
  }

  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.warn('[seo-worker] SUPABASE_SERVICE_ROLE_KEY is missing; falling back to anon key. RLS may block worker updates.');
  }

  return createClient(supabaseUrl, supabaseKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

const supabase = getSupabaseClient();

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function formatError(error: unknown) {
  return error instanceof Error ? error.message : String(error);
}

function assertBuilderPayloadIsClean(draft: GeneratedSeoDraft) {
  const serialized = JSON.stringify(draft);
  const violations = bannedBuilderWords.filter((word) => serialized.toLowerCase().includes(word.toLowerCase()));

  if (violations.length > 0) {
    throw new Error(`Generated SEO draft contains banned Builder language: ${violations.join(', ')}`);
  }
}

async function updateKeywordStatus(id: string, status: SeoKeywordStatus) {
  const { error } = await supabase
    .from('seo_keywords')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', id);

  if (error) {
    throw new Error(`Failed to update keyword ${id} to ${status}: ${error.message}`);
  }
}

async function claimKeyword(row: SeoKeywordRow) {
  const { data, error } = await supabase
    .from('seo_keywords')
    .update({ status: 'PROCESSING', updated_at: new Date().toISOString() })
    .eq('id', row.id)
    .in('status', QUEUE_STATUSES)
    .select('id, keyword, source, search_weight, status')
    .maybeSingle<SeoKeywordRow>();

  if (error) {
    throw new Error(`Failed to claim keyword "${row.keyword}": ${error.message}`);
  }

  return data;
}

async function fetchQueuedKeywords() {
  const { data, error } = await supabase
    .from('seo_keywords')
    .select('id, keyword, source, search_weight, status')
    .in('status', QUEUE_STATUSES)
    .order('updated_at', { ascending: true, nullsFirst: true })
    .limit(MAX_BATCH_SIZE);

  if (error) {
    throw new Error(`Failed to fetch queued SEO keywords: ${error.message}`);
  }

  return (data || []) as SeoKeywordRow[];
}

async function generateSeoDraft(keyword: string) {
  const scriptPath = path.join(repoRoot, 'scripts/generate-blog.mjs');
  const { stdout } = await execFileAsync('node', [scriptPath, '--json', keyword], {
    cwd: repoRoot,
    maxBuffer: 1024 * 1024 * 4,
  });

  const draft = JSON.parse(stdout) as GeneratedSeoDraft;
  assertBuilderPayloadIsClean(draft);

  return draft;
}

function buildCampaignPayload(row: SeoKeywordRow, draft: GeneratedSeoDraft) {
  return {
    keywordId: row.id,
    keyword: row.keyword,
    source: row.source || 'seo-worker',
    searchWeight: row.search_weight || 0,
    draft,
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'TechArticle',
      headline: draft.title,
      description: draft.description,
      image: draft.image,
      datePublished: draft.date,
      author: {
        '@type': 'Organization',
        name: 'Ali Mobile & Repair',
      },
      publisher: {
        '@type': 'LocalBusiness',
        name: 'Ali Mobile & Repair',
        telephone: '0481 058 514',
        address: {
          '@type': 'PostalAddress',
          streetAddress: 'Shop 28, Ringwood Square Shopping Centre',
          addressLocality: 'Ringwood',
          addressRegion: 'VIC',
          postalCode: '3134',
          addressCountry: 'AU',
        },
        geo: {
          '@type': 'GeoCoordinates',
          latitude: -37.8132,
          longitude: 145.2285,
        },
      },
    },
  };
}

async function stageSeoCampaign(row: SeoKeywordRow, draft: GeneratedSeoDraft) {
  const now = new Date().toISOString();
  const payload = buildCampaignPayload(row, draft);

  const { error } = await supabase.from('pending_seo_campaigns').insert({
    keyword_id: row.id,
    keyword: row.keyword,
    source: row.source || 'seo-worker',
    status: 'pending',
    payload,
    last_executed_at: now,
    created_at: now,
    updated_at: now,
  });

  if (error) {
    throw new Error(`Failed to stage generated SEO campaign for "${row.keyword}": ${error.message}`);
  }
}

async function processKeyword(row: SeoKeywordRow) {
  const claimedRow = await claimKeyword(row);
  if (!claimedRow) {
    console.log(`[seo-worker] Skipped "${row.keyword}" because another process claimed or changed it.`);
    return;
  }

  console.log(`[seo-worker] PROCESSING ${claimedRow.keyword}`);

  try {
    const draft = await generateSeoDraft(claimedRow.keyword);
    await stageSeoCampaign(claimedRow, draft);
    await updateKeywordStatus(claimedRow.id, 'COMPLETED');
    console.log(`[seo-worker] COMPLETED ${claimedRow.keyword}`);
  } catch (error) {
    console.error(`[seo-worker] FAILED ${claimedRow.keyword}:`, formatError(error));
    await updateKeywordStatus(claimedRow.id, 'FAILED');
  }
}

async function pollOnce() {
  const rows = await fetchQueuedKeywords();

  if (rows.length === 0) {
    console.log(`[seo-worker] No queued SEO keywords. Next poll in ${POLL_INTERVAL_MS / 1000}s.`);
    return;
  }

  for (const row of rows) {
    await processKeyword(row);
  }
}

let shuttingDown = false;

async function runWorker() {
  console.log(`[seo-worker] Started. Polling every ${POLL_INTERVAL_MS / 1000}s for statuses: ${QUEUE_STATUSES.join(', ')}.`);

  while (!shuttingDown) {
    try {
      await pollOnce();
    } catch (error) {
      console.error('[seo-worker] Poll cycle failed:', formatError(error));
    }

    if (!shuttingDown) {
      await sleep(POLL_INTERVAL_MS);
    }
  }

  console.log('[seo-worker] Stopped.');
}

for (const signal of ['SIGINT', 'SIGTERM'] as const) {
  process.on(signal, () => {
    shuttingDown = true;
  });
}

void runWorker();
