# GENERAL CONTEXT
You are working on a high-performance, Neumorphic ("Soft UI") dashboard system. This software runs in a retail environment on low-end hardware (e.g., 1GB RAM machines). Every optimization, typography clarity adjustment, and architectural safety constraint outlined below is MANDATORY.

# SKILL: NEUMORPHIC_FRONTEND_ARCHITECT

## 1. VISUAL & PERFORMANCE CONSTRAINTS
- NO BLUR ALLOWED: Do NOT use `backdrop-filter`, `backdrop-blur`, or any `blur` classes. They degrade GPU performance on 1GB RAM hardware. Use strictly layered, solid CSS box-shadows to generate depth.
- SYSTEM THEME BASE: Purge all dark mode styles (`bg-black`, `bg-zinc-900`, `text-white`). Universally use the neumorphic base theme variable: `bg-[var(--color-neu-bg)]`.
- EXTRUDED ELEMENTS (Cards, Raised Rows, Buttons): Use `shadow-[var(--shadow-neu-flat)]` and ensure tactile physical feedback: `active:scale-[0.98] active:shadow-[var(--shadow-neu-pressed)] transition-all`.
- RECESSED ELEMENTS (Inputs, Search Bars, Inner Containers): Use `shadow-[var(--shadow-neu-pressed)]`.
- DATA LEGIBILITY: Core transaction values, financial prices, numbers, and margins MUST be high-contrast absolute bold black (`text-black`). Do NOT hide metrics behind badges or decorative tags.
- SECONDARY TYPOGRAPHY: Do NOT use low-opacity (`opacity-40`) for field labels (e.g., Cost, Sell, Model). Use a solid, clear dark gray (`text-gray-600` or `text-black` with high visibility) to maintain sharp contrast under store lighting.

## 2. ADVANCED UX & INTERACTION LAYOUT
- STICKY PANEL ARCHITECTURE: For split dashboard screen grids, any controller, input form sidebar, or shopping cart summary panel MUST remain sticky in the viewport and scroll independently when data tables get long.
  -> Add wrapper classes to `<aside>`: `sticky top-6 h-[calc(100vh-3rem)] overflow-y-auto custom-scrollbar`.
  -> Always ensure the parent layout flex/grid has `items-start` to avoid column height inheritance breaking the CSS sticky mechanics.
- INVENTORY CARD MATRIX: Inventory table rows must be treated as independent extruded neumorphic cards by default. Stock indicators must remain extruded blocks with semantic text color indicators inside, maintaining uniform row height.
- REMOVE OBJECTS CONTROL: For all looping state lists (variants, line items), close/delete buttons (e.g., `×`) must be rendered on all blocks as long as the array length > 1, ensuring universal user override capabilities.

## 3. STRICT CODE INTEGRATION PROTOCOL (PREVENT JSX CORRUPTION)
- NO PARTIAL PATCHING: Do NOT apply line-by-line diffs or partial replacement patches on complex React views containing large tables, `.map()` renders, or nested conditionals.
- FULL FILE REDUCTION: When modifying code architecture, you must internally process the visual upgrades and OUTPUT THE ENTIRE, UNTRUNCATED FILE code within a SINGLE Markdown block. The user will execute a clean global override to completely safe-keep all matching JSX closing tags and map brackets.