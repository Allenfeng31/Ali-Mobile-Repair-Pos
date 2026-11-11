# Secondary Phone Brands Batch 3 — Model Hub Audit

Audit date: 2026-10-29  
Population: 25 sitemap-published Model Hubs; five per brand.

## Owner verdict

**CONFIRMED DEFECT — fixed locally in `49619c3`, not deployed.** Production technical routing is healthy, and POS commercial names/model identifiers are internally consistent. Three repeated presentation defects were confirmed:

1. 25/25 production Model Hub H1/title pairs omit the manufacturer; the accepted local identity policy from `a57ee6e` already corrects these Model Hubs.
2. 25/25 publish four shared virtual services as model-specific `Starting from $50` despite 175/175 Batch 3 POS rows being zero-price and the selected Repair Detail being quote-only.
3. 25/25 publish an unsupported same-day FAQ. Brand/model timing is now qualified locally.

## Exhaustive identity inventory

| Brand | Published models and POS model identifiers |
|---|---|
| ASUS | ROG Phone 3 — `ZS661KS`; ROG Phone 5 — `ZS673KS`; ROG Phone 6 — `AI2201`; Zenfone 8 — `ZS590KS`; Zenfone 9 — `AI2202` |
| Microsoft | Lumia 640 — `RM-1072`; Lumia 950 — `RM-1108`; Lumia 950 XL — `RM-1085`; Surface Duo — `1930`; Surface Duo 2 — `1995` |
| Nothing | CMF Phone 2 Pro 5G — `CMF2P`; Phone 1 — `A063`; Phone 2 — `A065`; Phone 3a 5G — `A142`; Phone 3a Pro 5G — `A142P` |
| Realme | 7 Pro — `RMX2170`; 8 5G — `RMX3241`; C21Y — `RMX3261`; GT Master Edition — `RMX3363`; X3 SuperZoom — `RMX2086` |
| TCL | 10 Pro — `T799H`; 20 5G — `T781H`; 20 Pro 5G — `T810H`; 30+ — `T676K`; 30 SE — `6165H` |

Each exact identity occurs on seven POS records. No duplicate commercial/manufacturer URL was found, no model-code collision was found, and no URL/booking rename is required. Local public identity adds the manufacturer to Model/Detail presentation but preserves each raw POS model in booking.

## Technical and content result

- 25/25: HTTP 200, no redirect, self-canonical, sitemap included, no meta/X-Robots exclusion.
- 25/25: server-rendered main content, BreadcrumbList schema, visible repair cards, Ringwood details, next action and six-month eligible-repair warranty language.
- 25/25 production H1/title: model only; meta descriptions do mention the manufacturer. AI identity answer is therefore PARTIAL in production and CLEAR in local source.
- No server-rendered matching Repair Result was found for these 25 pages. Model-specific evidence is the exact POS commercial model, identifier, seven catalogue rows and supported internal routes—not independent repair-result proof.
- Hydrated visual/mobile behaviour is HOLD; source/raw-HTML evidence does not prove overflow, interaction or focus order.

## Repair and price authority

The 175 POS records contain no positive price. The visible repair options fall into four different authority classes:

| Class | Production behaviour | Verdict/local outcome |
|---|---|---|
| POS-backed row with positive price | None in Batch 3 | N/A; no price created |
| POS-backed zero-price row | Screen, Battery, Charging, Front Camera, Back Camera and model-dependent Water Damage | Valid `Quote on Request`; unchanged |
| Shared fixed-price service | Camera Lens Replacement at `$50` | Authorised existing fixed price; unchanged |
| Shared/virtual assessment route | Loudspeaker, Earpiece Speaker, Power Button, Volume Button | Production Model cards misleadingly show `Starting from $50`; local cards now `Quote on Request` |
| Shared diagnosis-led route | Motherboard & Logic Board | Quote/diagnosis-led; unchanged |
| Unverified availability | Any repair beyond POS/shared policy evidence | Must not be described as confirmed model-specific parts/service |

The five representative selected Loudspeaker Repair Details already render `Quote on Request`, retain the correct brand/model/service query, and resolve to a zero-price cart item. Local Model cards now match that downstream authority. No POS price, Camera Lens authority or quote-led direct repair was changed.

### Remaining timing HOLD

The shared Camera Lens and four virtual peripheral routes still expose a generic `30 Minutes` badge on production Model cards/Repair Details, while their own copy says final timing follows diagnosis. Because that timing is owned by a cross-brand shared contract and Batch 2's quote-led baseline is accepted, this audit did not remove or globally rewrite it. Owner decision is required for a separate shared-timing authority audit. The Batch 3-specific same-day claims were safe to remove and are fixed locally.

## Repair-signature duplication and content independence

There are only two exact repair/pricing signatures:

- 16/25: core quote-led rows + Camera Lens + four virtual peripherals + Logic Board; Water Damage is shared/virtual.
- 9/25: same signature but Water Damage is a direct POS-backed zero-price route: ASUS ROG Phone 3, ASUS ROG Phone 6, Nothing CMF Phone 2 Pro 5G, Nothing Phone 1, Nothing Phone 2, Realme C21Y, Realme GT Master Edition, Realme X3 SuperZoom and TCL 20 Pro 5G.

The pages are independently useful for exact identity, model code, canonical model selection and booking context, but the explanatory content is predominantly shared template content. Do not add generic filler, noindex, redirect, merge or delete. Future content should be added only when supported by genuine Repair Results, verified repair support, positive POS authority or authoritative model-specific repair constraints.

## AI-readable raw HTML matrix

| Answer | Production | Local source |
|---|---|---|
| Device/model | PARTIAL: manufacturer absent from H1/title | CLEAR: manufacturer + commercial model |
| Available repairs | CLEAR as routes; support should remain catalogue/assessment-qualified | CLEAR; unchanged |
| Price or quote | MISLEADING for four virtual `$50` cards | CLEAR: quote-only; Camera Lens `$50` preserved |
| Repair time | MISLEADING same-day FAQ; shared 30-minute issue remains | Batch-specific wording CLEAR; shared timing HOLD |
| Warranty | CLEAR | CLEAR; unchanged |
| Location | CLEAR | CLEAR; unchanged |
| Next action | CLEAR | CLEAR; unchanged |

## Before/after source correction

| Surface | Before | After |
|---|---|---|
| Batch 3 Brand/Model timing | fast/same-day fallback | evidence-qualified timing/parts wording |
| Model virtual peripheral price | synthetic `$50` | `0` authority → `Quote on Request` |
| Secondary Repair Detail identity | model-only H1/title | manufacturer-qualified public identity |
| Repair Detail booking model | raw POS model | unchanged raw POS model |
| Model URL/canonical | existing slug | unchanged |
| POS data | seven zero-price rows/model | unchanged |

Full row-level evidence is in `SECONDARY-BATCH-3-MODEL-MATRIX.csv`.
