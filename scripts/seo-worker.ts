import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { GoogleGenAI } from '@google/genai';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..');
const REPAIR_KNOWLEDGE_BASE_PATH = path.join(repoRoot, '.agents/knowledge/ali-mobile-repair-master-kb.md');

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
const MAX_AUDIT_ROUNDS = Number(process.env.SEO_WORKER_MAX_AUDIT_ROUNDS || 4);
const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
const ANTHROPIC_MODEL = process.env.ANTHROPIC_MODEL || 'claude-3-5-sonnet-20241022';
const ANTHROPIC_VERSION = process.env.ANTHROPIC_VERSION || '2023-06-01';
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
  relatedKeywords?: string[];
  readingTime?: string;
};

type AuditRound = {
  round: number;
  verdict: 'PASS' | 'REWRITE';
  critique: string;
  draftTitle: string;
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

let repairKnowledgeBaseCache: string | null = null;

function getGeminiClient() {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error('Missing GEMINI_API_KEY for SEO Writer agent.');
  }

  return new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
}

function getAnthropicApiKey() {
  const apiKey = process.env.ANTHROPIC_API_KEY || process.env.CLAUDE_API_KEY;

  if (!apiKey) {
    throw new Error('Missing ANTHROPIC_API_KEY for SEO Auditor agent.');
  }

  return apiKey;
}

function getSupabaseClient() {
  const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error(
      'Missing Supabase credentials. Set SUPABASE_URL or NEXT_PUBLIC_SUPABASE_URL, plus SUPABASE_SERVICE_ROLE_KEY.'
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

function getRepairKnowledgeBase() {
  if (repairKnowledgeBaseCache !== null) {
    return repairKnowledgeBaseCache;
  }

  if (!fs.existsSync(REPAIR_KNOWLEDGE_BASE_PATH)) {
    throw new Error(`Missing SEO repair knowledge base at ${REPAIR_KNOWLEDGE_BASE_PATH}`);
  }

  repairKnowledgeBaseCache = fs.readFileSync(REPAIR_KNOWLEDGE_BASE_PATH, 'utf8').trim();
  return repairKnowledgeBaseCache;
}

function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 90);
}

function stripCodeFence(raw: string) {
  const trimmed = raw.trim();
  const fenced = trimmed.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/i);
  return fenced ? fenced[1].trim() : trimmed;
}

function parseDraftJson(raw: string, keyword: string): GeneratedSeoDraft {
  try {
    const draft = JSON.parse(stripCodeFence(raw)) as GeneratedSeoDraft;

    if (!draft.title || !draft.description || !draft.content) {
      throw new Error('Draft JSON missing title, description, or content.');
    }

    return {
      ...draft,
      date: draft.date || new Date().toISOString(),
      slug: draft.slug || slugify(`${keyword} Ringwood Melbourne`),
      image: draft.image || '/images/services/phone-repair.jpg',
      readingTime: draft.readingTime || '5 min read',
    };
  } catch (error) {
    throw new Error(`Gemini Writer returned invalid draft JSON: ${formatError(error)}`);
  }
}

function buildWriterPrompt(keyword: string, critique?: string, previousDraft?: GeneratedSeoDraft) {
  const rewriteContext = critique && previousDraft
    ? `
Claude Auditor critique to fix:
${critique}

Previous draft JSON:
${JSON.stringify(previousDraft, null, 2)}
`
    : '';

  return `
You are Agent 1, the SEO Writer for Ali Mobile & Repair.

Business context:
- Business name: Ali Mobile & Repair.
- Location: Kiosk C1, Ringwood Square Shopping Centre, Ringwood VIC 3134.
- Service area: Ringwood, Croydon, Mitcham, Heathmont, Wantirna, Doncaster, Box Hill, Bayswater, Boronia, and Melbourne's eastern suburbs.
- Services: phone repair, iPhone repair, Samsung repair, iPad/tablet repair, MacBook/laptop repair, Apple Watch/smart watch repair, screen replacement, battery replacement, charging port repair, liquid damage diagnostics, data-safe repair handling.
- Trust signals: No Fix, No Charge policy, practical diagnostics, fast turnaround when parts are in stock, 6-month warranty on eligible repairs, direct phone 0481 058 514.

Agent-only master repair knowledge base:
${getRepairKnowledgeBase()}

Keyword to target:
${keyword}

Write a human, local, conversion-focused long-form SEO article. It must read like an experienced repair technician explaining the issue to a real Ringwood customer, not like generic AI marketing copy.

Rules:
- Return ONLY valid JSON. No markdown fence.
- content must be HTML only and include h2, h3, p, ul/ol, and a final CTA section.
- Naturally mention Ringwood and nearby Melbourne eastern suburbs without keyword stuffing.
- Mention realistic repair diagnostics, pricing clarity, turnaround uncertainty when parts are required, and data safety.
- Avoid these words completely: ${bannedBuilderWords.join(', ')}.
- Do not claim impossible guarantees such as waterproof restoration or lifetime warranty unless tied to existing policy.
- Obey the claim-safety rules from the master repair knowledge base. Never overpromise IP ratings, Apple warning removal, battery health display, data recovery, same-day turnaround, or original part source.
- When relevant, include 1-2 concrete repair insights from the master repair knowledge base. If no insight fits the keyword, use the taxonomy and communication rules instead.
- Target length: 900-1400 words in HTML content.

JSON shape:
{
  "title": "string",
  "description": "string",
  "date": "${new Date().toISOString()}",
  "image": "/images/services/phone-repair.jpg",
  "slug": "${slugify(`${keyword} Ringwood Melbourne`)}",
  "readingTime": "5 min read",
  "relatedKeywords": ["string", "string", "string"],
  "content": "<article-ready html string>"
}

${rewriteContext}
`;
}

async function callGeminiWriter(keyword: string, critique?: string, previousDraft?: GeneratedSeoDraft) {
  const ai = getGeminiClient();
  const response = await ai.models.generateContent({
    model: GEMINI_MODEL,
    contents: buildWriterPrompt(keyword, critique, previousDraft),
    config: {
      responseMimeType: 'application/json',
      systemInstruction: 'You write production-ready local SEO landing page content as strict JSON for a repair business. Output only parseable JSON.',
    },
  });

  const draft = parseDraftJson(response.text || '', keyword);
  assertBuilderPayloadIsClean(draft);
  return draft;
}

function extractAnthropicText(payload: unknown) {
  const content = (payload as { content?: Array<{ type?: string; text?: string }> }).content;
  if (!Array.isArray(content)) return '';

  return content
    .filter((part) => part.type === 'text' && typeof part.text === 'string')
    .map((part) => part.text)
    .join('\n')
    .trim();
}

async function callClaudeAuditor(keyword: string, draft: GeneratedSeoDraft) {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-api-key': getAnthropicApiKey(),
      'anthropic-version': ANTHROPIC_VERSION,
    },
    body: JSON.stringify({
      model: ANTHROPIC_MODEL,
      max_tokens: 1200,
      system: `You are Agent 2, a strict local SEO auditor for Ali Mobile & Repair in Ringwood, Melbourne.

Return exactly PASS if the draft is ready.
If it is not ready, return a concise, specific critique with fixes. Do not rewrite the whole article.

Audit criteria:
1. Human technician tone, no generic AI phrasing or cliché marketing language.
2. Local relevance to Ringwood, Ringwood Square, and Melbourne eastern suburbs.
3. Conversion optimization: clear next steps, quote/booking/phone CTA, realistic trust signals.
4. SEO quality: keyword is used naturally in title, description, headings, and body.
5. No unsafe claims, no fake guarantees, no keyword stuffing.
6. Uses relevant knowledge from the agent-only repair knowledge base when applicable, without inventing beyond it.
7. Clean HTML structure that can render in the public SEO template.`,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: `Master repair knowledge base:\n${getRepairKnowledgeBase()}\n\nKeyword: ${keyword}\n\nDraft JSON:\n${JSON.stringify(draft, null, 2)}`,
            },
          ],
        },
      ],
    }),
  });

  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(`Claude Auditor failed (${response.status}): ${JSON.stringify(payload).slice(0, 500)}`);
  }

  const text = extractAnthropicText(payload);
  if (!text) {
    throw new Error('Claude Auditor returned no text content.');
  }

  return text;
}

function auditPassed(auditText: string) {
  return auditText.trim().toUpperCase() === 'PASS';
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
  const auditTrail: AuditRound[] = [];
  let draft: GeneratedSeoDraft | undefined;
  let critique: string | undefined;

  for (let round = 1; round <= MAX_AUDIT_ROUNDS; round += 1) {
    draft = await callGeminiWriter(keyword, critique, draft);
    const audit = await callClaudeAuditor(keyword, draft);
    const verdict = auditPassed(audit) ? 'PASS' : 'REWRITE';

    auditTrail.push({
      round,
      verdict,
      critique: audit,
      draftTitle: draft.title,
    });

    if (verdict === 'PASS') {
      return { draft, auditTrail };
    }

    critique = audit;
  }

  throw new Error(`Claude Auditor did not PASS "${keyword}" within ${MAX_AUDIT_ROUNDS} rounds. Last critique: ${critique || 'No critique returned.'}`);
}

function buildCampaignPayload(row: SeoKeywordRow, draft: GeneratedSeoDraft, auditTrail: AuditRound[]) {
  return {
    keywordId: row.id,
    keyword: row.keyword,
    source: row.source || 'seo-worker',
    searchWeight: row.search_weight || 0,
    agentWorkflow: {
      writer: {
        provider: 'google',
        model: GEMINI_MODEL,
      },
      auditor: {
        provider: 'anthropic',
        model: ANTHROPIC_MODEL,
      },
      rounds: auditTrail,
      finalVerdict: 'PASS',
    },
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

async function stageSeoCampaign(row: SeoKeywordRow, draft: GeneratedSeoDraft, auditTrail: AuditRound[]) {
  const now = new Date().toISOString();
  const payload = buildCampaignPayload(row, draft, auditTrail);

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
    const { draft, auditTrail } = await generateSeoDraft(claimedRow.keyword);
    await stageSeoCampaign(claimedRow, draft, auditTrail);
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
