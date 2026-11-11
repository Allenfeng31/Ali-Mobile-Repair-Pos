# Secondary Phone Brands Batch 2 — Model Hub Audit

Audit date: 2026-10-27  
Coverage: all 28 production Model Hubs enumerated from the production sitemap and verified against live POS inventory. Full row-level evidence is in `SECONDARY-BATCH-2-MODEL-MATRIX.csv`.

## Executive result

All 28 routes are technically healthy but production content is **FAIL / HOLD FOR CONTROLLED COPY FIX**. Every page is 200, self-canonical, SSR-readable and tied to an exact live POS model identity. Production omits the brand from Model Hub title/H1/intro identity and makes unsupported same-day claims on every page. The current local branch already contains the separate brand+model identity correction; Batch 2 still needs the evidence-qualified timing/warranty treatment.

## Inventory and technical matrix summary

- 28 URLs: HTC 5, Huawei 5, Motorola 8, Sony 5, Telstra 5.
- 0 non-200 responses; 0 redirects; 0 canonical mismatches; 0 unknown POS model codes.
- 28 SSR `<main>` regions with intro, repair cards, customer actions and `BreadcrumbList` schema.
- 28/28 production titles and H1s omit the brand; local commit `a57ee6e` corrects secondary brand+model identity without changing routes.
- 28/28 hero/FAQ sets contain same-day wording unsupported by model-specific stock/turnaround evidence.
- 28/28 expose warranty information lower on the page; opening warranty prominence is inconsistent with the accepted Batch 1 treatment.
- Four repair/pricing signatures exist. One shared quote-led signature covers 23/28 URLs, creating high template overlap.
- Five Motorola pages have direct POS prices: Edge 20 `$170`, Edge 30 Pro `$179`, Moto G04 `$75/$129`, Moto G24 `$75/$140`, Moto G55 `$80/$129`. Virtual shared-service prices do not establish a Model Hub starting price.

## GSC and indexing evidence

Period: 2026-07-27–2026-10-24.

- 23/28 Model Hubs had a page-level GSC row and were search-visible during the period.
- 3 pages had clicks: Motorola Edge 30 Pro (1), Telstra Essential Pro (1), Telstra T-Smart (1).
- Highest-impression Model Hubs: Telstra Essential Pro 81, Motorola Moto G04 43, Telstra T-Smart 37, Huawei P40 Pro 24, Huawei P30 Pro 20.
- No page row appeared for HTC U12+, Huawei Mate 30 Pro, Motorola Moto G55, Sony Xperia 1 and Sony Xperia 10 II. This is not proof of non-indexing.
- GSC Wizard property listing returned `INVALID_ARGUMENT`; no fresh URL Inspection quota was spent. Current Page Indexing status remains unknown where a current inspection was unavailable.

**Decision:** GSC evidence does not support pruning. Retain all 28: every URL is in the sitemap, internally linked, exact-POS-backed and technically indexable.

## Representative deep audit (4 per brand)

| Brand / model | POS authority | GSC clicks / impressions / position | Deep-audit finding |
|---|---|---:|---|
| HTC Desire 21 Pro 5G | `2AQO100`, quote-led | 0 / 10 / 14.50 | Exact route and repair links; same template/timing defect |
| HTC One M8 | `0P6B100`, quote-led | 0 / 4 / 8.50 | Search-visible; exact identity; no unique service evidence |
| HTC One M9 | `0PJA100`, quote-led | 0 / 7 / 7.71 | Search-visible; exact identity; broad same-day claim unsupported |
| HTC U12+ | `2Q55100`, quote-led | 0 / 0 / — | No GSC row; retain pending longer evidence |
| Huawei P30 Pro | `VOG-L29`, quote-led | 0 / 20 / 11.75 | Best Huawei demand signal; linked Repair Result; no general timing authority |
| Huawei P40 Pro | `ELS-NX9`, quote-led | 0 / 24 / 11.46 | Highest Huawei impressions; same shared service signature |
| Huawei Mate 20 Pro | `LYA-L29`, quote-led | 0 / 3 / 13.00 | Exact service URLs; lower unique value but search-visible |
| Huawei Nova 5T | `YAL-L21`, quote-led | 0 / 1 / 26.00 | Thin but exact and search-visible; retain |
| Motorola Moto G04 | `XT2421-5`, `$75/$129` | 0 / 43 / 6.40 | Strongest price+demand candidate; starting price is POS-backed |
| Motorola Moto G55 | `XT-2435-2`, `$80/$129` | 0 / 0 / — | POS-backed and Repair Result exists; no page row is not a prune signal |
| Motorola Edge 30 Pro | `XT2201-1`, `$179` | 1 / 6 / 8.00 | Clicked page; direct screen price; preserve exact pricing |
| Motorola Moto G Power | `XT2041-3`, quote-led | 0 / 13 / 6.62 | Search-visible despite quote-led inventory; timing claim unsupported |
| Sony Xperia 1 | `J9110`, quote-led | 0 / 0 / — | Exact POS route; no current GSC row; production identity is ambiguous |
| Sony Xperia 1 II | `XQ-AT52`, quote-led | 0 / 5 / 5.20 | Search-visible; shared copy/repair signature |
| Sony Xperia 5 | `J9210`, quote-led | 0 / 15 / 7.60 | Strongest Sony Model Hub signal; retain |
| Sony Xperia 5 II | `XQ-AS52`, quote-led | 0 / 6 / 9.50 | Search-visible; exact service links; high duplication |
| Telstra Essential Pro | `ZTE Blade A5 2020`, quote-led | 1 / 81 / 17.28 | Highest Batch 2 Model Hub impressions; clear retain |
| Telstra T-Smart | `T-Smart`, quote-led | 1 / 37 / 10.76 | Clicked and search-visible; clear retain |
| Telstra Evoke Pro 2 | exact POS name, quote-led | 0 / 7 / 8.57 | Search-visible; shared template |
| Telstra Essential Smart 2.1 | exact POS name, quote-led | 0 / 2 / 5.50 | Search-visible; slug normalization is stable/self-canonical |

## SEO / GEO / AEO / internal-link conclusions

- Brand+model identity is necessary for unambiguous search/entity understanding; preserve the current local identity correction.
- Do not invent model specifications, parts availability, same-day outcomes or numeric pricing. Quote-led is the correct state for 23 pages.
- Direct answers, service cards and FAQs are SSR-visible, but high duplication means model-specific expansion should require actual repair evidence, GSC demand or verified parts/service distinctions.
- Model → exact service, Brand Hub, related-model and general phone-service links are useful. Local identity-aware related anchors should remain.
- Ringwood Square support is legitimate local context; do not turn Model Hubs into suburb doorway pages.
- No schema expansion is required. Structured offers must not be inferred from virtual/shared prices.

## Visual/accessibility status

**HOLD:** no browser, mobile-width, hydration, keyboard, focus, tap-target or visual-overflow inspection was performed. Source-level SSR and semantic evidence is PASS; rendered/mobile behavior is unverified.
