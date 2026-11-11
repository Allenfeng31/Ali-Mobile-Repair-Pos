# Secondary Phone Brands Batch 2 — Action Plan

## Approved in-scope implementation

1. Extend the existing evidence-qualified Brand Hub treatment to Huawei, HTC, Sony, Telstra and Motorola:
   - replace broad speed/same-day hero cards with timing-dependent and parts-confirmation copy;
   - preserve current titles, descriptions, schema, model cards, Motorola `$75` starting price and booking/contact paths.
2. Extend the existing evidence-qualified Model Hub treatment to the same five brands:
   - keep the current local brand+model identity correction;
   - replace same-day hero, Quick Answer and FAQ claims with conditional timing wording;
   - expose the existing standard six-month warranty summary in the hero;
   - preserve all POS prices, Quote on Request states, repair cards and URLs.
3. Add focused regression coverage for all five Batch 2 brands plus one quote-led Huawei and one POS-priced Motorola rendered Model Hub.

## Explicitly out of scope

- Primary brands, accepted Batch 1 output, POS, booking resolver/contracts, POS Chat, GA4, sitemap routing, redirects, schema expansion and new device pages.
- No content invention for specifications, parts stock, repair speed, same-day outcomes or unsupported prices.
- No commit of audit reports; they remain untracked.

## Validation gates

- Focused Brand Hub and Model Hub tests.
- Secondary identity helper tests.
- Targeted TypeScript/lint only if supported without modifying dependencies.
- `git diff --check` and exact staged-file allowlist before the local commit.
- No push and no deploy.

## Post-implementation HOLD items

- Browser/hydrated/mobile inspection at 375 px, keyboard/focus, tap targets and overflow.
- Fresh Google URL Inspection/Page Indexing status; GSC Wizard returned `INVALID_ARGUMENT` in this audit.
- New-model POS demand, exact Australian variants and parts availability.
- Production validation after a separately authorised deployment.

## Retention/pruning decision

Retain all 5 Brand Hubs and all 28 Model Hubs. No merge, redirect, noindex or deletion is supported by current evidence.

## Execution record

- Local source/test commit: `0ff43e8 fix(storefront): qualify batch 2 phone hub timing`.
- Exact commit scope: six Brand/Model Hub policy and test files; audit deliverables remain untracked.
- PASS: Batch 2 Brand Hub cases 5/5; Batch 2 Model Hub cases 5/5; identity/policy helper 23/23; combined Model Hub/helper suite 152/152.
- Full storefront suite: 1956 passed, 26 failed in pre-existing/out-of-scope iPhone, Samsung, sitemap, repair-results and sandbox IPC areas. No Batch 2 test failed.
- TypeScript and scoped lint remain nonzero because of pre-existing errors outside the changed lines/files; `git diff --check` passed.
- No push, deploy, browser, screenshot or mobile visual inspection performed.
