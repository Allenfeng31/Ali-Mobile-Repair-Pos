# Secondary Phone Model Hub Audit — Batch 1

Audit date: 2026-10-27 (Australia/Melbourne)  
Batch: Xiaomi, Nokia, Vivo, LG, OnePlus  
Local baseline: `f72cd7830895bbf4e1e5c1956ca0caf7a5ed3397`  
Validated implementation commit: `a57ee6e612c6bca2873405c1027d6c8c289ce0e9`  
Production evidence: fresh HTTP responses from `https://www.alimobile.com.au`; representative response was a Vercel/Next.js prerender cache hit. Production did not expose a Git revision, so local and production revisions cannot be asserted identical.

## Executive summary

- Re-enumerated 126 live Model Hubs: Xiaomi 33, Nokia 34, Vivo 32, LG 18, OnePlus 9. Counts match the earlier inventory, but were independently regenerated from the live sitemap.
- All 126 returned HTTP 200, had no redirect, used a self-referencing canonical, and contained server-rendered main content, repair choices, quote/pricing paths, CTA content and `BreadcrumbList` schema.
- Confirmed identity defect: 125 H1s omitted the manufacturer; all 126 titles and Open Graph titles omitted it. Vivo Y20s already had a branded H1, but its title remained `Y20s ...`.
- Confirmed content defect: all 126 opening timing cards and FAQs suggested same-day service without authoritative support.
- Warranty existed in server-rendered Quick Answers on all 126, but it was below the opening content. Classification: **CONTENT PRESENT BUT HARD TO FIND**.
- All 126 exposed the same 12-option repair/pricing signature. This is high template overlap, but the exact model URLs still provide distinct canonical destinations, POS model identity, repair-detail routes, quote paths and related-model navigation. No noindex, redirect or consolidation action is justified from this evidence alone.
- Local implementation corrects brand/model identity for all 15 named secondary-phone brands. Batch 1 alone receives qualified timing and a prominent six-month eligible-repair warranty card.
- Google URL Inspection/Page Indexing data was unavailable. Every URL remains **INDEXING STATUS UNKNOWN**. Search Analytics showed 4 clicks and 857 impressions across 97 exact Model Hub URLs from 2026-07-27 through 2026-10-24; this is historical search appearance evidence, not a current index verdict.
- No browser UI was used at the owner's request. Raw SSR and server-component rendering were verified; hydrated desktop and 375px visual checks remain **HOLD**, so this audit does not award FULL TECHNICAL PASS.

## Scope and method

1. Read the local implementation authority, current Git state, existing tests, shared page-mode and warranty/timing sources.
2. Re-enumerated the five live sitemap prefixes and fetched all 126 pages without JavaScript.
3. Parsed status, final URL, canonical, robots/meta/OG, H1/H2, first paragraph, breadcrumbs, JSON-LD, repair cards, pricing/quote text, timing, warranty and CTA.
4. Compared each page with the live POS inventory endpoint for model identity/code and repair authority.
5. Queried Search Console Search Analytics for 2026-07-27 to 2026-10-24. Attempts to obtain URL Inspection/Page Indexing results returned invalid-argument responses; no index verdict was inferred.
6. Deep-read four materially different models per brand. Samples cover newer/popular-looking catalog entries, older models, low/no-impression pages, ambiguous numeric names and the available quote-led pattern. No Batch 1 page had a positive POS-backed core-repair price; therefore a genuine numeric-price Model Hub sample did not exist.
7. Wrote failing regression tests, made the narrow shared-template change, then ran focused page tests, lint and repository-wide checks.

The exhaustive evidence is in `MODEL-HUB-BATCH-1-URL-MATRIX.csv`. It preserves production values; it does not substitute expected post-change text.

## Exhaustive findings

| Evidence | Result | Classification |
|---|---:|---|
| Published URLs | 126 | Verified |
| HTTP 200 / no redirect | 126 / 126 | PASS — transport is stable |
| Self canonical | 126 / 126 | PASS — no canonical conflict found |
| SSR main content and repair cards | 126 / 126 | PASS — visible content exists before JS |
| H1 lacks standalone brand identity | 125 / 126 | FAIL — confirmed ambiguity |
| Title/OG title lacks standalone brand identity | 126 / 126 | FAIL — confirmed ambiguity |
| Unsupported same-day wording | 126 / 126 | FAIL — confirmed misleading claim |
| Warranty visible in SSR | 126 / 126 | IMPROVEMENT — present but hard to find |
| Core POS-backed positive price | 0 / 126 | PASS — pages remain quote-led rather than inventing prices |
| Repair/pricing signatures | 1 across 126 | HOLD — high overlap; usefulness and demand must be evaluated, not assumed thin |
| Verified GSC indexing result | 0 / 126 | HOLD — inspection data unavailable |

Every page exposed 12 repair cards in the same production signature: five core exact-model services, Camera Lens, Water Damage assessment, four shared peripheral services, and Motherboard/Logic Board. Core services were quote-led. Shared virtual services displayed the existing `$50` price where authorised. Seven cards used `Quote on Request`. Links remained model- or context-specific.

## Brand results and representative samples

| Brand | URLs | URLs with GSC impressions | Clicks / impressions | Deep samples and reason |
|---|---:|---:|---:|---|
| Xiaomi | 33 | 28 | 0 / 384 | 14C (recent numeric identity), Note 13 Pro 5G (variant), Mi A2 (older), Redmi Note 7 (higher demand) |
| Nokia | 34 | 27 | 1 / 162 | G42 (numeric ambiguity), XR21 (rugged family), 950XL (older), 9 Pureview (older low-demand) |
| Vivo | 32 | 25 | 1 / 147 | V29 (short identity), X60 Pro (variant), Y52 5G (highest sample demand), S15e (low-demand) |
| LG | 18 | 12 | 0 / 147 | Velvet (non-numeric name), V50 (older), G8s (higher demand), Nexus 4 (legacy) |
| OnePlus | 9 | 5 | 2 / 17 | 10T (short name), 10 Pro (ambiguous), 9 Pro (click and ambiguity), Nord CE 2 5G (long variant) |

POS evidence supported all 20 sample identities with a single model code: Xiaomi 14C `2409BRN2CA`; Nokia G42 `TA-1581`; Vivo Y52 5G `V2053`; LG Velvet `LMG900EM`; OnePlus 9 Pro `LE2123`, plus the codes recorded in the matrix. Across the full batch, all 126 URL identities matched one POS model code after preserving the bespoke Vivo Y20s commercial label (`V2027`). Model codes are evidence, not customer-facing names.

### Xiaomi

Useful: exact model routes, 12 visible choices, quote paths and POS identity. Search demand is the largest cohort (384 impressions), led by Mi 8 (81), Mi Note 10 (46) and Redmi 10 (40). Insufficient before change: H1/title detached `Xiaomi` from names such as `14C`; all pages repeated unsupported same-day wording. Status: identity/timing/warranty **FIXED locally**; uniqueness/indexing **HOLD**.

### Nokia

Useful: exact commercial identities and TA/RM code evidence, repair-detail links and quote CTAs. Numeric models such as `8.1`, `5.4` and `G42` are especially ambiguous without `Nokia`. Search Analytics showed 162 impressions and one click. Status: identity/timing/warranty **FIXED locally**; indexing **HOLD**.

### Vivo

Useful: exact variants such as Y52 5G and X60 Pro, plus an existing bespoke Y20s introduction. Y20s was the only already-branded H1, but metadata still omitted Vivo. Search Analytics showed 147 impressions and one click. Status: shared identity applied without duplicating `Vivo`; bespoke Y20s intro preserved; timing/warranty **FIXED locally**; indexing **HOLD**.

### LG

Useful: model and model-code distinction for legacy/named devices; quote routes remain actionable. Generic brand-level queries such as `lg mobile phone repair cost` appeared against several Model Hubs, suggesting the Brand Hub may be the better owner for broad intent, but simultaneous impressions alone do not prove cannibalisation. Status: identity/timing/warranty **FIXED locally**; query ownership and indexing **HOLD**.

### OnePlus

Useful: small, clean nine-model catalogue with exact detail routes. `9 Pro` is the clearest confirmed standalone ambiguity. OnePlus had 2 clicks/17 impressions; 9 Pro had 1 click/5 impressions. Status: identity/timing/warranty **FIXED locally**; indexing **HOLD**.

## Required before/after proof

The following “before” strings are exact production values captured on 2026-10-27. The “after” strings are exact local server-component results from the shared rule.

### Xiaomi 14C (`2409BRN2CA`)

- Before H1: `14C repair options`
- Before title: `14C Repair in Ringwood | Pricing, Screen Options & Booking | Ali Mobile`
- Before meta: `Choose the available Xiaomi repairs for 14C, view current pricing, check supported repair options, and book with Ali Mobile & Repair in Ringwood.`
- Before paragraph: `Choose the available repair for your exact 14C to view current pricing, screen options where published, and the repair path that best matches the device in front of you.`
- After H1: `Xiaomi 14C Repair Options`
- After title: `Xiaomi 14C Repair Options | Ali Mobile Ringwood`
- After meta: `Choose available repairs for Xiaomi 14C, view current pricing or Quote on Request, check parts and timing conditions, and book with Ali Mobile & Repair in Ringwood.`
- After paragraph: `Choose a repair for your exact Xiaomi 14C to see current pricing or Quote on Request, then confirm parts availability and timing before work begins.`

### Nokia G42 (`TA-1581`)

- Before: H1 `G42 repair options`; title `G42 Repair in Ringwood | Pricing, Screen Options & Booking | Ali Mobile`; meta began `Choose the available Nokia repairs for G42...`; paragraph began `Choose the available repair for your exact G42...`.
- After: H1 `Nokia G42 Repair Options`; title `Nokia G42 Repair Options | Ali Mobile Ringwood`; meta and paragraph use the same exact templates above with `Nokia G42`.

### Vivo Y52 5G (`V2053`)

- Before: H1 `Y52 5G repair options`; title `Y52 5G Repair in Ringwood | Pricing, Screen Options & Booking | Ali Mobile`; meta began `Choose the available Vivo repairs for Y52 5G...`; paragraph began `Choose the available repair for your exact Y52 5G...`.
- After: H1 `Vivo Y52 5G Repair Options`; title `Vivo Y52 5G Repair Options | Ali Mobile Ringwood`; meta and paragraph use the shared exact templates with `Vivo Y52 5G`.

### LG Velvet (`LMG900EM`)

- Before: H1 `Velvet repair options`; title `Velvet Repair in Ringwood | Pricing, Screen Options & Booking | Ali Mobile`; meta began `Choose the available LG repairs for Velvet...`; paragraph began `Choose the available repair for your exact Velvet...`.
- After: H1 `LG Velvet Repair Options`; title `LG Velvet Repair Options | Ali Mobile Ringwood`; meta and paragraph use the shared exact templates with `LG Velvet`.

### OnePlus 9 Pro (`LE2123`)

- Before: H1 `9 Pro repair options`; title `9 Pro Repair in Ringwood | Pricing, Screen Options & Booking | Ali Mobile`; meta `Choose the available OnePlus repairs for 9 Pro, view current pricing, check supported repair options, and book with Ali Mobile & Repair in Ringwood.`; paragraph `Choose the available repair for your exact 9 Pro to view current pricing, screen options where published, and the repair path that best matches the device in front of you.`
- After: H1 `OnePlus 9 Pro Repair Options`; title `OnePlus 9 Pro Repair Options | Ali Mobile Ringwood`; meta `Choose available repairs for OnePlus 9 Pro, view current pricing or Quote on Request, check parts and timing conditions, and book with Ali Mobile & Repair in Ringwood.`; paragraph `Choose a repair for your exact OnePlus 9 Pro to see current pricing or Quote on Request, then confirm parts availability and timing before work begins.`

The after wording is clearer because brand and model form one standalone entity, `Repair Options` describes the page purpose, and price/quote plus parts/timing conditions are explicit without promising stock or completion time.

## Timing, warranty and opening customer journey

Production timing card on every URL:

> Parts and timing confirmed first — Same-day repair may be available for some common repairs when parts are in stock. Contact us before visiting to confirm your model, issue and timing.

This was **unsupported or misleading** because no model-level authority proved same-day availability. The Batch 1 replacement is:

> Repair timing confirmed first — Timing depends on the exact device model, selected repair, parts availability, device condition, diagnosis, additional faults and current repair queue. We confirm the expected timing before work begins.

Production warranty was server-rendered but below the opening cards. The new opening card uses the authoritative constant:

> 6-Month Repair Warranty — Completed standard repairs include a 6-month warranty covering the replacement part and labour. Water-damage repairs are excluded.

This does not claim that every service is eligible. Existing lower-page exclusions remain visible for new impact/physical damage, liquid damage, misuse, unrelated faults and third-party work where applicable.

After the local change, the opening server-rendered path is: **Brand + Model → choose repair → price or Quote on Request → timing conditions → eligible-repair warranty → CTA**.

## SSR and AI-reader simulation

The same shared production template and repair signature were verified on all 126 responses. On each of the 20 deep samples, raw visible HTML (scripts and JSON-LD ignored) produced the same classification:

| Question | Production raw SSR result | Reason |
|---|---|---|
| Manufacturer | CLEAR | Badge, breadcrumb and page copy identify the brand |
| Exact device | PARTIAL | H1/title treated model alone as the entity; fixed locally |
| Repairs offered | CLEAR | 12 visible cards and exact service links |
| Cost/quote path | CLEAR | Quote on Request and authorised shared `$50` options are visible |
| Timing | MISLEADING | Same-day suggestion lacked authoritative support; fixed locally |
| Warranty | CLEAR but hard to find | Visible in Quick Answers, promoted locally |
| Business location | CLEAR | Ringwood Square Shopping Centre Kiosk C1 appears in SSR |
| Next action | CLEAR | View repair options, call and booking/contact routes are visible |

Hydrated rendered comparison and 375px visual readability were not performed because the owner requested no computer/browser use. Source classes and server markup alone are insufficient for FULL TECHNICAL PASS.

## Metadata, schema and internal linking

- Production titles/OG titles were generic and omitted the manufacturer. Local titles now use `{Brand} {Model} Repair Options | Ali Mobile Ringwood` for the 15 named secondary brands.
- Local descriptions identify purpose, price/quote path, parts/timing conditions and Ringwood without fixed pricing, same-day, stock or indexing promises.
- Canonical paths are unchanged.
- Production emitted only `BreadcrumbList` on these Model Hubs. No speculative Service/Product schema was added.
- Breadcrumb visible labels and structured-data names now receive the full brand+model identity through the existing component.
- Related-model anchor text now includes the manufacturer for secondary phone Model Hubs.
- Accessible repair-option and hero highlight labels now use the full identity.
- Primary phones, tablets, laptops, watches and Repair Detail pages remain outside the naming branch.

## Thin/duplicate assessment

Confirmed: the 126 production pages share one repair/pricing signature and largely generic copy. This is a content-quality risk, especially for low-demand legacy models.

Not confirmed: that the pages are soft 404s, duplicates selected by Google, or unsuitable for indexing. Each page has an exact canonical URL, supported POS identity, repair choices, actionable quote path and distinct model/detail links. No reliable model-specific specifications, fault patterns or testimonials were available, so none were invented. Additional differentiation requires authoritative POS/service evidence.

Recommendation: retain the pages and improved template pending URL Inspection data. Consider model-specific additions only when supported repair availability, positive POS pricing, genuine variant distinctions or verified Repair Results exist.

## GSC interpretation and query ownership

- Period: 2026-07-27 to 2026-10-24.
- Exact Model Hub totals: 4 clicks, 857 impressions, 97 URLs with at least one impression.
- Highest-impression URLs: Xiaomi Mi 8 (81), Xiaomi Mi Note 10 (46), LG G7 ThinQ (41), Xiaomi Redmi 10 (40), LG G8s ThinQ (38), Xiaomi Redmi Note 10 Pro (33).
- Broad queries such as `lg mobile phone repair cost`, `nokia mobile repair melbourne` and `vivo mobile phone repairs cost` appeared against Model Hubs. Brand Hubs are the intended owner for manufacturer-level intent; Model Hubs should target exact device repair-option intent; Repair Detail pages should target exact device+service intent. This is an ownership observation, not proven cannibalisation.
- Ninety-seven historical impression rows do not prove current indexing. Twenty-nine URLs without performance rows do not prove exclusion.
- URL Inspection/Page Indexing data could not be retrieved. Classification for every row is `INDEXING STATUS UNKNOWN — URL Inspection/Page Indexing data unavailable`.
- Confirmed indexing issues: zero. Content-quality hypotheses must not be presented as Google-confirmed causes.

## Implementation

- Added an explicit 15-brand consumer-facing identity source with official casing and duplicate-brand protection.
- Applied identity to title, meta/OG, H1, intro, breadcrumb/schema input, accessible labels and related-model anchors.
- Limited timing/warranty content changes to the five audited brands.
- Removed same-day wording from Batch 1 hero, Quick Answers and FAQs.
- Promoted the authoritative six-month eligible standard-repair warranty and Water Damage exclusion to the opening cards.
- Preserved canonicals, repair data, price authority, quote-only logic, repair-detail links, booking behaviour and primary/non-phone templates.

## Validation

- RED proof: the new identity unit test initially failed because the implementation module did not exist; the OnePlus SSR integration test initially received the old title.
- Focused Model Hub suite: **354/354 passed** across 11 test files.
- Targeted ESLint on all changed source/test files: **passed**.
- Repository-wide Vitest: **1944 passed, 26 failed across 11 files**. The failures are outside this change (Samsung shared pricing expectations, sitemap/redirect/date assertions, warranty/business-hours assertions, repair-result revalidation expectations, one stale mock and one sandbox IPC denial). Because the worktree was already dirty and no clean baseline run exists, they cannot be formally labelled pre-existing; none referenced the changed Model Hub logic and the focused suite is green.
- TypeScript: nonzero due current-tree errors in four-brand/oppo tests, RepairResults, CameraModule, Samsung content and duplicate-key source. No reported diagnostic points to the changed files; without a clean baseline they are recorded as out-of-scope rather than claimed pre-existing.
- `git diff --check`: passed.
- Browser/hydration/375px: **not performed** by owner request; visual status remains HOLD.

## Final classifications

| Area | Result |
|---|---|
| URL inventory / HTTP / canonical / SSR delivery | PASS — verified and sufficient |
| Standalone brand+model identity | FIXED locally |
| Metadata and OG purpose | FIXED locally |
| Pricing and quote integrity | PASS — unchanged and verified |
| Timing | FIXED locally for Batch 1 |
| Warranty visibility | FIXED locally for Batch 1 |
| Breadcrumb/schema/internal anchors | FIXED locally; schema type unchanged |
| Thin-content concern | HOLD — real overlap, insufficient evidence for consolidation |
| Current index status | HOLD — URL Inspection/Page Indexing unavailable |
| Hydrated desktop/mobile visual verification | HOLD — not performed |

Batch 1 is ready for owner review at source/SSR level, but not for a FULL TECHNICAL PASS until hydrated desktop and 375px checks are completed. The corrected naming template is safe to reuse for the remaining ten secondary brands; those brands have not been content-audited.
