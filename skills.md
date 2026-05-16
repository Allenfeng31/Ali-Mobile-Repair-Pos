# GENERAL CONTEXT
You are working on a high-performance, Neumorphic ("Soft UI") dashboard system. This software runs in a retail environment on low-end hardware (e.g., 1GB RAM machines). Every optimization, typography clarity adjustment, and architectural safety constraint outlined below is MANDATORY.

# SKILL: NEUMORPHIC_FRONTEND_ARCHITECT

## 1. 1:1 FUNCTIONAL PRESERVATION (STRICT)
- PURE UI WRAPPER: You are strictly FORBIDDEN from altering, adding, or deleting any existing business logic, state variables, API calls, or `onClick`/`onChange` handlers unless explicitly instructed.
- SELF-AUDIT REQUIREMENT: Before writing any code, internally verify that ALL original functions, modals, tooltips, and data renderings from the current file are completely preserved. You are doing a 1:1 visual upgrade, not a feature rewrite.

## 2. VISUAL & PERFORMANCE CONSTRAINTS
- NO BLUR ALLOWED: Do NOT use `backdrop-filter`, `backdrop-blur`, or any `blur` classes. They degrade GPU performance on 1GB RAM hardware. Use strictly layered, solid CSS box-shadows to generate depth.
- SYSTEM THEME BASE: Purge all dark mode styles (`bg-black`, `bg-zinc-900`, `text-white`). Universally use the neumorphic base theme variable: `bg-[var(--color-neu-bg)]`.
- EXTRUDED ELEMENTS (Cards, Raised Rows, Buttons): Use `shadow-[var(--shadow-neu-flat)]` and ensure tactile physical feedback: `active:scale-[0.98] active:shadow-[var(--shadow-neu-pressed)] transition-all`.
- RECESSED ELEMENTS (Inputs, Search Bars, Inner Containers): Use `shadow-[var(--shadow-neu-pressed)]`.
- DATA LEGIBILITY: Core transaction values, financial prices, numbers, and margins MUST be high-contrast absolute bold black (`text-black`). Do NOT hide metrics behind badges or decorative tags.
- SECONDARY TYPOGRAPHY: Do NOT use low-opacity (`opacity-40`) for field labels. Use a solid, clear dark gray (`text-gray-600` or `text-black` with high visibility) to maintain sharp contrast.

## 3. ADVANCED UX & INTERACTION LAYOUT
- STICKY PANEL ARCHITECTURE: For split dashboard screen grids, any controller, input form sidebar, or shopping cart panel MUST remain sticky in the viewport and scroll independently.
  -> Add wrapper classes to `<aside>`: `sticky top-6 h-[calc(100vh-3rem)] overflow-y-auto custom-scrollbar`.
  -> Always ensure the parent layout flex/grid has `items-start`.
- MOBILE RESPONSIVENESS: Do not break layout orders on mobile. Use Tailwind's `order-first` for list/navigation items to ensure they stay on top of details panels on small screens.
- INLINE EXPANSION (ACCORDION): If a list item has expandable details, preserve the smooth height animation. Ensure the expanded state container is recessed (`shadow-[var(--shadow-neu-pressed)] rounded-2xl`).

## 4. STRICT CODE INTEGRATION PROTOCOL (PREVENT JSX CORRUPTION)
- NO PARTIAL PATCHING: Do NOT apply line-by-line diffs or partial replacement patches on complex React views.
- FULL FILE REDUCTION: You must internally process the visual upgrades and OUTPUT THE ENTIRE, UNTRUNCATED FILE code within a SINGLE Markdown block. The user will execute a clean global override to safeguard all JSX tags.