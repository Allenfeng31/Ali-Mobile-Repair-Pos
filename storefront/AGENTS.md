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
- Required worker env vars: `GEMINI_API_KEY`, plus `ANTHROPIC_API_KEY` or `CLAUDE_API_KEY`.

# SEO Admin Split-Pane Lock

The admin SEO dashboard lives at `src/app/(pos)/admin/seo/page.tsx` and must stay a split-pane review surface:

- Header: global search across triage keywords and generated campaigns.
- Left pane: keyword triage table with source, score, date, and approve/block actions.
- Right pane: `pending_seo_campaigns` list and sandboxed iframe preview fetched through `/api/seo/campaigns`.
- Generated campaign HTML must render in a sandboxed iframe, not directly in the admin React DOM.
- This screen is staging/preview only; do not publish generated routes directly from here unless a future task explicitly designs an approval flow.
<!-- END:seo-dual-agent-rules -->
