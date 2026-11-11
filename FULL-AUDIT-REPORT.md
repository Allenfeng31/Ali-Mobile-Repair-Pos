# Ali Mobile Phase 5 — Secondary Phone Brand Hubs, Batch 1

Audit date: 27 October 2026 (Australia/Melbourne)

Scope: Xiaomi, Nokia, Vivo, LG and OnePlus Phone Brand Hubs only. Production checks were read-only. No push or deployment was performed.

## Executive verdict

All five production URLs are indexable, server-rendered and navigable. Each returned HTTP 200 without a redirect, had one H1 and one `main`, a self-canonical, a sitemap entry, server-rendered model links, and `BreadcrumbList` plus `Service` JSON-LD. All 126 published model links returned HTTP 200 without a redirect. Desktop and 375px browser checks found no horizontal overflow, duplicate IDs or unresolved ARIA references.

One reproducible content-policy defect affected exactly these five pages: the shared hero asserted “Fast Screen Repairs” and that same-day repair may be available without verified brand/model/parts evidence. It was corrected locally with evidence-led timing, parts and quote language. New model and live-POS catalogue gaps were not implemented because repair support and parts evidence are missing.

## Part A — Audit verdicts

| Brand | Technical SEO | Content usefulness | Pricing/policy | UX | GEO/AEO | Overall verdict |
|---|---|---|---|---|---|---|
| Xiaomi | PASS — 200, self-canonical, SSR content/models, valid sitemap/schema | Useful and concise; unsupported speed wording fixed locally | Quote-led; no positive POS price was promoted; warranty/risk wording retained | Search and 33 model links usable at desktop/375px | Direct answers present; no need for added generic copy | LOCAL PASS — FIXED |
| Nokia | PASS — same checks; 34 published model URLs all 200 | Useful, but flat numeric sort is imperfect for mixed Nokia families | Quote-led; policy wording retained | Search mitigates mixed-series ordering | Queries show local repair intent, but ranking/volume do not justify expansion | LOCAL PASS — FIXED; catalogue review deferred |
| Vivo | PASS — same checks; 32 published model URLs all 200 | Useful and model-led; unsupported speed wording fixed locally | Quote-led; policy wording retained | Search/navigation usable | Strongest GSC visibility in this batch, but sample remains small | LOCAL PASS — FIXED; catalogue review deferred |
| LG | PASS — same checks; 18 published model URLs all 200 | Appropriate legacy-brand page; no invented new-device claims | Quote-led; policy wording retained | Search works; duplicate legacy naming requires POS authority to resolve | Answers legacy repair intent without implying current manufacturing | LOCAL PASS — FIXED; catalogue cleanup deferred |
| OnePlus | PASS — same checks; 9 published model URLs all 200 | Useful but catalogue is materially behind current official range | Quote-led; policy wording retained | Search/navigation usable | Low-volume branded intent; model additions need support evidence | LOCAL PASS — FIXED; catalogue review deferred |

Brand-specific notes:

- Xiaomi: the page has the largest current model list of this batch and needs no additional generic copy. Current Australian releases are absent from POS and therefore should not be advertised as repairable yet.
- Nokia: the live POS contains additional mostly legacy records, but every row is zero-priced and some model codes map to multiple display names. Publishing them automatically would overstate support.
- Vivo: GSC visibility is comparatively strongest, with commercial/local queries already mapping to the hub. The evidence supports preserving intent and navigation rather than adding keyword copy.
- LG: LG officially exited the mobile-phone business in 2021. Maintaining a legacy repair hub is useful; presenting “new LG phones” would be inaccurate.
- OnePlus: OnePlus 11 is in live POS but absent from the website; newer official devices are absent from POS. This is an owner/POS support decision, not a safe website-only fix.

## Production and analytics evidence

| Brand | HTTP / redirects | SSR model links | GSC 27 Jul–24 Oct 2026 | GA4 sessions / active users |
|---|---:|---:|---:|---:|
| Xiaomi | 200 / 0 | 33 | 44 impressions, 0 clicks, 14.34 avg position | 8 / 8 |
| Nokia | 200 / 0 | 34 | 280 impressions, 0 clicks, 24.24 avg position | No exact-page row returned |
| Vivo | 200 / 0 | 32 | 314 impressions, 1 click, 11.72 avg position | 2 / 2 |
| LG | 200 / 0 | 18 | 147 impressions, 0 clicks, 26.54 avg position | 4 / 4 |
| OnePlus | 200 / 0 | 9 | 54 impressions, 0 clicks, 12.37 avg position | 3 / 2 |

GSC clicks are too sparse to diagnose poor copy. Most average positions are page two or lower, and the query samples mix brand, model and local intent. GA4 returned 17 reported sessions across four exact pages and no exact-page CTA-specific event rows, so it does not support a broader content or layout change.

## Part B — Confirmed findings

### B1. Unsupported repair-speed implication

- URLs: all five scoped Brand Hubs.
- Source: `storefront/src/app/(public)/repairs/[category]/[brand]/page.tsx`, previous generic hero branch at current lines 1848–1863.
- Production evidence: raw SSR and hydrated pages contained “Fast Screen Repairs” and “Same-day repair may be available”; the live POS has no positive prices and provides no parts/timing authority for these brands.
- Impact: could set an unsupported customer expectation and is not sufficiently qualified for AEO/GEO reuse.
- Classification: **CONFIRMED DEFECT**.
- Severity: **P1** (business-claim accuracy, not ranking impact).
- Smallest safe correction: replace only these five brands’ two hero cards with model/fault/parts/queue-dependent timing plus pre-repair parts/quote confirmation.
- Status: **fixed locally**. The scope set is at `page.tsx:905`, the five-brand guard at `page.tsx:1414`, and corrected copy at `page.tsx:1848–1863`.

### B2. Live POS records missing from public Brand Hubs

- URLs: Nokia, Vivo, LG and OnePlus hubs.
- Evidence: live POS versus production links found Nokia 21, Vivo 1 (`Y3`), LG 10 and OnePlus 14 records missing from the website. Xiaomi had no POS-to-web gap. All scoped POS rows were zero-priced. Examples include Nokia 1020, Vivo Y3, LG G2 and OnePlus 11.
- Identity conflicts: Nokia `RM-1045` maps to 930/935 and `RM-825` to 820/825; Vivo `V2027` maps to Y20/Y20s and `1901` to Y15/Y17; LG has G8/G8s and V40/V40 ThinQ duplicate-code pairs.
- Impact: potential missed navigation, but automatic publication could create duplicate or unsupported Model Hubs.
- Classification: **DATA-DEPENDENT OPPORTUNITY**.
- Severity: **P2**.
- Smallest safe correction: owner/POS review of canonical model identity, actual parts and repair eligibility; then allow normal catalogue publication.
- Status: **deferred**. No POS or Model Hub edits made.

### B3. Flat secondary-brand ordering

- URLs: primarily Nokia and LG.
- Source: `storefront/src/lib/modelSortConfig.ts` numeric smart sort plus flat `BrandModelSearch` use in the Brand Hub page.
- Evidence: Nokia begins with high numeric legacy models before letter-series models; LG exposes near-duplicate names. Search remains available and functional.
- Impact: mild model-finding friction; not an indexing defect.
- Classification: **CLEAR IMPROVEMENT**.
- Severity: **P2**.
- Smallest safe correction: introduce brand-authoritative family/group mappings only after POS identity cleanup.
- Status: **deferred** because a website-only grouping change would encode unresolved model authority.

### B4. Technical, policy and search-intent baseline

- URLs: all five.
- Evidence: HTTP 200; self-canonical; allowed by robots; exact sitemap entries; SSR H1/body/model links; `BreadcrumbList` and `Service`; no unpriced `Offer`; one `main`; no observed broken model URLs, redirects, horizontal overflow, duplicate IDs or unresolved ARIA references. Six-month eligible-repair warranty and water-damage exclusions remain visible.
- Impact: baseline is appropriate and should be preserved.
- Classification: **NO CHANGE**.
- Severity: none.
- Status: preserved.

## Part C — New model discovery

Official research was performed on 27 October 2026. “POS absent” means no matching authoritative live POS model was found; it does not prove Ali Mobile can repair the device.

| Brand | New model | Official evidence and date | Release/AU status | POS status | Website status | Recommendation |
|---|---|---|---|---|---|---|
| Xiaomi | Xiaomi 17; Xiaomi 17 Ultra | [Xiaomi Australia first-sale terms](https://www.mi.com/au/support/terms/xiaomi-17-series/), Australian sale from 1 Mar 2026 | **NEW — RELEASED IN AUSTRALIA** | Absent | Absent | Owner approval only after parts and repair-option confirmation |
| Xiaomi | REDMI Note 17 Pro 5G; Pro Max 5G | [Xiaomi Australia launch page](https://www.mi.com/au/launch/redmi-note-17-series/) and [AU service terms](https://www.mi.com/au/support/policy/redminote17promax5g-premium-service/), AU eligibility from 28 Aug 2026 | **NEW — RELEASED IN AUSTRALIA** | Absent | Absent | Same; do not infer Ali Mobile coverage from manufacturer care benefits |
| Xiaomi | POCO F9 Ultra | [Official Xiaomi Australia listing](https://www.mi.com/au/poco/), verified available 27 Oct 2026; exact AU launch date not stated | **NEW — RELEASED IN AUSTRALIA** | Absent | Absent | Verify whether POCO belongs under Xiaomi repair support before approval |
| Nokia | No credible newer Nokia smartphone beyond G42 5G/XR21; current new devices are HMD-branded | [Official HMD Nokia collection](https://www.hmd.com/en_int/nokia-smartphones-and-tablets), checked 27 Oct 2026 | **EXISTING ON WEBSITE** | G42/XR21 present | G42/XR21 present | No new Nokia model to add; do not relabel HMD phones as Nokia |
| Vivo | X300 Ultra | [Official vivo launch notice](https://www.vivo.com/at/about-vivo/news-detail?id=804), global launch 30 Mar 2026 | **NEW — GLOBAL RELEASE, AU STATUS UNCONFIRMED** | Absent | Absent | Hold pending official AU availability, parts and support evidence |
| Vivo | V70 / V70 FE | [Official vivo launch release](https://www.vivo.com/id/about-vivo/news/vivo-v70-launch), 9 Mar 2026 | **NEW — GLOBAL RELEASE, AU STATUS UNCONFIRMED** | Absent | Absent | Hold; vivo Australia’s current catalogue does not confirm these models |
| LG | No credible new smartphone | [LG official mobile-business closure](https://www.lg.com/ca_en/about-lg/press-and-media/lg-to-close-mobile-phone-business-worldwide/), announced 5 Apr 2021; wind-down by 31 Jul 2021 | **EXISTING ON WEBSITE** | Legacy models only | Legacy models only | Preserve legacy hub; add no “new LG” model |
| OnePlus | OnePlus 11 5G | [Official launch release](https://www.oneplus.com/us/press/press-release/oneplus-welcomes-2023-with-the-launch-of-three-flagship-products), launched 7 Feb 2023 | **EXISTING IN POS — MISSING FROM WEBSITE** | Present, zero-price rows | Absent | Highest-priority owner review; verify parts/support and canonical name before publication |
| OnePlus | OnePlus 13 / 13R | [Official global launch release](https://www.oneplus.com/us/press/press-release/oneplus-launches-new-smartphone-flagship-series-in-north-america-oneplus-13-and-oneplus-13r), 7 Jan 2025 | **NEW — GLOBAL RELEASE, AU STATUS UNCONFIRMED** | Absent | Absent | Hold pending AU/support evidence |
| OnePlus | Nord 5 | [Official OnePlus Australia product page](https://www.oneplus.com/au/nord-5), launched 8 Jul 2025 | **NEW — RELEASED IN AUSTRALIA** | Absent (`Nord 5G` is a different legacy model) | Absent | Owner approval only after repair support evidence |
| OnePlus | OnePlus 15 | [Official OnePlus Australia product page](https://www.oneplus.com/au/15), introduced globally 13 Nov 2025 | **NEW — RELEASED IN AUSTRALIA** | Absent | Absent | Owner approval only after repair support evidence |

No speculative or rumoured model was treated as a release, and no model was added.

## Part D — Implementation

Files changed for the code correction:

- `storefront/src/app/(public)/repairs/[category]/[brand]/page.tsx`
- `storefront/src/app/(public)/repairs/[category]/[brand]/page.service-areas.test.tsx`

Audit artifacts:

- `FULL-AUDIT-REPORT.md`
- `ACTION-PLAN.md`

Before: all 15 secondary-brand hubs inherited “Fast Screen Repairs” and “Same-day may be available”.

After: Xiaomi, Nokia, Vivo, LG and OnePlus alone show “Timing Confirmed Before Repair” and “Parts Checked Before Repair”, with timing dependent on exact model, fault, parts, device condition and queue. The other ten secondary brands and all four primary brands remain on their existing behavior.

Validation:

- Focused new regression cases: **5 passed**.
- Whole existing test file: **23 passed, 1 failed**. The failure is an unrelated pre-existing iPhone assertion expecting a parts card where the current accepted iPhone hero renders Store Trading Hours. The primary hub was not changed.
- Scoped ESLint: no new-line diagnostics; command exits nonzero on four pre-existing `react/no-unescaped-entities` errors and two unused-parameter warnings elsewhere in the existing page.
- `git diff --check` and staged `git diff --cached --check`: **passed**.
- Browser limitation: desktop and 375px production verification was completed before the user requested no further computer-use calls. No post-change deployment exists to browser-test; source-render regression tests cover the local change.

## Part E — Git

- Current HEAD / Batch 1 commit: `f72cd78` — `fix(storefront): qualify secondary brand repair timing`.
- Commit scope: exactly the Brand Hub page and its focused test file.
- Audit artifacts `FULL-AUDIT-REPORT.md` and `ACTION-PLAN.md` remain untracked and unstaged, consistent with the instruction to stage only Batch 1 source files and tests.
- Existing unrelated modified/untracked files were preserved.
- Protected commits `2a203a2` and `f281a6a` remain directly below the new commit and were not amended, reset or removed.
- Nothing was pushed or deployed.

## Part F — Decision

| Brand | Decision | Reason |
|---|---|---|
| Xiaomi | **LOCAL PASS — FIXED** | Unsupported timing claim corrected; new models require owner/POS support approval |
| Nokia | **LOCAL PASS — FIXED** | Timing corrected; zero-price legacy POS gaps and duplicate identities deferred |
| Vivo | **LOCAL PASS — FIXED** | Timing corrected; Y3 and new global releases require support evidence |
| LG | **LOCAL PASS — FIXED** | Timing corrected; legacy catalogue remains appropriate after manufacturer exit |
| OnePlus | **LOCAL PASS — FIXED** | Timing corrected; OnePlus 11 and newer models require explicit support approval |

Batch 1 is ready for owner review. Stop after these five brands.
