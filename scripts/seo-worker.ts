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
  dotenv.config({ path: envPath, override: true });
}

const POLL_INTERVAL_MS = Number(process.env.SEO_WORKER_POLL_INTERVAL_MS || 15_000);
const MAX_BATCH_SIZE = Number(process.env.SEO_WORKER_BATCH_SIZE || 1);
const MAX_AUDIT_ROUNDS = Number(process.env.SEO_WORKER_MAX_AUDIT_ROUNDS || 4);
const KEYWORD_DELAY_MIN_MS = Number(process.env.SEO_WORKER_KEYWORD_DELAY_MIN_MS || 10_000);
const KEYWORD_DELAY_MAX_MS = Number(process.env.SEO_WORKER_KEYWORD_DELAY_MAX_MS || 20_000);
const RATE_LIMIT_BASE_BACKOFF_MS = Number(process.env.SEO_WORKER_RATE_LIMIT_BASE_BACKOFF_MS || 30_000);
const RATE_LIMIT_MAX_BACKOFF_MS = Number(process.env.SEO_WORKER_RATE_LIMIT_MAX_BACKOFF_MS || 120_000);
const RATE_LIMIT_MAX_RETRIES = Number(process.env.SEO_WORKER_RATE_LIMIT_MAX_RETRIES || 3);
const MAX_ARTICLES_PER_RUN = Number(process.env.SEO_WORKER_MAX_ARTICLES_PER_RUN || 10);
const DAILY_ARTICLE_LIMIT = Number(process.env.SEO_WORKER_DAILY_ARTICLE_LIMIT || 25);
const MAX_MODEL_CALLS_PER_RUN = Number(process.env.SEO_WORKER_MAX_MODEL_CALLS_PER_RUN || 60);
const STOP_ON_RATE_LIMIT = process.env.SEO_WORKER_STOP_ON_RATE_LIMIT !== 'false';
const GEMINI_MODEL = process.env.GEMINI_MODEL || process.env.GOOGLE_MODEL || process.env.AI_MODEL || process.env.MODEL || 'gemini-3.1-flash-lite';
const ANTHROPIC_MODEL = process.env.ANTHROPIC_MODEL || process.env.CLAUDE_MODEL || process.env.C_MODEL || 'claude-haiku-4-5-20251001';
const ANTHROPIC_VERSION = process.env.ANTHROPIC_VERSION || '2023-06-01';
const QUEUE_STATUSES = ['approved', 'queued'] as const;
const BLOCKED_GEMINI_MODEL_PREFIXES = ['gemini-2.0'];

type SeoKeywordStatus = 'approved' | 'queued' | 'PROCESSING' | 'COMPLETED' | 'FAILED';

type SeoKeywordRow = {
  id: string;
  keyword: string;
  source?: string | null;
  search_weight?: number | null;
  status: SeoKeywordStatus;
};

type ExistingCampaignRow = {
  id: string;
};

type CampaignInsertPayload = {
  keyword: string;
  source: string;
  status: string;
  payload: ReturnType<typeof buildCampaignPayload>;
  created_at: string;
  updated_at: string;
  keyword_id?: string;
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

const blockedPlaceholderPhrases = [
  'The preview text that appears',
];

let repairKnowledgeBaseCache: string | null = null;
let campaignSchemaChecked = false;
let shuttingDown = false;
let generatedThisRun = 0;
let modelCallsThisRun = 0;

class WorkerSafetyStopError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'WorkerSafetyStopError';
  }
}

function getGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || process.env.GOOGLE_AI_API_KEY;

  if (!apiKey) {
    throw new Error('Missing GEMINI_API_KEY for SEO Writer agent.');
  }

  return new GoogleGenAI({ apiKey });
}

function assertModelConfigIsSafe() {
  const normalizedGeminiModel = GEMINI_MODEL.trim().toLowerCase();
  const isBlockedGeminiModel = BLOCKED_GEMINI_MODEL_PREFIXES.some((prefix) => normalizedGeminiModel.startsWith(prefix));

  if (isBlockedGeminiModel && process.env.SEO_WORKER_ALLOW_LEGACY_GEMINI_MODEL !== 'true') {
    throw new Error(
      `[seo-worker] Refusing to start with ${GEMINI_MODEL}. This project has hit free-tier quota=0 on Gemini 2.0 models. Use GEMINI_MODEL=gemini-3.1-flash-lite, or set SEO_WORKER_ALLOW_LEGACY_GEMINI_MODEL=true only for a deliberate paid test.`
    );
  }
}

function getAnthropicApiKey() {
  const apiKey = process.env.ANTHROPIC_API_KEY || process.env.CLAUDE_API_KEY || process.env.C_API_KEY;

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

function randomIntBetween(min: number, max: number) {
  const safeMin = Math.max(0, Math.min(min, max));
  const safeMax = Math.max(safeMin, max);
  return Math.floor(Math.random() * (safeMax - safeMin + 1)) + safeMin;
}

function formatError(error: unknown) {
  return error instanceof Error ? error.message : String(error);
}

function isInvalidDraftJsonError(error: unknown) {
  return formatError(error).includes('Gemini Writer returned invalid draft JSON');
}

function isWorkerSafetyStopError(error: unknown) {
  return error instanceof WorkerSafetyStopError;
}

function isRateLimitError(error: unknown) {
  const maybeError = error as {
    status?: number;
    code?: number;
    error?: { code?: number; status?: string; message?: string };
  };
  if (maybeError.status === 429 || maybeError.code === 429 || maybeError.error?.code === 429) {
    return true;
  }

  const message = formatError(error).toLowerCase();
  return /\b429\b/.test(message) ||
    message.includes('rate limit') ||
    message.includes('quota') ||
    message.includes('resource_exhausted') ||
    message.includes('too many requests');
}

async function withRateLimitBackoff<T>(label: string, operation: () => Promise<T>): Promise<T> {
  for (let attempt = 0; attempt <= RATE_LIMIT_MAX_RETRIES; attempt += 1) {
    try {
      modelCallsThisRun += 1;
      if (modelCallsThisRun > MAX_MODEL_CALLS_PER_RUN) {
        shuttingDown = true;
        throw new WorkerSafetyStopError(
          `[seo-worker] Safety stop: model call cap reached (${MAX_MODEL_CALLS_PER_RUN}/run).`
        );
      }

      return await operation();
    } catch (error) {
      if (isWorkerSafetyStopError(error)) {
        throw error;
      }

      if (!isRateLimitError(error) || attempt >= RATE_LIMIT_MAX_RETRIES) {
        throw error;
      }

      if (STOP_ON_RATE_LIMIT) {
        shuttingDown = true;
        throw new WorkerSafetyStopError(
          `[seo-worker] Safety stop: ${label} hit a 429/rate-limit. Worker stopped before additional spend.`
        );
      }

      const exponentialDelay = RATE_LIMIT_BASE_BACKOFF_MS * (2 ** attempt);
      const delayMs = Math.min(exponentialDelay, RATE_LIMIT_MAX_BACKOFF_MS);
      console.warn(
        `[seo-worker] 429/rate-limit from ${label}. Backing off for ${Math.round(delayMs / 1000)}s before retry ${attempt + 1}/${RATE_LIMIT_MAX_RETRIES}.`
      );
      await sleep(delayMs);
    }
  }

  throw new Error(`Rate-limit backoff exhausted for ${label}.`);
}

function assertBuilderPayloadIsClean(draft: GeneratedSeoDraft) {
  const serialized = JSON.stringify(draft);
  const violations = blockedPlaceholderPhrases.filter((phrase) => serialized.toLowerCase().includes(phrase.toLowerCase()));

  if (violations.length > 0) {
    throw new Error(`Generated SEO draft contains placeholder/editor language: ${violations.join(', ')}`);
  }
}

function getRepairKnowledgeBase() {
  if (repairKnowledgeBaseCache !== null) {
    return repairKnowledgeBaseCache;
  }

  if (!fs.existsSync(REPAIR_KNOWLEDGE_BASE_PATH)) {
    throw new Error(`Missing SEO repair knowledge base at ${REPAIR_KNOWLEDGE_BASE_PATH}`);
  }

  repairKnowledgeBaseCache = fs.readFileSync(REPAIR_KNOWLEDGE_BASE_PATH, 'utf8')
    .replace(
      /Strictly banned tone:\n\n- Do not use aggressive scare words such as "industry dark secret", "scam", "rip-off", or "black market trick"\.\n- Do not attack competitors\.\n- Do not dramatize repair risks\./,
      `Tone caution:

- If the owner approves a keyword, do not reject it because of a sensitive word. Reframe the intent calmly, explain the real technical trade-off, and guide the customer toward a quote or inspection.
- Avoid aggressive wording in the article body unless needed to answer the exact approved search intent.
- Do not attack competitors.
- Do not dramatize repair risks.`
    )
    .trim();
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

function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

function getStartOfTodayIso() {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())).toISOString();
}

function stripCodeFence(raw: string) {
  const trimmed = raw.trim();
  const fenced = trimmed.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/i);
  return fenced ? fenced[1].trim() : trimmed;
}

function extractFirstJsonObject(raw: string) {
  const text = stripCodeFence(raw);
  const start = text.indexOf('{');

  if (start === -1) {
    return text;
  }

  let depth = 0;
  let inString = false;
  let escaped = false;

  for (let index = start; index < text.length; index += 1) {
    const char = text[index];

    if (escaped) {
      escaped = false;
      continue;
    }

    if (char === '\\') {
      escaped = true;
      continue;
    }

    if (char === '"') {
      inString = !inString;
      continue;
    }

    if (inString) {
      continue;
    }

    if (char === '{') {
      depth += 1;
    } else if (char === '}') {
      depth -= 1;

      if (depth === 0) {
        return text.slice(start, index + 1);
      }
    }
  }

  return text;
}

function parseDraftJson(raw: string, keyword: string): GeneratedSeoDraft {
  try {
    const draft = JSON.parse(extractFirstJsonObject(raw)) as GeneratedSeoDraft;

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
- The entire response must be a single JSON object. Do not add comments, explanations, summaries, or extra text before or after the JSON.
- Every literal newline inside JSON strings must be escaped as \n. Do not place raw multi-line text inside JSON string values.
- content must be HTML only and include h2, h3, p, ul/ol, and a final CTA section.
- Open with the customer's real-world symptom and daily-use frustration before explaining the technical repair.
- Match the article angle to the keyword class:
  * symptom-based keywords: urgent symptom first, likely hardware cause second, practical diagnostic path third.
  * technical/trust keywords: compare the two technologies or explain the feature-retention concern in plain workshop language.
  * cost/value keywords: explain why quotes vary, what Apple Store vs third-party repair changes, and who each path suits.
  * extreme-damage keywords: stay calm, explain triage order, board/frame/screen risk, and when a bench inspection matters more than a blind quote.
- If the keyword involves a repair decision or price gap, use a human comparison structure: budget route vs premium route, who each suits, what the hidden hardware trade-off is, and what the long-term reliability/feel difference may be.
- Include one workbench-level detail from the master repair knowledge base when relevant, such as rivets, flex cables, calibration, adhesive, seal fit, frame assemblies, or paired hardware.
- If the keyword includes a suburb or postcode outside Ringwood, be transparent that Ali Mobile & Repair is at Kiosk C1, Ringwood Square. Do not pretend there is a branch in that suburb. Give the reader useful repair/price/risk guidance first, then encourage a phone model check, online booking, kiosk visit, or asking whether pickup/drop-off can be arranged. Use broad, stable route guidance only; never invent exact travel times.
- Use a restrained rhetorical question only when it sounds like what a customer would genuinely ask.
- Naturally mention Ringwood and nearby Melbourne eastern suburbs without keyword stuffing.
- Mention realistic repair diagnostics, pricing clarity, turnaround uncertainty when parts are required, and data safety.
- Avoid stale AI brochure phrasing. Do not sound like a generic marketing page; sound like a senior repair technician explaining practical options.
- Never output placeholder/editor text such as "The preview text that appears..." anywhere in title, description, excerpt, or content.
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
  const response = await withRateLimitBackoff(`Gemini Writer (${keyword})`, async () => {
    const ai = getGeminiClient();
    return await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: buildWriterPrompt(keyword, critique, previousDraft),
      config: {
        responseMimeType: 'application/json',
        systemInstruction: 'You write production-ready local SEO landing page content as strict JSON for a repair business. Output only parseable JSON.',
      },
    });
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
  const response = await withRateLimitBackoff(`Claude Auditor (${keyword})`, async () => {
    const auditResponse = await fetch('https://api.anthropic.com/v1/messages', {
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
7. Starts from a real customer symptom or repair decision, then explains the workbench-level hardware reason behind the recommendation.
8. No placeholder/editor text in metadata or article content.
9. For iPad battery topics, accepts the KB-supported points about model-specific quoting, glued display opening, flex-cable protection, battery adhesive removal, adhesive cleanup, display re-sealing, and post-repair charging/touch/display tests.
10. For suburb or postcode keywords outside Ringwood, the draft must be transparent about the Ringwood Square location while still giving a useful reason to call, book, visit, or ask about pickup/drop-off. Do not invent exact travel times or fake branch locations.
11. Clean HTML structure that can render in the public SEO template.`,
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

    if (auditResponse.status === 429) {
      const payload = await auditResponse.text().catch(() => '');
      throw new Error(`Claude Auditor rate-limited (429): ${payload.slice(0, 500)}`);
    }

    return auditResponse;
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
  const normalized = auditText.trim();
  const upper = normalized.toUpperCase();

  if (upper === 'PASS') {
    return true;
  }

  if (/^\s*\**PASS\**\b/im.test(normalized) && !/^\s*\**FAIL\**\b/im.test(normalized)) {
    return true;
  }

  if (/^\s*(?:#+\s*)?(?:STATUS|VERDICT|AUDIT RESULT)\s*:\s*PASS\b/im.test(normalized)) {
    return true;
  }

  if (/^\s*\*\*(?:STATUS|VERDICT)\s*:\s*PASS\*\*/im.test(normalized)) {
    return true;
  }

  if (/READY FOR PUBLICATION\.?$/im.test(normalized) && !/^\s*(?:#+\s*)?(?:STATUS|VERDICT|AUDIT RESULT)\s*:\s*FAIL\b/im.test(normalized)) {
    return true;
  }

  return false;
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

async function assertCampaignSchemaIsReady() {
  if (campaignSchemaChecked) {
    return;
  }

  const { error } = await supabase
    .from('pending_seo_campaigns')
    .select('keyword, status, source, payload, created_at, updated_at')
    .limit(0);

  if (error) {
    throw new WorkerSafetyStopError(
      `[seo-worker] pending_seo_campaigns schema is not ready for article storage: ${error.message}. Run seo_campaigns_schema.sql in Supabase SQL Editor before starting the worker.`
    );
  }

  campaignSchemaChecked = true;
}

async function fetchGeneratedTodayCount() {
  const { count, error } = await supabase
    .from('pending_seo_campaigns')
    .select('id', { count: 'exact', head: true })
    .gte('created_at', getStartOfTodayIso());

  if (error) {
    throw new Error(`Failed to check daily SEO generation count: ${error.message}`);
  }

  return count || 0;
}

async function hasGenerationBudget() {
  if (generatedThisRun >= MAX_ARTICLES_PER_RUN) {
    console.log(`[seo-worker] Safety stop: run article cap reached (${generatedThisRun}/${MAX_ARTICLES_PER_RUN}).`);
    shuttingDown = true;
    return false;
  }

  const generatedToday = await fetchGeneratedTodayCount();
  if (generatedToday >= DAILY_ARTICLE_LIMIT) {
    console.log(`[seo-worker] Safety stop: daily article cap reached (${generatedToday}/${DAILY_ARTICLE_LIMIT}).`);
    shuttingDown = true;
    return false;
  }

  if (modelCallsThisRun >= MAX_MODEL_CALLS_PER_RUN) {
    console.log(`[seo-worker] Safety stop: model call cap reached (${modelCallsThisRun}/${MAX_MODEL_CALLS_PER_RUN}).`);
    shuttingDown = true;
    return false;
  }

  return true;
}

async function findExistingCampaign(row: SeoKeywordRow) {
  const { data: byKeyword, error: byKeywordError } = await supabase
    .from('pending_seo_campaigns')
    .select('id')
    .eq('keyword', row.keyword)
    .limit(1)
    .maybeSingle<ExistingCampaignRow>();

  if (byKeywordError) {
    throw new Error(`Failed to check existing campaign for "${row.keyword}": ${byKeywordError.message}`);
  }

  if (byKeyword) {
    return byKeyword;
  }

  if (!isUuid(row.id)) {
    return null;
  }

  const { data: byId, error: byIdError } = await supabase
    .from('pending_seo_campaigns')
    .select('id')
    .eq('keyword_id', row.id)
    .limit(1)
    .maybeSingle<ExistingCampaignRow>();

  if (byIdError) {
    throw new Error(`Failed to check existing campaign for keyword ${row.id}: ${byIdError.message}`);
  }

  return byId;
}

async function generateSeoDraft(keyword: string) {
  const auditTrail: AuditRound[] = [];
  let draft: GeneratedSeoDraft | undefined;
  let critique: string | undefined;

  for (let round = 1; round <= MAX_AUDIT_ROUNDS; round += 1) {
    try {
      draft = await callGeminiWriter(keyword, critique, draft);
    } catch (error) {
      if (!isInvalidDraftJsonError(error)) {
        throw error;
      }

      const jsonCritique = `${formatError(error)}. Rewrite the draft as a single strict JSON object only. Do not include markdown fences, comments, raw newlines inside JSON strings, or any text before/after the JSON.`;
      draft = await callGeminiWriter(keyword, jsonCritique, draft);
    }

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
  const existingCampaign = await findExistingCampaign(row);

  if (existingCampaign) {
    console.log(`[seo-worker] Existing campaign found for "${row.keyword}". Skipping duplicate insert.`);
    return false;
  }

  const campaignInsert: CampaignInsertPayload = {
    keyword: row.keyword,
    source: row.source || 'seo-worker',
    status: 'pending',
    payload,
    created_at: now,
    updated_at: now,
    ...(isUuid(row.id) ? { keyword_id: row.id } : {}),
  };

  delete (campaignInsert as Partial<CampaignInsertPayload> & { last_executed_at?: string }).last_executed_at;

  const { error } = await supabase.from('pending_seo_campaigns').insert(campaignInsert);

  if (error) {
    throw new Error(`Failed to stage generated SEO campaign for "${row.keyword}": ${error.message}`);
  }

  return true;
}

async function processKeyword(row: SeoKeywordRow) {
  const existingBeforeClaim = await findExistingCampaign(row);

  if (existingBeforeClaim) {
    await updateKeywordStatus(row.id, 'COMPLETED');
    console.log(`[seo-worker] COMPLETED ${row.keyword} (campaign already exists).`);
    return;
  }

  const claimedRow = await claimKeyword(row);
  if (!claimedRow) {
    console.log(`[seo-worker] Skipped "${row.keyword}" because another process claimed or changed it.`);
    return;
  }

  console.log(`[seo-worker] PROCESSING ${claimedRow.keyword}`);

  try {
    const existingAfterClaim = await findExistingCampaign(claimedRow);
    if (existingAfterClaim) {
      await updateKeywordStatus(claimedRow.id, 'COMPLETED');
      console.log(`[seo-worker] COMPLETED ${claimedRow.keyword} (campaign already exists after claim).`);
      return;
    }

    const { draft, auditTrail } = await generateSeoDraft(claimedRow.keyword);
    const insertedCampaign = await stageSeoCampaign(claimedRow, draft, auditTrail);
    if (insertedCampaign) {
      generatedThisRun += 1;
    }
    await updateKeywordStatus(claimedRow.id, 'COMPLETED');
    console.log(`[seo-worker] COMPLETED ${claimedRow.keyword}`);
  } catch (error) {
    if (isWorkerSafetyStopError(error)) {
      console.warn(formatError(error));
      await updateKeywordStatus(claimedRow.id, row.status);
      return;
    }

    if (isRateLimitError(error)) {
      console.error(`[seo-worker] RATE LIMITED ${claimedRow.keyword}:`, formatError(error));
      await updateKeywordStatus(claimedRow.id, row.status);
      return;
    }

    console.error(`[seo-worker] FAILED ${claimedRow.keyword}:`, formatError(error));
    await updateKeywordStatus(claimedRow.id, 'FAILED');
  }
}

async function pollOnce() {
  await assertCampaignSchemaIsReady();

  const rows = await fetchQueuedKeywords();

  if (rows.length === 0) {
    console.log(
      `[seo-worker] No queued SEO keywords. Generated this run ${generatedThisRun}/${MAX_ARTICLES_PER_RUN}; model calls ${modelCallsThisRun}/${MAX_MODEL_CALLS_PER_RUN}. Next poll in ${POLL_INTERVAL_MS / 1000}s.`
    );
    return;
  }

  for (const row of rows) {
    if (shuttingDown) break;

    if (!(await hasGenerationBudget())) break;

    const delayMs = randomIntBetween(KEYWORD_DELAY_MIN_MS, KEYWORD_DELAY_MAX_MS);
    console.log(`[seo-worker] Throttling before "${row.keyword}" for ${Math.round(delayMs / 1000)}s.`);
    await sleep(delayMs);

    if (shuttingDown) break;

    await processKeyword(row);
  }
}

async function runWorker() {
  assertModelConfigIsSafe();

  console.log(
    `[seo-worker] Started in serial safety mode. Batch size ${MAX_BATCH_SIZE}. Run cap ${MAX_ARTICLES_PER_RUN} articles, daily cap ${DAILY_ARTICLE_LIMIT} articles, model call cap ${MAX_MODEL_CALLS_PER_RUN}. Keyword throttle ${KEYWORD_DELAY_MIN_MS / 1000}-${KEYWORD_DELAY_MAX_MS / 1000}s. Stop on 429: ${STOP_ON_RATE_LIMIT}. Polling every ${POLL_INTERVAL_MS / 1000}s for statuses: ${QUEUE_STATUSES.join(', ')}.`
  );
  console.log(`[seo-worker] Models: Gemini Writer=${GEMINI_MODEL}; Claude Auditor=${ANTHROPIC_MODEL}.`);

  while (!shuttingDown) {
    try {
      await pollOnce();
    } catch (error) {
      if (isWorkerSafetyStopError(error)) {
        console.error(formatError(error));
        shuttingDown = true;
        break;
      }

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
