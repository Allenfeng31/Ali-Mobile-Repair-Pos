---
name: ali-mobile-lean-agent
description: Minimises token and quota use for Ali Mobile coding tasks. Use for every task in the Ali-Mobile-Repair-Pos repository.
---

# Ali Mobile Lean Agent

## Core execution rules

- Complete only one clearly requested task per run.
- Do not broaden scope or add optional improvements.
- Prefer the smallest safe patch.
- Initially inspect no more than three directly relevant files.
- Read more files only when proven necessary.
- Reuse existing components and patterns.
- Stop immediately after the requested task is complete.

## Token-saving rules

- Prefer RTK commands whenever supported.
- Never print complete files, large raw diffs, or full command logs.
- Use targeted searches and narrow line ranges.
- Return concise findings.
- Do not produce exhaustive reports unless explicitly requested.
- Do not repeat context already supplied by the user.

## Browser and screenshot rules

- Do not use Chrome, browser automation, Playwright or screenshots unless explicitly requested.
- Do not validate many routes, device families or viewport sizes unless explicitly requested.
- For visual work, make the source change and leave visual QA to the user unless specifically assigned.

## Validation rules

- Run only one cheapest relevant validation by default.
- Do not automatically run TypeScript plus production build.
- Do not rerun successful commands.
- Do not launch broad tests for isolated CSS or copy changes.
- On failure, show only the relevant error section.

## Git rules

- Preserve all unrelated working-tree changes.
- Do not reset, restore, stash, clean, commit, push or deploy unless explicitly requested.
- Do not add temporary screenshots or reports to the repository.

## Completion format

Return only:

1. files changed;
2. concise change summary;
3. validation performed;
4. remaining manual review.

Keep responses brief.
