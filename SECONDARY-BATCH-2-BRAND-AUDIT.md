# Secondary Phone Brands Batch 2 — Brand Hub Audit

Audit date: 2026-10-27  
Scope: Huawei, HTC, Sony, Telstra and Motorola Brand Hubs only.  
Evidence: fresh production HTML/headers, production sitemap, live POS repair inventory and Google Search Console Search Analytics. No browser/hydrated/mobile inspection was performed.

## Executive result

All five Brand Hubs are technically discoverable and useful model selectors, but production is **FAIL / HOLD FOR CONTROLLED COPY FIX** because every hub makes unsupported speed and same-day claims. Canonical, metadata, SSR, model enumeration, warranty copy, local-store support and internal links are otherwise coherent. Do not redirect, merge, noindex or remove any Brand Hub.

| Brand | Models | HTTP / canonical | GSC 2026-07-27–2026-10-24 | Repair results | Verdict |
|---|---:|---|---:|---:|---|
| HTC | 5 | 200 / self | 0 clicks, 325 impressions, pos. 20.02 | 0 | FAIL — unsupported timing copy |
| Huawei | 5 | 200 / self | 0 clicks, 39 impressions, pos. 17.56 | 1 | FAIL — unsupported timing copy |
| Motorola | 8 | 200 / self | 0 clicks, 12 impressions, pos. 7.17 | 1 | FAIL — unsupported timing copy |
| Sony | 5 | 200 / self | 0 clicks, 9 impressions, pos. 18.56 | 0 | FAIL — unsupported timing copy |
| Telstra | 5 | 200 / self | 1 click, 39 impressions, pos. 10.26 | 0 | FAIL — unsupported timing copy |

GSC query rows confirm commercial/local intent, especially for HTC (repair, cost, Melbourne, near-me and screen-repair variants). Search Analytics visibility is not a current URL Inspection verdict.

## Shared findings

- Titles, H1s, descriptions and Open Graph consistently identify `{Brand} Phone Repair`; descriptions qualify the Ringwood Square location and exact-model selection.
- All pages are HTTP 200 with no redirect, self-canonical, no robots noindex directive, SSR main content, `BreadcrumbList` and `Service` JSON-LD.
- Brand → Model links match the sitemap and live POS identities. Counts are HTC 5, Huawei 5, Motorola 8, Sony 5 and Telstra 5.
- Opening copy is customer-actionable: choose the exact model, then confirm quote, parts and practical timing.
- All five expose a six-month phone-repair warranty below the opening content, with conditions/exclusions qualified. It is present but not prominent in the hero.
- Local support is accurate and visit-led: Ringwood Square Kiosk C1, directions, walk-ins and call-ahead parts/timing confirmation. No false suburb tenancy was found.
- Internal linking is strong: model cards, repair-type shortcuts, other-brand links, location/support links and a booking/contact path.
- AEO content is SSR-readable through concise problem, process and FAQ sections. Additional FAQ schema is not justified by this audit.

## Blocking production defect

Every hub currently renders `Fast Screen Repairs` with “completed quickly” and `Same-day may be available` with a broad many-models/in-stock claim. No model-level turnaround authority or parts-stock evidence supports those promises. Replace only these two hero cards with conditional timing and parts-confirmation wording. Preserve Motorola's POS-backed `Repairs from $75`; the other four remain quote-led.

## Brand-specific notes

- **HTC:** strongest Brand Hub impressions but zero clicks; the query mix shows real repair/cost/local intent. Improve truthfulness before considering content expansion.
- **Huawei:** one genuine P30 Pro screen Repair Result adds unique evidence. Keep it; do not generalise its outcome or timing to other models.
- **Motorola:** `$75` starting price is supported by live Moto G04/G24 POS services. One Moto G55 Repair Result is relevant, but its “fast” wording is isolated evidence for that job and must not become a general promise.
- **Sony:** no Repair Result; still retained because the hub and multiple Model Hubs have GSC visibility and exact POS identities.
- **Telstra:** only Brand Hub with a click in the period. Existing model range is materially older than Telstra's current device-support catalogue; additions require separate POS/parts validation.

## Visual/accessibility status

Source HTML contains a viewport meta tag, semantic headings, link-based model cards and SSR content. **HOLD:** responsive layout at 375 px, keyboard/focus behavior, hydrated interactions, tap targets and visual overflow were not inspected because this run intentionally did not use a browser or computer-control tooling.

## Decision

Retain and index all five Brand Hubs. Apply the same evidence-qualified timing/parts treatment already accepted for Batch 1, with no metadata, schema, route, pricing, booking or design changes.
