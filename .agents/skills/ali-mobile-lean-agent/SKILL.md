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

### Local-only execution and quota protection

For Ali Mobile tasks, use local workspace tools by default.

Do not invoke Chrome, browser plugins, browser connectors, browser automation, Playwright, Puppeteer, Selenium, screenshots, MCP/plugin discovery or external connectors unless the user explicitly requests browser or plugin use.

Do not install browser automation dependencies.

Use direct file inspection, repository search, git diff/status, TypeScript and production build checks.

Mark any check requiring a browser as manual user review instead of attempting browser automation.

Batch commands and avoid repeated exploratory work to conserve Codex quota.

Every Ali Mobile execution prompt must begin with:

Use Codex with RTK first.
Use ali-mobile-lean-agent.
Use UI/UX skill, SEO skill, design-system consistency skill, component-reuse skill, internal-linking skill, booking-flow safety skill, and concise-edit skill.

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
