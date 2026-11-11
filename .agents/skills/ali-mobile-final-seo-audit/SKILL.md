---
name: ali-mobile-final-seo-audit
description: Run an evidence-led, audit-only final SEO, local SEO, GEO, AEO, schema, and internal-linking review for Ali Mobile. Use for the final sitewide review, not implementation.
---

# Ali Mobile final SEO / GEO / AEO audit

Use this skill with `ali-mobile-lean-agent` for a final Ali Mobile audit. It is an audit workflow: do not edit source, stage, commit, deploy, or make external changes unless the user separately authorizes a follow-up implementation task.

## Freshness and neutrality

- Before a new audit, check the Google Search Status Dashboard and Search Central documentation updates. Treat named spam or core updates as context, not as proof that a particular Ali Mobile page needs changing.
- A recommendation needs confirmed technical evidence, an intent or factual/entity mismatch, current Google guidance, relevant Search/GSC evidence, or a clear user-value improvement. Otherwise report **NO CHANGE**.
- Do not reward length, dates, keyword repetition, more FAQs, more schema, more pages, or more links by default. Do not treat E-E-A-T, Quality Rater scores, reviews, backlinks, or third-party GEO scores as a single direct ranking factor.

## Evidence and scope

- Start with the smallest relevant source and route inventory. Inspect rendered output or live URLs only when the user authorizes that access.
- Separate **confirmed source evidence**, **rendered/live evidence**, and **external-platform evidence** (Search Console, GBP, citations). State unavailable evidence as unavailable; never infer it from code.
- Report an issue only when the evidence identifies a user-facing, crawlable, structured-data, internal-link, or local-entity problem. Do not turn generic checklists into findings.
- Preserve existing content, canonical URLs, booking, pricing, and schema architecture during an audit. Recommendations must be opt-in, narrowly scoped, and distinguish required corrections from optional improvements.

## Review lenses

Apply only the lenses relevant to the supplied URLs or route cohort:

- **Technical/on-page:** indexability, robots, canonical, title and description, headings, pagination or duplication, sitemap coverage, and internal links.
- **Core quality and page experience:** establish the page's purpose, then assess whether visible main content fulfills it with meaningful effort, original business-specific value, appropriate skill or experience, factual accuracy, and a satisfying path to the visitor's task. Consider page experience holistically; do not treat a Core Web Vitals score as a ranking guarantee.
- **Local:** visible business identity, NAP consistency, service-area/location intent, directions or visit information, and consistency with any supplied GBP or citation evidence. Do not imply a location tenancy or service coverage without support.
- **GEO/AEO:** concise, directly answerable visible content; unambiguous entity, service, device, price, timing, and warranty facts; citations/authority only where independently evidenced; machine-readable facts that match visible content.
- **Schema:** assess `LocalBusiness`, `Service`, `FAQPage`, `BreadcrumbList`, and `CollectionPage` only where they accurately describe visible page content and intent. Markup must represent the page's visible main content; valid markup never guarantees a rich result or ranking benefit. Do not recommend `FAQPage` for a rich-result gain: Google no longer shows FAQ rich results. It can remain only where the visible questions and answers are genuinely useful and accurately represented.
- **Information architecture:** identify orphaned or ambiguous routes, contextual links that fail the user’s next task, duplicate hubs, and location/service cannibalisation. Do not recommend links merely to increase link count.

## Guardrails

- Treat GEO scores, arbitrary AI-readiness scores, `llms.txt`, and crawler-access checks as diagnostic context only—not Google ranking proof.
- Treat AI assistance as neutral. Evaluate generated or templated content by its accuracy, meaningful human/business review, original added value, relevance, and user usefulness—not by the tool used to make it.
- For scaled-content/spam risk, assess whether pages have a distinct legitimate purpose and useful, accurate, business-grounded main content. Do not label a template architecture abusive merely because it is templated or scaled.
- For local pages, distinguish a real physical location, a genuine service area, a nearby suburb, and the page's search/visit intent. Never recommend location copy or pages that imply an unsupported shop presence or business relevance.
- Do not fabricate PAA/PASF questions, citations, GBP data, rankings, reviews, or AI-search visibility. Use those sources only when supplied or explicitly authorized for retrieval.
- Do not recommend FAQ blocks, schema, or local copy solely for search visibility; require a useful visible answer and a supported user intent.
- Avoid unsupported repair claims such as same-day, immediate, while-you-wait, price, warranty, or service-area promises.

## Deliverable

Produce a neutral, prioritized findings report. For each finding include: affected URL/template, evidence type and exact source, user/search impact, confidence, and the smallest safe follow-up. Label every result **CONFIRMED DEFECT**, **CLEAR IMPROVEMENT**, **DATA-DEPENDENT OPPORTUNITY**, **OPTIONAL**, or **NO CHANGE**. Include a separate no-change-needed section and a limitations section for external evidence that was not available. Do not produce a scorecard by default.
