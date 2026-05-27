<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

<!-- BEGIN:seo-dual-agent-rules -->
# SEO Dual-Agent Workflow Lock

The SEO automation path is intentionally staged and human-reviewed.

- `scripts/seo-worker.ts` must run Gemini as the Writer and Claude as the Auditor before writing any generated campaign to Supabase.
- Repair SEO content must use the private master knowledge base at `.agents/knowledge/ali-mobile-repair-master-kb.md`. Treat it as agent-only context, not public website content.
- Claude must explicitly return `PASS` before the worker inserts into `pending_seo_campaigns`.
- If Claude returns critique, Gemini rewrites from the critique and the worker records every round in `payload.agentWorkflow.rounds`.
- If the max audit rounds are exhausted, mark the keyword `FAILED`; never stage low-confidence SEO pages.
- Keep the worker serial and quota-safe: default batch size 1, randomized 10-20 second delay before each keyword, and exponential backoff for 429/quota errors.
- Keep hard spend fuses in place: max 10 generated articles per run, max 20 generated articles per day in the local worker config, max 60 model calls per run, and stop on first 429/rate-limit by default.
- Keywords that already exist in Supabase must not be duplicated by the scout. Repeated discoveries should increment `seo_keywords.search_weight` and preserve the existing status, including `pending`, `approved`, `FAILED`, `COMPLETED`, and `blocked`.
- Suburb/postcode SEO pages must be honest about location: Ali Mobile & Repair is at Ringwood Square Shopping Centre Kiosk C1, Seymour St, Ringwood VIC 3134. For suburb/postcode terms, answer the repair question first, then encourage phone quote/model check, online booking, kiosk visit, or asking whether pickup/drop-off can be arranged. Do not invent exact travel times or pretend there is a branch in that suburb.
- Use the canonical Google Business Profile address in business identity, contact, footer, booking, schema, SEO/GEO, generated page, and LocalBusiness contexts: `Ringwood Square Shopping Centre Kiosk C1, Seymour St, Ringwood VIC 3134`. Structured data must use `streetAddress: Ringwood Square Shopping Centre Kiosk C1, Seymour St`, `addressLocality: Ringwood`, `addressRegion: VIC`, `postalCode: 3134`, and `addressCountry: AU`. Do not change the phone number `0481 058 514`.
- Scout seed queries should heavily favor four high-intent classes: visible symptoms, technical/trust concerns, cost/value comparisons, and extreme-damage scenarios. Localize them with Ringwood / Melbourne intent only where it still sounds like a real search.
- Default to `gemini-3.1-flash-lite` for writing and `claude-haiku-4-5-20251001` for audit when cost control matters.
- Required worker env vars: `GEMINI_API_KEY`, plus `ANTHROPIC_API_KEY` or `CLAUDE_API_KEY`.

# Landing Page SEO Optimization Department v1

Repair landing page SEO optimization is Proposal Mode only. SEO agents generate modular `optimizationTask` proposals; Codex edits approved files only after owner approval.

- Do not convert service landing pages into blog/article pages.
- Preserve Book Repair Now, call CTA, quote/request flow, repair option cards, customer reviews, trust badges, FAQ accordion, and mobile scanability.
- Proposals must be modular and renderable as existing page components or reusable landing modules: hero, quick answer, repair options, common problems, model-specific cards, repair-specific cards, diagnostic steps, warranty/limitations, local service area, FAQ, metadata, and internal links.
- Conversion UX Guard must reject dense article-style copy, check mobile readability, and output CTA preservation notes before any execution request.
- The `localServiceArea.address` default is `Ringwood Square Shopping Centre Kiosk C1, Seymour St, Ringwood VIC 3134`.
- Department agents are Landing Page Auditor, SEO Strategist, Repair Knowledge Writer, GEO Optimizer, Conversion UX Guard, and SEO QA Reviewer.
- Codex Executor is not part of the autonomous SEO writing loop. It may edit files only after the owner approves the proposal and the target file list.
- Required QA keys are `conversionModulesPreserved`, `bookingCtaPreserved`, `callCtaPreserved`, `modularAndScannable`, `noDenseArticleContent`, and `mobileReadabilityPreserved`.

# SEO Admin Split-Pane Lock

The admin SEO dashboard lives at `src/app/(pos)/admin/seo/page.tsx` and must stay a split-pane review surface:

- Header: global search across triage keywords and generated campaigns.
- Left pane: keyword triage table with source, score, date, and approve/block actions.
- Right pane: `pending_seo_campaigns` list and sandboxed iframe preview fetched through `/api/seo/campaigns`.
- Generated campaign HTML must render in a sandboxed iframe, not directly in the admin React DOM.
- This screen is staging/preview only; do not publish generated routes directly from here unless a future task explicitly designs an approval flow.
<!-- END:seo-dual-agent-rules -->
