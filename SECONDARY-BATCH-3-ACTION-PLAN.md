# Secondary Phone Brands Batch 3 — Action Plan

## P0 — validated local correction

1. Add Microsoft, Realme, ASUS, TCL and Nothing to the evidence-qualified secondary-brand set.
2. Make the four Batch 3 virtual peripheral options quote-only at the Model Hub/catalogue boundary; preserve Camera Lens `$50`.
3. Qualify linked Repair Detail public identity with manufacturer + model while preserving the original POS model in booking.
4. Keep all URLs, canonicals, POS rows/prices, direct quote-led repairs and warranty policy unchanged.
5. Commit only the scoped source/test files; leave all five reports untracked.

Status: **implemented in local commit `49619c3`**. Production remains unchanged until a separately authorised deploy.

## Validation record

- Staged-index focused suite: **392 passed, 1 failed**. The sole failure is the clean-HEAD iPhone Brand Hub hero-card assertion; all Batch 3 cases passed.
- Narrow green gates: secondary identity/origin/booking/Model Hub tests **200/200 passed**; evidence-led Brand Hub cases **15/15 passed**; Batch 3 Repair Detail identity/booking cases **5/5 passed**.
- Full working-tree suite: **1994 passed, 28 failed**. Comparison against a clean current-HEAD export reproduced the established **26 real assertion failures**. The two additional working-tree failures are (a) sandbox `tsx` IPC `EPERM` and (b) the unrelated pre-existing dirty-worktree `api.localCatalogue` failure. No Batch 3 test regressed.
- TypeScript: exit 2 with the existing 12 diagnostics; none points to a Batch 3 changed file.
- ESLint: eight changed test/helper files pass cleanly. The existing large Repair Detail page still reports its pre-existing 17 `no-explicit-any` errors and 16 warnings; this patch adds none.
- `git diff --cached --check`: PASS before commit.
- Code review: correctness/readability/architecture/security/performance reviewed; a first broad Detail identity version was rejected after it changed a Batch 2 Motorola FAQ key, then narrowed to Batch 3 before commit.

## P1 — owner decisions

### Shared virtual `30 Minutes`

Production Model cards and shared Repair Details expose a generic 30-minute badge for Camera Lens and the four virtual peripheral services, while the same pages say timing follows diagnosis. This is a cross-brand shared timing contract and overlaps the accepted Batch 2 baseline.

Decision required: authorise a separate shared-timing authority audit before changing it. Do not partially remove it from only one surface.

### New Model Hubs

Choose which research candidates should receive POS onboarding. Recommended first investigations based on explicit AU manufacturer evidence:

- Nothing Phone (3)
- TCL 60 SE NXTPAPER 5G / TCL 605 / TCL 60R 5G
- ASUS ROG Phone 9 / Zenfone 12 Ultra after exact AU identifiers are confirmed

No page should be published before the admission gate in `SECONDARY-BATCH-3-NEW-MODELS.md` is satisfied.

### GSC access

Provide current Search Analytics and URL Inspection access/export if performance/indexing decisions are required. Until then, keep every row as `UNAVAILABLE` / `INDEXING STATUS UNKNOWN`; do not use zero-data as an exclusion signal.

## P2 — QA still on HOLD

- Hydrated mobile/desktop interaction, overflow, keyboard focus and tap-target review.
- Natural production build if this commit is selected for release.
- Post-deploy raw HTML verification of all 30 hubs plus the 10 representative details.
- Owner-approved non-customer booking/cart smoke check in the release environment.

## Explicit non-actions

- Do not run Telstra migration `5fe9029`.
- Do not change production POS records or prices.
- Do not create/noindex/redirect/delete/merge Model Hubs from research alone.
- Do not alter Batch 1, Batch 2, primary-brand, MacBook or Antigravity work.
- Do not push or deploy.
