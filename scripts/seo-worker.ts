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
  const words = text
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
    .split(/\s+/);
  const uniqueWords = [...new Set(words)];
  return uniqueWords.join('-').slice(0, 90);
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
=== CRITICAL REVISION INSTRUCTIONS ===
You are in a revision loop because the previous draft did not pass the SEO and humanizer audit. 
Your single most important task is to edit the previous draft to address ALL the critiques listed below. 
Do not start from scratch; keep the good sections of the previous draft and only change the sentences, words, structure, or content necessary to satisfy the critique points.

CLAUDE AUDITOR CRITIQUE TO RESOLVE:
${critique}

PREVIOUS DRAFT JSON TO EDIT:
${JSON.stringify(previousDraft, null, 2)}
======================================
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

DE-AI PATTERN FILTERING & HUMANIZER RULES:
You must strictly follow these humanizer rules to write natural, authentic copy. Avoid all signs of AI-generated text:
1. NO AI Buzzwords: Do NOT use high-frequency AI words: actually, additionally, align with, crucial, delve, emphasizing, enduring, enhance, fostering, garner, highlight (as verb), interplay, intricate/intricacies, key (as adjective), landscape (as abstract noun), pivotal, showcase, tapestry, testament, underscore, valuable, vibrant, ensures, delicate, challenging, precise, transparency, discuss whether, vital, allows us, understand that, keep in mind, instead of rushing, we focus on, focus on.
   - Replace "ensures" with "confirms", "verifies", "makes sure", or write directly.
   - Replace "delicate" with "careful", "precision", or name the actual part (e.g., "flex cables, proximity sensors, and earpiece connectors" instead of "delicate sensors").
   - Replace "challenging" with "tough", "difficult", or "hard".
   - Replace "precise" with "exact", "accurate", or name the specific step.
   - Replace "transparency" or "we are transparent that..." with direct, honest statements (e.g., "we explain clearly that...").
   - Replace "discuss whether" with "assess", "check", or "examine".
   - Replace "vital" with "important" or remove.
   - Replace "allows us to" with "lets us" or write directly (e.g. "We confirm..." instead of "This allows us to confirm...").
   - Replace "we understand that" or "understand that" with direct, simple statements (e.g. "Being without your phone is inconvenient" instead of "We understand that being without...").
   - Replace "keep in mind" or "we keep data protection in mind" with direct statements (e.g. "We do not erase your data").
   - Remove "instead of rushing through" or "we focus on... instead of rushing..." entirely. Just write directly: "We follow these checks:" or "We test...".
2. NO Copula Avoidance: Use simple verbs like "is", "are", "has" instead of elaborate substitutes like "serves as", "stands as", "marks", "represents a", "boasts", "features", "offers". (e.g., write "We have a workshop..." instead of "Our workshop boasts..."). Do not use "offers a display experience" (say "provides a display experience" or "is a display"). Do not use "helps keep features like Face ID... working" (say "Face ID remains functional" or test results show). Do not use "discuss whether a frame adjustment is possible" (say "check if the frame is bent"). Do not use "consist of thin, fragile layers" (say "are made of thin, fragile layers"). Do not use "reflect the specific repair method chosen" (say "depend on the repair method"). Do not use "we find that separating these bonded layers exposes" (say "separating bonded layers exposes"). Do not use "vital for long-term reliability" (say "important for long-term reliability"). Do not use "has the colour accuracy" (say "gives you the colour accuracy"). Do not use "exposes internal components" (say "leaves internal components exposed").
3. NO Negative Parallelisms or Tailing Negations: State points directly. Avoid "Not only... but also..." or "It's not just about... it's..." structures. Avoid tailing negations like "...no waiting", "...no compromise", "...no guessing". For example, do not write "We don't erase your data to fix the power system." Instead, write "We keep your data intact during battery replacement."
4. NO Rule of Three: Do not force points into groups of three (e.g., "ideate, iterate, and deliver"). Keep lists natural, direct, and focused.
5. NO Synonym Cycling (Elegant Variation): Repeat keywords naturally (like "screen replacement" or "iPad battery") if they are the clearest way to describe the service. Do not cycle through synonyms just to avoid repetition.
6. NO False Ranges: Do not use "from X to Y" constructions unless they represent a logical, linear scale.
7. Active Voice: Prefer active voice. Instead of "No configuration needed", use "You do not need to configure anything".
8. Formatting Restrictions:
   - Do not overuse em dashes (—). Use commas, periods, or parentheses instead.
   - Do not overuse boldface. Avoid bolding words mechanically.
   - NO Inline-Header Lists: Do not use bullet lists with bold inline headers followed by colons (e.g. "- **Quality:** We use..."). Write them as natural prose paragraphs or plain bullet points.
   - Headings: Use Sentence case for headings (e.g. "Screen replacement options" instead of "Screen Replacement Options"). Do not use Title Case. Never use emojis in headings.
   - Quotes: Use double quotes ("...") and single quotes ('...') instead of curly quotes (“...” or ‘...’).
9. Meta & Structure Rules:
   - NO Chatbot artifacts or meta-commentary (e.g. "I hope this helps", "let's dive in", "here's what you need to know"). Start directly with the content.
   - NO Fragmented Headers: Do not place a single-sentence rhetorical warm-up paragraph immediately under a heading before starting the real content.
   - NO Filler Phrases or Hedging: Use "to" instead of "in order to", "because" instead of "due to the fact that". Avoid excessive qualifications like "could potentially possibly be argued" or instruction padding like "Treat your device with care around water and steam" (instead, just state the IP rating facts).
   - NO Generic up-beat conclusions: End with specific local action points, shop hours (10am-5pm), address, or phone number instead of "book your diagnostic check today" or "the future looks bright".
10. Claim Safety and KB rules:
     - iPhone screen repairs:
       * For older models (like iPhone 11, iPhone XR): compare budget LCDs vs premium OEM-quality LCDs, write "We use a specialist programmer where the model supports it to transfer original display data and preserve True Tone behaviour. If this data transfer is skipped, you may see an Apple warning message or find that True Tone adapts differently than before."
       * For flagship models (like iPhone 15 Pro Max and newer): do NOT claim data transfer. Instead write "We test True Tone and display calibration before return. For some iPhone models, we use specialist tools where supported to preserve original display behaviour. Skipping display calibration can cause True Tone loss or unexpected brightness jumps."
       * Original parts wording: only say "genuine" or "original" when confirmed; otherwise use "original-grade", "premium", or "OEM-standard". For example, in FAQ answers, say "We source premium display assemblies matched to your iPhone model and explain the quality options during your visit."
       * Warranty details: state clearly that "Screen replacements are covered by our 6-month warranty. This covers defects in the display panel, touch function, and seal. It does not cover accidental damage or liquid exposure after handover."
       * Data Safety: do not write defensive or over-reassuring statements. Say "Your data remains on the device throughout a screen repair. We do not erase or reset your iPhone unless you ask."
     - Samsung/Other screen repairs: Explicitly write "Factory IP rating cannot be guaranteed after any phone has been opened" rather than soft phrasing like "reduce its factory water resistance".
     - iPad battery replacement cost: Include the KB example sentence exactly: "The price difference with iPad battery replacement is often not just the battery itself; it is the time spent opening the glued display cleanly, protecting the flex cables, clearing old adhesive, and testing the iPad before it leaves the bench."
     - MacBook liquid damage: Explicitly describe the workbench diagnostic steps: disconnecting the battery first, microscope board inspection for corrosion/oxidation on connectors/flex cables, and checking for short circuits. State clearly that liquid damage repair eligibility for the 6-month warranty depends on the repair outcome; do not promise all liquid jobs are covered. Do not use phrases like "we will be honest about that" or "we keep data protection in mind". State facts directly: "Not every liquid-damaged MacBook can be salvaged; we inspect first and quote only for repairs we can complete."
     - Unsupported models/brands (e.g. Apple Watch, Huawei, Nokia, etc.): If a device or repair category is not specifically detailed in sections 3.1-3.5 of the Knowledge Base, you MUST rely only on general repair principles (e.g. general digitizer, display assembly, flex cables, premium battery replacement, board-level diagnostics, data-safe handling). Do NOT invent technical claims (such as paired-chip calibration, custom thermal transfer, or specific IP68 waterproof ratings for that device) unless explicitly authorized by the KB. Mention that repair diagnostics are model-dependent and advise checking with a technician.
     - Near Me Keywords: If the keyword contains "near me", the title MUST include "Near Me" or "Near You" (e.g. "iPhone 15 Pro Max Screen Replacement Near Me – Ringwood, Melbourne"). In the opening paragraph, explicitly state: "At Ali Mobile & Repair in Ringwood, we serve customers from Croydon, Mitcham, Heathmont, and across Melbourne's eastern suburbs."
     - CTA Strength: Make all CTAs direct and specific. Instead of generic suggestions, write: "Call 0481 058 514 for a quick model check and current stock status before visiting, or visit Kiosk C1 at Ringwood Square Shopping Centre."

Rules:
- Return ONLY valid JSON. No markdown fence.
- The entire response must be a single JSON object. Do not add comments, explanations, summaries, or extra text before or after the JSON.
- Every literal newline inside JSON strings must be escaped as \n. Do not place raw multi-line text inside JSON string values.
- content must be HTML only and include h2, h3, p, ul/ol, and a final CTA section.
- Open with the customer's real-world symptom and daily-use frustration before explaining the technical repair.
- Keyword Relevance: You MUST use the exact keyword in the title, description, first paragraph, and naturally throughout the content. If the keyword mentions a specific brand (like OPPO), the article must focus entirely on that brand (OPPO phones, OPPO screen replacements, OPPO models) and not generic "smartphones".
- Specific device hardware naming: Older models like iPhone 11 and iPhone XR use LCD displays, not OLED. If writing about screen replacements for these models, compare budget LCDs vs premium OEM-quality LCDs and discuss True Tone restoration, rather than OLED screen trade-offs. Show a specific price anchor (e.g. "$240–$280 for a premium LCD with data transfer").
- OPPO screen replacements: Mention that OPPO displays often use strong perimeter adhesive, and opening them requires controlled heat and careful handling to prevent digitizer damage. Note that most OPPO models are not water-sealed the same way as flagship iPhones, so the repair focuses on mechanical fit and touch function rather than water-resistance recovery.
- Direct Phrasing & No Hedging: Write direct, factual statements instead of vague or soft marketing language. Instead of "may cost less" write "costs less". Instead of "may encounter" write "you may see". Instead of "involve trade-offs in colour accuracy" write "trade touch sensitivity and durability for lower cost". Instead of "we are transparent that a professional repair is not the same as a brand-new factory-sealed unit" write "a professional repair is not factory-sealed".
- No Standalone Warning Sentences: Do not write standalone warning sentences (such as "If we rush this process, we risk damaging these internal components"). Fold warnings and risk details naturally into prose paragraphs.
- Active Technician Voice: Do NOT use phrases like "we focus on", "focus on", "our goal is", "our aim is", "we prefer to", "because we carry", or "meaning we keep". Use direct, active verbs: "We test", "We calibrate", "We inspect", "We keep", "We carry".
- Symptom-First Technical Explanations: Always start technical comparisons or quality sections by describing a customer-visible symptom first (e.g., a dim display, warning message, or weak touch responsiveness after a cheap repair), then explain the workbench cause (e.g., missing calibration or skipping display programming), then show how we resolve it.
- Model-Specific Custom FAQs: Write custom FAQ questions specific to the exact device model and keyword, rather than generic warranty boilerplate. For example: "Will my screen repair remove the 'Genuine Apple Part' warning?", "Can you fix the screen if the frame is bent?", or "How long does the repair take if you have the part in stock?".
- Location and Suburbs: Specify "Based in Ringwood, we handle walk-ins or can arrange pickup from your suburb if the repair takes longer." when serving surrounding areas.
- Match the article angle to the keyword class:
  * symptom-based keywords: urgent symptom first, likely hardware cause second, practical diagnostic path third.
  * technical/trust keywords: compare the two technologies or explain the feature-retention concern in plain workshop language.
  * cost/value keywords: explain why quotes vary, what Apple Store vs third-party repair changes, and who each path suits.
  * extreme-damage keywords: stay calm, explain triage order, board/frame/screen risk, and when a bench inspection matters more than a blind quote.
- If the keyword involves a repair decision or price gap, use a human comparison structure: budget route vs premium route, who each route suits, what the hidden hardware trade-off is, and what the long-term reliability/feel difference may be.
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
- Treat this as a transaction-focused long-tail landing page, not a blog post. The page should capture the specific keyword intent and then hand the reader toward the matching repair service page.
- Make every generated page materially different from other long-tail pages. Pick a keyword-specific angle based on the exact device, fault, location, price concern, timing concern, or repair-risk concern. Do not reuse the same intro, same heading sequence, same conclusion, or same explanation pattern across different keywords.
- If the keyword names a specific model and repair type, write as if the page supports that exact model repair page. If the keyword only names a brand and repair type, write as a brand-level repair guide and avoid pretending you know the exact model. If the keyword only names a category, write as a category-level repair guide.
- Include a final CTA section that naturally points readers to the matching repair service options before booking. Do not hardcode a URL in the article HTML; the public SEO renderer resolves the exact repair page link.

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

const BANNED_AI_WORDS = [
  'actually', 'additionally', 'align with', 'crucial', 'delve',
  'emphasizing', 'enduring', 'fostering', 'garner', 'interplay',
  'intricate', 'intricacies', 'landscape', 'pivotal', 'showcase',
  'tapestry', 'testament', 'underscore', 'underscores', 'vibrant',
  'ensures', 'delicate', 'challenging', 'enhance', 'valuable',
  'precise', 'transparency', 'discuss whether', 'vital',
  'allows us', 'understand that', 'keep in mind', 'instead of rushing', 'we focus on', 'focus on',
  'focusing on', 'focused on', 'focuses on', 'inconvenience', 'spot hidden damage', 'prevent recurring issues', 'keep your data intact'
];

const COPULA_TRIGGERS = [
  'serves as', 'stands as', 'represents a', 'boasts a', 'features a', 'offers a display'
];

const TAILING_NEGATIONS = [
  ', no waiting', ', no guessing', ', no compromise', ', no hassle', 'no wasted motion'
];

const SIGNPOSTING_PHRASES = [
  "let's dive in", "let's explore", "let's break this down", "here's what you need to know", "without further ado"
];

const HEDGING_PHRASES = [
  'could potentially', 'possibly be argued'
];

const GENERIC_CONCLUSIONS = [
  'future looks bright', 'exciting times lie ahead', 'journey toward excellence'
];

function autoCorrectHumanizerPatterns(draft: GeneratedSeoDraft): GeneratedSeoDraft {
  let content = draft.content || '';
  let title = draft.title || '';
  let description = draft.description || '';

  // 1. Replace curly quotes with straight quotes
  content = content
    .replace(/[\u201C\u201D]/g, '"')
    .replace(/[\u2018\u2019]/g, "'");
  title = title
    .replace(/[\u201C\u201D]/g, '"')
    .replace(/[\u2018\u2019]/g, "'");
  description = description
    .replace(/[\u201C\u201D]/g, '"')
    .replace(/[\u2018\u2019]/g, "'");

  // 2. Remove emojis from HTML headings
  const emojiRange = /[\u{1F300}-\u{1F9FF}\u{2700}-\u{27BF}\u{1F600}-\u{1F64F}\u{1F900}-\u{1F9FF}\u{1F000}-\u{1F09F}\u{1F1E0}-\u{1F1FF}\u{1F200}-\u{1F2FF}\u{1F300}-\u{1F5FF}\u{1F600}-\u{1F64F}\u{1F680}-\u{1F6FF}\u{1F700}-\u{1F77F}\u{1F780}-\u{1F7FF}\u{1F800}-\u{1F8FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu;
  
  content = content.replace(/(<h[1-6][^>]*>)(.*?)(<\/h[1-6]>)/gi, (match, openTag, text, closeTag) => {
    const cleanedText = text.replace(emojiRange, '').trim();
    return `${openTag}${cleanedText}${closeTag}`;
  });

  return {
    ...draft,
    title,
    description,
    content,
  };
}

function checkHumanizerPatterns(draft: GeneratedSeoDraft): string[] {
  const violations: string[] = [];
  const fullText = `${draft.title} ${draft.description} ${draft.content}`.toLowerCase();

  // 1. Check Banned Words
  const bannedFound = BANNED_AI_WORDS.filter(word => {
    const regex = new RegExp(`\\b${word}\\b`, 'i');
    return regex.test(fullText);
  });
  if (bannedFound.length > 0) {
    violations.push(`Banned AI vocabulary words found: ${bannedFound.map(w => `"${w}"`).join(', ')}. Please rewrite using simpler words.`);
  }

  // 2. Copula Avoidance
  const copulaFound = COPULA_TRIGGERS.filter(phrase => fullText.includes(phrase));
  if (copulaFound.length > 0) {
    violations.push(`Elaborate copula avoidance phrases found: ${copulaFound.map(p => `"${p}"`).join(', ')}. Use simple "is", "are", or "has" instead.`);
  }

  // 3. Negative Parallelisms
  if (/\bnot only\b.*\bbut also\b/i.test(fullText)) {
    violations.push('Negative parallelism ("not only... but also...") detected. Write points directly.');
  }
  if (/\bit's not just about\b.*\bit's\b/i.test(fullText) || /\bit is not just about\b.*\bit is\b/i.test(fullText)) {
    violations.push('Negative parallelism ("not just about... it\'s...") detected. State your point directly without the dramatic contrast.');
  }

  // 4. Tailing Negations
  const tailingFound = TAILING_NEGATIONS.filter(phrase => fullText.includes(phrase));
  if (tailingFound.length > 0) {
    violations.push(`Tailing negation fragments detected: ${tailingFound.map(t => `"${t}"`).join(', ')}. Use a complete clause.`);
  }

  // 5. Signposting Announcements
  const signpostingFound = SIGNPOSTING_PHRASES.filter(phrase => fullText.includes(phrase));
  if (signpostingFound.length > 0) {
    violations.push(`Meta-signposting/announcements found: ${signpostingFound.map(s => `"${s}"`).join(', ')}. Do not announce what you are about to write, just write it.`);
  }

  // 6. Excessive Hedging
  const hedgingFound = HEDGING_PHRASES.filter(phrase => fullText.includes(phrase));
  if (hedgingFound.length > 0) {
    violations.push(`Excessive hedging phrases found: ${hedgingFound.map(h => `"${h}"`).join(', ')}. State points with clarity.`);
  }

  // 7. Generic Up-beat Conclusions
  const conclusionsFound = GENERIC_CONCLUSIONS.filter(phrase => fullText.includes(phrase));
  if (conclusionsFound.length > 0) {
    violations.push(`Generic upbeat AI conclusion phrase found: ${conclusionsFound.map(c => `"${c}"`).join(', ')}. End with concrete Melbourne location details or CTA instead.`);
  }

  // 8. Emojis in headings
  const headingEmojiRegex = /<h[1-6][^>]*>.*[\u{1F300}-\u{1F9FF}\u{2700}-\u{27BF}\u{1F600}-\u{1F64F}].*<\/h[1-6]>/u;
  if (headingEmojiRegex.test(draft.content)) {
    violations.push('Emojis detected inside HTML headings. Headings must be clean text.');
  }

  // 9. Curly quotes
  if (/[“”‘’]/.test(draft.content) || /[“”‘’]/.test(draft.title) || /[“”‘’]/.test(draft.description)) {
    violations.push('Curly quotation marks (“” or ‘’) found. Use straight quotes.');
  }

  return violations;
}

async function callGeminiWriter(keyword: string, critique?: string, previousDraft?: GeneratedSeoDraft) {
  const response = await withRateLimitBackoff(`Gemini Writer (${keyword})`, async () => {
    const ai = getGeminiClient();
    return await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: buildWriterPrompt(keyword, critique, previousDraft),
      config: {
        responseMimeType: 'application/json',
        systemInstruction: 'You write production-ready local SEO landing page content as strict JSON for a repair business. Output only parseable JSON. You MUST strictly follow the DE-AI PATTERN FILTERING & HUMANIZER RULES: write like an experienced repair technician explaining issues to a real customer in plain workshop language, avoid all marketing fluff, banned AI words (e.g., actually, delve, crucial, ensures, delicate, challenging, enhance, valuable, precise, transparency, discuss whether, vital), negative parallelisms, and generic CTA conclusions.',
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
11. Clean HTML structure that can render in the public SEO template.
12. Strict compliance with Wikipedia's "Signs of AI writing" / humanizer rules: Check for and reject:
    - High-frequency AI words (actually, additionally, align with, crucial, delve, emphasizing, enduring, enhance, fostering, garner, highlight, interplay, intricate/intricacies, key, landscape, pivotal, showcase, tapestry, testament, underscore, valuable, vibrant).
    - Copula avoidance (reject elaborate constructions like "serves as", "stands as", "boasts", "features", "offers" in place of simple is/are/has).
    - Negative parallelisms and tailing negations (reject "not only... but also...", "not just about... it's about...", "...no waiting", "...no compromise").
    - Rule of three list patterns or elegant synonym cycling.
    - Formatting tells (reject inline-header lists like "- **Title:** Text", Title Case headings, emojis, curly quotes, em dash overuse).
    - Chatbot artifacts (reject "I hope this helps", "let's dive in", disclaimers).
    - Fragmented headers (reject one-sentence rhetorical padding directly under headings before content starts).
    - Filler and hedging (reject "in order to", "due to the fact that", "could potentially possibly").
    - Generic conclusions (reject "future looks bright", "journey toward excellence").`,
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

    // Auto-correct minor humanizer violations (e.g., curly quotes, emojis in headings)
    draft = autoCorrectHumanizerPatterns(draft);

    // Run local check for any remaining humanizer/AI writing pattern violations
    const localViolations = checkHumanizerPatterns(draft);
    let audit: string;
    let verdict: 'PASS' | 'REWRITE';

    if (localViolations.length > 0) {
      // Local pre-audit failed: skip Claude Auditor to save API cost/rate limits and force a rewrite
      audit = `REWRITE: Local humanizer pre-audit failed with the following AI-like patterns:\n` +
        localViolations.map((v, i) => `${i + 1}. ${v}`).join('\n') +
        `\nPlease rewrite the draft carefully adhering to all DE-AI/humanizer rules.`;
      verdict = 'REWRITE';
      console.log(`[seo-worker] Local pre-audit for "${keyword}" (round ${round}): FAILED (${localViolations.length} violations)`);
    } else {
      console.log(`[seo-worker] Local pre-audit for "${keyword}" (round ${round}): PASSED. Running Claude Auditor...`);
      audit = await callClaudeAuditor(keyword, draft);
      verdict = auditPassed(audit) ? 'PASS' : 'REWRITE';
    }

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

  throw new Error(`Claude Auditor / Local Humanizer did not PASS "${keyword}" within ${MAX_AUDIT_ROUNDS} rounds. Last critique: ${critique || 'No critique returned.'}`);
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
