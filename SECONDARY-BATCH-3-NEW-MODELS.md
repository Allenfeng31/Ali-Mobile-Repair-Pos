# Secondary Phone Brands Batch 3 — New Model Research

Research date: 2026-10-29  
Rule: manufacturer release evidence and Australian market evidence are not repair-support authority. A public Model Hub still requires an exact POS identity, model identifier, verified repair support and safe booking behaviour.

## Owner verdict

**HOLD — research candidates only.** No new Model Hub was created. None of the candidates below has the required Ali Mobile POS identity/repair catalogue evidence.

## Microsoft

Microsoft's official support pages state that Surface Duo and Surface Duo 2 have reached end-of-servicing and no longer receive newer Android/security updates: [Surface Duo updates](https://support.microsoft.com/en-us/surface/update-surface-duo) and [Surface Duo 2 features](https://support.microsoft.com/en-us/surface/models/surface-duo-2-features).

- New smartphone candidate: **none verified**.
- Decision: retain the existing Lumia/Surface Duo commercial identities; do not manufacture a successor page.

## ASUS

Official ASUS evidence confirms the [ROG Phone 9 series](https://press.asus.com/news/press-releases/asus-rog-phone-9-series-launch/) and [Zenfone 12 Ultra](https://press.asus.com/news/press-releases/asus-zenfone-12-ultra-premium-smartphone). ASUS Australia's [phone support list](https://www.asus.com/au/support/faq/1056885/) also identifies ROG Phone 9 and Zenfone 12 support periods.

| Candidate | Market evidence | Decision |
|---|---|---|
| ROG Phone 9 | Official launch; AU support listing | INVESTIGATE only after exact regional model code and repair support exist in POS |
| ROG Phone 9 Pro | Official launch; global catalogue | HOLD: Australian commercial/support and POS evidence required |
| Zenfone 12 Ultra | Official launch; AU support family listing | INVESTIGATE only after exact model code and repair support exist in POS |

## Nothing / CMF

Nothing's current [Australian phone catalogue](https://au.nothing.tech/collections/phones) provides direct Australian pricing/availability evidence. It lists Phone (3), Phone (3a) Lite, Phone (4a), Phone (4a) Pro and Phone (4b), in addition to already-published Batch 3 devices. The [Phone (3) AU product page](https://au.nothing.tech/products/phone-3/) independently confirms the Australian product.

| Candidate missing from Ali Mobile | AU evidence | Decision |
|---|---|---|
| Phone (3) | Official AU sale page | Highest-priority investigation; exact identifier and repair support still missing |
| Phone (3a) Lite | Official AU catalogue | INVESTIGATE; do not conflate with Phone 3a / 3a Pro |
| Phone (4a) | Official AU catalogue | INVESTIGATE; exact POS identity required |
| Phone (4a) Pro | Official AU catalogue | INVESTIGATE; do not merge with Phone (4a) |
| Phone (4b) | Official AU catalogue | HOLD pending exact AU model identity and Ali Mobile support |

Do not duplicate `CMF Phone 2 Pro 5G`, `Phone 3a 5G` or `Phone 3a Pro 5G`; they already have published hubs.

## Realme

The official [realme Australia catalogue](https://www.realme.com/au/) still exposes the older local range and does not establish current Australian availability for the newer global families. The official [realme global catalogue](https://www.realme.com/global/) lists GT 8 Pro, GT 7/7T/7 Pro and newer numbered/C/P families; the official newsroom confirms the [GT 7 global launch](https://www.realme.com/in/newsroom/realme-gt7-series-global-launch).

| Candidate group | Evidence | Decision |
|---|---|---|
| GT 7 / GT 7T / GT 7 Pro / GT 8 Pro | Official global | HOLD: no current official AU catalogue evidence and no POS repair support |
| realme 14/15/16 families | Official global catalogue | HOLD: exact variants, AU availability and repair evidence required |

No inference should be made from global release to local repairability.

## TCL

The official [TCL Australia mobile catalogue](https://www.tcl.com/au/en/mobile) and [Australian support selector](https://www.tcl.com/au/en/support-mobile) provide local evidence for newer devices.

| Candidate missing from Ali Mobile | AU evidence | Decision |
|---|---|---|
| TCL 60 SE NXTPAPER 5G | Official AU catalogue/support | INVESTIGATE after exact identifier and repair support are in POS |
| TCL 60 SE | Official AU catalogue/support | INVESTIGATE; keep separate from NXTPAPER variant |
| TCL 605 | Official AU catalogue/support | INVESTIGATE |
| TCL 60R 5G | Official AU catalogue/support | INVESTIGATE |
| TCL 50 Pro NXTPAPER 5G / 50 SE / 505 / 503 | Official AU catalogue/support | Lower priority; release recency and observed repair demand should be confirmed |

TCL's [global mobile catalogue](https://www.tcl.com/global/en/mobile) includes 70-series and P80-series devices, but global presence alone is insufficient Australian market evidence. Those remain HOLD.

## Admission gate for every candidate

Before publication, require all of:

1. Exact customer-facing commercial name and canonical slug.
2. Verified manufacturer/regional identifier; no inferred code.
3. POS records for the exact model and an owner-approved supported repair set.
4. Price authority: positive POS price, genuine variants, or explicit quote-only behaviour.
5. Booking resolver/cart agreement on raw model and service identity.
6. Focused SSR/metadata/canonical/schema/internal-link regression coverage.
7. No synthetic availability, generic SEO filler or duplicate manufacturer/commercial URLs.
