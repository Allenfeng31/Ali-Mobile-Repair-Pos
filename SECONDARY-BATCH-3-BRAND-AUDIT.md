# Secondary Phone Brands Batch 3 — Brand Hub Audit

Audit date: 2026-10-29 (Australia/Melbourne)  
Scope: Microsoft, Realme, ASUS, TCL and Nothing  
Production origin: `https://www.alimobile.com.au`  
Evidence: production sitemap and raw SSR HTML, production inventory API, representative linked Repair Details, and current local source/tests.

## Owner verdict

**CONFIRMED DEFECT — fixed locally in `49619c3`, not deployed.** All five Brand Hubs are technically healthy and useful model selectors, but production still publishes unsupported fast/same-day wording. Local source now treats Batch 3 as evidence-qualified, replacing those claims with parts-, diagnosis- and queue-qualified timing. No URL, model identity, POS price or booking contract changes.

## Production matrix

| Brand Hub | HTTP/final URL | Canonical/indexability | SSR/schema | Models | Production verdict |
|---|---|---|---|---:|---|
| `/repairs/phone/microsoft` | 200; no redirect | self-canonical; sitemap; no robots exclusion | main content; BreadcrumbList + Service | 5 | FAIL: unsupported fast/same-day cards |
| `/repairs/phone/realme` | 200; no redirect | self-canonical; sitemap; no robots exclusion | main content; BreadcrumbList + Service | 5 | FAIL: unsupported fast/same-day cards |
| `/repairs/phone/asus` | 200; no redirect | self-canonical; sitemap; no robots exclusion | main content; BreadcrumbList + Service | 5 | FAIL: unsupported fast/same-day cards |
| `/repairs/phone/tcl` | 200; no redirect | self-canonical; sitemap; no robots exclusion | main content; BreadcrumbList + Service | 5 | FAIL: unsupported fast/same-day cards |
| `/repairs/phone/nothing` | 200; no redirect | self-canonical; sitemap; no robots exclusion | main content; BreadcrumbList + Service | 5 | FAIL: unsupported fast/same-day cards |

All five render a clear H1, introductory model-selection copy, five internal Model Hub links, repair-category links, Ringwood location/support information, warranty language and a usable next action. ASUS is rendered as `Asus` on the production Brand Hub from the catalogue label; the audited Model/Detail identity uses the canonical `ASUS` manufacturer styling locally. This casing difference is not a hardware-model misidentification.

## Exact production timing defect

Each Brand Hub rendered all of the following without model/part evidence:

- `Fast Screen Repairs`
- “Many supported [brand] repairs can be completed quickly…”
- `Same-day may be available`
- “Same-day repair may be available … when parts are in stock.”

The production inventory has 35 rows per brand (7 per model), all priced at `0`. No row provides a turnaround authority. The local correction adds the five Batch 3 slugs to the existing evidence-qualified secondary-brand policy, producing:

- `Timing Confirmed Before Repair`
- model/fault/parts/device-condition/queue qualification
- `Parts Checked Before Repair`
- no same-day, while-you-wait or immediate-repair promise

## Representative Repair Detail and booking chain

Ten production URLs were fetched: one Screen Detail and one selected Loudspeaker shared route for one model per brand.

| Brand/model | Screen Detail | Shared Loudspeaker Detail | Booking identity |
|---|---|---|---|
| ASUS ROG Phone 3 / `ZS661KS` | 200; quote-only | 200; `Quote on Request` | Asus + ROG Phone 3 + service slugs preserved |
| Microsoft Lumia 640 / `RM-1072` | 200; quote-only | 200; `Quote on Request` | Microsoft + Lumia 640 preserved |
| Nothing CMF Phone 2 Pro 5G / `CMF2P` | 200; quote-only | 200; `Quote on Request` | Nothing + CMF Phone 2 Pro 5G preserved |
| Realme 7 Pro / `RMX2170` | 200; quote-only | 200; `Quote on Request` | Realme + 7 Pro preserved |
| TCL 10 Pro / `T799H` | 200; quote-only | 200; `Quote on Request` | TCL + 10 Pro preserved |

Production Screen Detail H1/title omitted the manufacturer (for example, `ROG Phone 3 Screen Replacement`), although model code and booking identity were correct. Local source now qualifies the public H1/title/schema identity while deliberately handing the unchanged raw POS model to booking. The shared Loudspeaker pages already suppress the `$50` for a selected Batch 3 device and keep `priceAuthority: quote-only`; Model Hub cards were inconsistent and are addressed in the Model audit.

## AI-readable answers

Raw HTML verdict for Brand Hubs:

| Question | Production |
|---|---|
| What service/brand is this? | CLEAR |
| Which models are supported? | CLEAR |
| What repairs may be available? | CLEAR but catalogue-dependent |
| What will it cost? | CLEAR: choose exact model |
| How long will it take? | MISLEADING: unsupported fast/same-day wording |
| Is there a warranty? | CLEAR: six months on eligible repairs, subject to exclusions |
| Where is service provided? | CLEAR: Ringwood Square |
| What should the visitor do next? | CLEAR |

## GSC, indexing and visual QA limits

- No current Batch 3 Search Analytics export or URL Inspection evidence exists in the workspace, and no authenticated GSC connector was available. Clicks, impressions and average position are **UNAVAILABLE**; indexing is **INDEXING STATUS UNKNOWN**. Sitemap inclusion and 200/self-canonical HTML do not prove Google indexing.
- Google Search Status showed no active incident during the audit; this does not change any site verdict. See [Google Search Status Dashboard](https://status.search.google.com/) and [Google Search documentation updates](https://developers.google.com/search/updates).
- Raw SSR, source-level responsive components and focused tests were checked. Hydrated mobile/desktop visual interaction was not run, so visual overflow, focus order and tap-target QA remain **HOLD** rather than PASS.

## Scope confirmation

No production mutation, push or deploy occurred. Telstra migration commit `5fe9029` remains unexecuted. Batch 1, Batch 2, primary brands and unrelated MacBook/Antigravity work were not modified.
