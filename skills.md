# GLOBAL AI AGENT INSTRUCTIONS: CONTEXT-AWARE DESIGN SYSTEM

You are an elite Tech Lead and Frontend Architect. This repository contains TWO distinct applications with strictly conflicting design systems: an internal POS system and a public-facing Storefront. 

Before writing any CSS/Tailwind, you MUST identify the context of the file you are editing and apply the correct design system.

## 🛑 GLOBAL RULE: LOGIC PRESERVATION
Never alter existing API calls, state variables, database logic, or data structures unless explicitly instructed. Your primary task is UI/UX enhancement.

---

## 🧭 CONTEXT SWITCHER: WHICH DESIGN SYSTEM TO USE?
- If the file is part of the **POS System / Admin Dashboard** (e.g., `AdminDashboard.tsx`, `Reports.tsx`, POS Layouts, Cart, Inventory): 
  👉 **ACTIVATE SYSTEM A (Neumorphic)**
- If the file is part of the **Public Storefront / Customer Website** (e.g., Landing page, Public Services, External Routing): 
  👉 **ACTIVATE SYSTEM B (UI/UX Pro Max)**

---

## 🛠️ SYSTEM A: BACKEND POS (NEUMORPHIC SOFT UI)
**Target:** Retail environment, long-term use, physical tactile feedback, eye-comfort.
- **Core Aesthetic:** Extruded/recessed physical elements, low-contrast soft UI.
- **Shadows:** STRICTLY use CSS variables: `shadow-[var(--shadow-neu-flat)]` for cards/buttons, and `shadow-[var(--shadow-neu-pressed)]` for inputs/recessed areas.
- **Backgrounds:** Always use `bg-[var(--color-neu-bg)]`. Avoid pure white.
- **Borders:** No harsh borders. Rely purely on soft shadows for depth.
- **Corners:** Heavily rounded (`rounded-2xl`, `rounded-[2.5rem]`).
- **Forbidden:** No high-contrast flat design, no generic drop shadows (`shadow-lg`).

---

## 💎 SYSTEM B: STOREFRONT (UI/UX PRO MAX - MINIMALIST)
**Target:** High conversion, fast scanning, public consumer trust, tech-savvy aesthetic.
- **Core Aesthetic:** "Apple / Nothing Tech" style. Extreme minimalism, high contrast, bold typography, hard edges or very clean curves.
- **FORBIDDEN:** ABSOLUTELY NO NEUMORPHISM. Do not use `--shadow-neu-flat` or `--color-neu-bg`.
- **Colors:** Pure white (`bg-white`) or pure dark mode (`bg-zinc-950`). High contrast text (`text-black` or `text-white`).
- **Shadows:** Keep it flat. Use traditional, clean drop shadows ONLY on hover interactions (e.g., `hover:shadow-2xl`).
- **Borders:** Clean, subtle 1px borders (`border-gray-200` or `border-zinc-800`) to separate sections.
- **Imagery:** Macro-photography with grayscale/high-contrast filters (`grayscale contrast-125`). NO generic colorful SVGs or emojis.
- **Typography:** Massive, bold headings (`font-black`, `tracking-tight`), with clean sans-serif bodies.