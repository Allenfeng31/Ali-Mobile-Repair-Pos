# Secondary Phone Model Hub Batch 1 — Action Plan

Date: 2026-10-27

## P1 — Confirmed important corrections

| Action | URLs affected | Status | Evidence/validation |
|---|---:|---|---|
| Add consumer-facing brand to secondary-phone H1, title, meta/OG, intro, breadcrumb/schema input, accessible labels and related-model anchors | 126 audited; shared invariant also covers the other 10 named secondary brands | Complete locally | 15-brand casing/duplicate tests; OnePlus SSR integration; 354/354 focused tests |
| Remove unsupported same-day wording from Batch 1 hero, Quick Answers and FAQs | 126 | Complete locally | Production contained claim on 126/126; local SSR test rejects same-day/immediate wording |
| Promote qualified repair timing to opening cards | 126 | Complete locally | Uses only approved dependencies: model, repair, parts, condition, diagnosis, faults, queue |
| Promote six-month eligible standard-repair warranty and Water Damage exclusion | 126 | Complete locally | Uses `STANDARD_WARRANTY_SUMMARY`; SSR integration assertion |

## P2 — Evidence-supported improvements

| Action | URLs affected | Status | Next evidence |
|---|---:|---|---|
| Add genuine model-specific differentiation when authority exists | Up to 126 | Not implemented | Positive POS price, supported variant distinction, verified Repair Results or service records |
| Review broad manufacturer queries landing on Model Hubs | LG/Nokia/Vivo cohorts first | Owner review | Compare Brand Hub vs Model Hub query/page rows; do not infer cannibalisation from shared impressions |
| Prioritise higher-impression exact models for future evidence enrichment | Xiaomi Mi 8, Mi Note 10, Redmi 10, Redmi Note 10 Pro; LG G7/G8s; Nokia 8.1; Vivo Y17s/Y52 5G | Owner review | Confirm exact-query demand and current URL inspection before adding content |

## P3 — Optional changes

- Hydrated desktop and 375px visual verification of the compact three-card opening layout.
- Add a dedicated URL Inspection export workflow if the connected GSC tool can be corrected.
- Consider a reusable audit script for future batches; keep it out of production runtime code.

## HOLD — Missing POS/GSC evidence

| Decision | URLs | Why held |
|---|---:|---|
| Index/noindex/redirect/consolidation | 126 | No URL Inspection/Page Indexing verdict; historical impressions are not current index status |
| Claim model-specific stock or fixed turnaround | 126 | No stock/timing authority at Model Hub level |
| Add positive core starting prices | 126 | No positive POS-backed core price observed; virtual `$50` options cannot become model starting-price authority |
| Add specifications, fault patterns or testimonials | 126 | No authoritative evidence; filler is prohibited |
| FULL TECHNICAL PASS | 126 | Hydrated desktop/375px verification not performed by owner request |

## NO CHANGE — Already sufficient

- 126/126 HTTP 200, no redirects and self canonicals.
- 126/126 SSR main content, repair choices, CTA and BreadcrumbList output.
- Existing quote-led pricing, authorised shared virtual prices and exact repair links.
- Booking/POS behaviour, GA4, Repair Detail pages, primary phone brands, tablets, laptops and watches.
- No speculative schema, no sitemap removal, no index promise.

## Owner decision required

One cohort-level decision remains: obtain reliable URL Inspection/Page Indexing data before taking any URL-level indexing or consolidation action. Until then all 126 URLs remain `INDEXING STATUS UNKNOWN`.
