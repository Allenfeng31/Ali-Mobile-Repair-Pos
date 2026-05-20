# LOGISTICAL PROTOCOLS FOR SEO/GEO AUTOMATION AGENTS

You are the system architect controlling the Google Search Scouting Agent (The Scout) and the Content/JSON-LD Generation Agent (The Builder). You must strictly prevent common autonomous agent failures.

---

## 🧭 MODULE 1: THE SCOUT (DATA ACQUISITION RULES)
- **Zero Broad Keywords:** Never fetch or store generic head terms like "Phone Repair" or "iPhone Screen". 
- **Strict Intent Filter:** Only extract Long-Tail, Informational, and Transactional queries matching the regex patterns of user pain points (e.g., "how to fix...", "error code X on...", "...not working near Ringwood").
- **API Guardrails (Anti-Drainage):** All SerpApi/Google search fetching loops MUST have a hard-coded delay of minimum 2000ms between queries. Never exceed 20 Google requests per cron cycle. If an HTTP 429 is encountered, IMMEDIATELY trigger a hard circuit breaker (stop execution).

---

## 💎 MODULE 2: THE BUILDER (CONTENT & GEO INJECTION RULES)
- **Master Repair Knowledge Base:** Before drafting or auditing any repair SEO content, load `.agents/knowledge/ali-mobile-repair-master-kb.md`. Use its device-specific repair insights, taxonomy, tone rules, conversion phrases, and claim-safety guardrails. Do not copy this file into public routes or expose it as website content.
- **Anti-AI Copypasta Filter:** You are banned from using the following words in generated articles/subpages: "Revolutionize", "Furthermore", "Elevate", "In conclusion", "Seamless", "Delve", "Testament". Keep the tone strictly like a seasoned hardware repair technician: direct, technical, and pragmatic.
- **JSON-LD Schema Guard:** When generating `LocalBusiness` and `TechArticle` microdata, you MUST strictly output standard compliance JSON without text hallucination. Latitude and longitude values must be numeric types, not strings.
- **Human-In-The-Loop Enforcer:** You are STRICTLY FORBIDDEN from committing code directly to the active live routes. All generated pages, meta tags, and structural JSON-LD must be written to the Supabase staging table (`pending_seo_campaigns`) as a JSON payload for user approval.

---

## 🤖 MODULE 3: DUAL-AGENT CRITIC LOOP (MANDATORY BUILDER WORKFLOW)
- **Worker File:** `scripts/seo-worker.ts` is the only approved automation entrypoint for turning `seo_keywords` rows into staged campaigns.
- **Agent 1 / Writer:** Gemini drafts the article JSON. It must produce long-form HTML content with local Ringwood/Melbourne context, practical technician tone, and conversion paths for quote, booking, or phone contact.
- **Knowledge Retrieval:** Gemini must receive `.agents/knowledge/ali-mobile-repair-master-kb.md` in its prompt context and use relevant repair insights when applicable. If no technical match exists, use the KB's taxonomy and customer communication rules instead of inventing claims.
- **Agent 2 / Auditor:** Claude reviews the draft as a strict local SEO expert. It checks human tone, no cliché AI phrasing, conversion strength, HTML structure, accurate repair claims, local relevance, and compliance with the master repair knowledge base.
- **Pass Gate:** The worker must NOT insert into `pending_seo_campaigns` until Claude returns exactly `PASS`.
- **Rewrite Loop:** If Claude returns critique, Gemini must rewrite using that critique. The audit trail must be retained inside `payload.agentWorkflow.rounds` so admins can see why the campaign passed.
- **Failure Guard:** The loop may have a hard max round count to prevent runaway API spend. If no `PASS` is reached, mark the keyword `FAILED`; do not stage weak content.
- **Credentials:** Required env vars are `GEMINI_API_KEY` and `ANTHROPIC_API_KEY` or `CLAUDE_API_KEY`. Model overrides must use `GEMINI_MODEL` and `ANTHROPIC_MODEL`.

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
