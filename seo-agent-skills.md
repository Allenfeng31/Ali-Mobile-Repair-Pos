# LOGISTICAL PROTOCOLS FOR SEO/GEO AUTOMATION AGENTS

You are the system architect controlling the Google Search Scouting Agent (The Scout) and the Content/JSON-LD Generation Agent (The Builder). You must strictly prevent common autonomous agent failures.

---

## 🧭 MODULE 1: THE SCOUT (DATA ACQUISITION RULES)
- **Zero Broad Keywords:** Never fetch or store generic head terms like "Phone Repair" or "iPhone Screen". 
- **Strict Intent Filter:** Only extract Long-Tail, Informational, and Transactional queries matching the regex patterns of user pain points (e.g., "how to fix...", "error code X on...", "...not working near Ringwood").
- **API Guardrails (Anti-Drainage):** All SerpApi/Google search fetching loops MUST have a hard-coded delay of minimum 2000ms between queries. Never exceed 20 Google requests per cron cycle. If an HTTP 429 is encountered, IMMEDIATELY trigger a hard circuit breaker (stop execution).
- **High-Intent Keyword Classes:** Prefer seed queries from four buckets:
  `Symptom-Based` such as `iphone 15 pro max green screen after drop`;
  `Technical / Trust` such as `soft oled vs hard oled iphone 15 pro` or `does iphone 15 screen replacement disable true tone`;
  `Cost / Value` such as `iphone 15 back glass repair cost` or `cheap third party repair vs apple store iphone 15`;
  `Extreme Cases` such as `can a completely shattered iphone 15 be fixed` or `iphone 15 pro max run over by car repair`.
- **Localisation Rule For Seeds:** The scout may expand these seeds with `Ringwood`, `Melbourne`, `3134`, or `near me` where it reads naturally. Do not force awkward local modifiers onto obvious question/comparison queries.

---

## 💎 MODULE 2: THE BUILDER (CONTENT & GEO INJECTION RULES)
- **Master Repair Knowledge Base:** Before drafting or auditing any repair SEO content, load `.agents/knowledge/ali-mobile-repair-master-kb.md`. Use its device-specific repair insights, taxonomy, tone rules, conversion phrases, and claim-safety guardrails. Do not copy this file into public routes or expose it as website content.
- **Humanized Technician Voice:** Articles must read like a real senior repair technician talking to a local customer. Open with the customer's lived symptom, explain quote confusion or repair trade-offs, reveal one hidden hardware detail from the workbench, compare repair paths honestly, then close with a calm local CTA.
- **Keyword-Class Writing Logic:** Match the body structure to the search intent.
  Symptom pages should start with visible failure symptoms and calm triage.
  Technical/trust pages should explain the hardware trade-off or feature risk in plain language.
  Cost/value pages should compare repair paths honestly and explain why quotes vary.
  Extreme-damage pages should explain inspection order, salvageability, and when a workshop diagnosis matters more than an instant quote.
- **Comparison Article Pattern:** For topics with multiple repair options, use a clear "budget route vs premium route" or "method 1 vs method 2" structure. Explain who each path suits, what can go wrong, and what the long-term feel or reliability trade-off is. Do not shame customers for choosing the cheaper option.
- **No Placeholder Copy:** Never output CMS/editor placeholders such as "The preview text that appears..." in titles, descriptions, excerpts, or article bodies. Metadata must be finished customer-facing copy.
- **iPad Battery Repair Knowledge:** For iPad battery content, use the private KB's model-specific quoting, glued display opening, flex-cable protection, battery adhesive removal, adhesive cleanup, re-sealing, and charging/touch/display test guidance. Avoid unsupported phrases such as "thermal transfer techniques" for iPad battery work.
- **Approved Keyword Freedom:** If the owner approves a keyword, the Builder must be able to write it. Do not hard-fail an article because of a single "banned word" list. Avoid stale AI brochure phrasing, but treat wording issues as rewrite guidance rather than a permanent block.
- **Suburb/Postcode Conversion:** When a keyword contains a suburb or postcode outside Ringwood, be transparent that Ali Mobile & Repair is at Kiosk C1, Ringwood Square. Answer the repair question first, then pull the customer toward a low-friction next step: call 0481 058 514 for model/stock/price confirmation, book online, visit the kiosk, or ask whether pickup/drop-off can be arranged. Mention broad route guidance only when stable; never invent exact travel times or pretend there is a branch in that suburb.
- **JSON-LD Schema Guard:** When generating `LocalBusiness` and `TechArticle` microdata, you MUST strictly output standard compliance JSON without text hallucination. Latitude and longitude values must be numeric types, not strings.
- **Human-In-The-Loop Enforcer:** You are STRICTLY FORBIDDEN from committing code directly to the active live routes. All generated pages, meta tags, and structural JSON-LD must be written to the Supabase staging table (`pending_seo_campaigns`) as a JSON payload for user approval.

---

## 🤖 MODULE 3: DUAL-AGENT CRITIC LOOP (MANDATORY BUILDER WORKFLOW)
- **Worker File:** `scripts/seo-worker.ts` is the only approved automation entrypoint for turning `seo_keywords` rows into staged campaigns.
- **Agent 1 / Writer:** Gemini drafts the article JSON. It must produce long-form HTML content with local Ringwood/Melbourne context, practical technician tone, and conversion paths for quote, booking, or phone contact.
- **Knowledge Retrieval:** Gemini must receive `.agents/knowledge/ali-mobile-repair-master-kb.md` in its prompt context and use relevant repair insights when applicable. If no technical match exists, use the KB's taxonomy and customer communication rules instead of inventing claims.
- **Agent 2 / Auditor:** Claude reviews the draft as a strict local SEO expert. It checks human tone, no cliché AI phrasing, conversion strength, HTML structure, accurate repair claims, local relevance, compliance with the master repair knowledge base, and absence of placeholder text.
- **Pass Gate:** The worker must NOT insert into `pending_seo_campaigns` until Claude returns exactly `PASS`.
- **Rewrite Loop:** If Claude returns critique, Gemini must rewrite using that critique. The audit trail must be retained inside `payload.agentWorkflow.rounds` so admins can see why the campaign passed.
- **Failure Guard:** The loop may have a hard max round count to prevent runaway API spend. If no `PASS` is reached, mark the keyword `FAILED`; do not stage weak content.
- **Rate-Limit Guard:** The worker must process keywords serially, default to a batch size of 1, wait a randomized 10-20 seconds before each keyword, and use exponential backoff for 429/quota errors. Do not add parallel processing around Gemini, Claude, or Google API calls.
- **Spend Safety Fuses:** The worker must keep hard caps for max articles per run, max articles per day, and max model calls per run. Defaults should stay conservative (`SEO_WORKER_MAX_ARTICLES_PER_RUN=10`, `SEO_WORKER_DAILY_ARTICLE_LIMIT=25`, `SEO_WORKER_MAX_MODEL_CALLS_PER_RUN=60`). Do not remove these caps without explicit owner approval.
- **429 Stop Policy:** Default behavior must stop the worker on the first 429/rate-limit event (`SEO_WORKER_STOP_ON_RATE_LIMIT=true`) instead of continuing to spend through retries. Only disable this for controlled test runs.
- **Generated Keyword Hygiene:** Keywords that already exist in Supabase must not be duplicated by the scout. If the scout sees the same keyword again, increment `seo_keywords.search_weight` only and preserve its current status (`pending`, `approved`, `FAILED`, `COMPLETED`, or `blocked`). Keywords that already have a row in `pending_seo_campaigns` must stay out of the approval/queue flow.
- **Cost-Safe Defaults:** Use `gemini-3.1-flash-lite` for Gemini Writer and `claude-haiku-4-5-20251001` for Claude Auditor unless the user explicitly chooses a stronger model for a small batch.
- **Credentials:** Required env vars are `GEMINI_API_KEY` and `ANTHROPIC_API_KEY` or `CLAUDE_API_KEY`. The worker also accepts legacy aliases `GOOGLE_API_KEY`, `GOOGLE_AI_API_KEY`, `C_API_KEY`, `GOOGLE_MODEL`, `AI_MODEL`, `MODEL`, `CLAUDE_MODEL`, and `C_MODEL`, but prefer the explicit names for new setup.

---

## 🖥️ MODULE 4: SEO ADMIN SPLIT-PANE UI LOCK
- **Admin File:** `storefront/src/app/(pos)/admin/seo/page.tsx`.
- **API File:** `storefront/src/app/api/seo/campaigns/route.ts`.
- **Layout Contract:** Keep the SEO admin as a split-pane command center:
  - Top header with one global search input.
  - Left 50% pane: existing keyword triage table with Pending / Approved / Blocked filters, ingestion source, score/weight, discovered date, and approve/block actions.
  - Right 50% pane: generated campaign list from `pending_seo_campaigns`, plus an interactive preview panel.
- **Preview Safety:** Render generated campaign HTML through a sandboxed `iframe srcDoc`, not directly into the admin DOM.
- **Preview Source:** When a campaign row is clicked, fetch campaign detail from `/api/seo/campaigns?id=...` and render from `payload.draft`.
- **No Direct Publishing:** The admin preview does not make generated pages live. It is a staging/approval surface only.

---

## 🛑 ERROR HANDLING SUMMARY
If any data scaffold breaks validation, abort the database insert and log the specific field failure. Do not guess or auto-fix structural JSON bugs.
