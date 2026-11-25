# Styles

The 8 shadcn/ui styles set the shape and density of components: height, padding, radius, borders, type size. Colors come from the theme, so any style works with any theme. Both routes support all 8 (react through the vendored shadcn components, html through `basecoat-css/<style>`).

Change with `"style"` in `kit.json`, then `scripts/apply.mjs`. The page's own layout (your Tailwind classes) does not change; match its spacing to the style (dense style → tighter page spacing).

| Style | shadcn's description | Feel | Reach for it when |
|---|---|---|---|
| **vega** | Clean, neutral, and familiar | The classic shadcn/ui look | You have no strong reason to pick another. Safe default. |
| **nova** | Reduced padding and margins | Tighter than vega, still airy | Tools, forms, settings, control panels |
| **maia** | Rounded, with generous spacing | Soft, friendly, roomy | Consumer-facing pages, onboarding, product tours |
| **lyra** | Boxy and sharp. For mono fonts | Square corners regardless of radius, technical | Developer docs, specs, logs, terminal-like tools; pair with a mono font if the user wants one |
| **mira** | Made for compact interfaces | The densest | Dashboards, data tables, admin, comparison grids |
| **luma** | Fluid, luminous, and soft | Rounded, filled inputs without borders, light surfaces | Showcase and marketing pages, galleries, polished prototypes |
| **sera** | Editorial and typographic | Square, uppercase small labels, tracking | Articles, reports, long reads, documentation |
| **rhea** | Like Luma but compact | Soft but dense | Data-rich pages that should still feel friendly |

## By page type

| Page | Style | Notes |
|---|---|---|
| Report / write-up | sera or vega | shadcn Typeset (or `@tailwindcss/typography`) for long text, see [layout.md](layout.md); narrow column |
| Dashboard / data comparison | mira (or rhea for softer) | TanStack Table + charts; `tabular-nums` |
| Tool / form | nova | Group fields with `field`; keep actions in one place |
| Landing / showcase | luma or maia | Motion sparingly; strong type scale; one accent |
| Technical spec / dev page | lyra | Mono for code and identifiers only, unless asked |
| Chat / agent UI | vega or nova | shadcn `message`, `bubble`, `trace`, `message-scroller` components (AI Elements has moved into shadcn) |

These are starting points, not rules. If the user shows a reference they like, match its density and corner shape and pick the closest style.

## Fonts

Pages use the system font stack (fast, offline, good CJK coverage). shadcn's site pairs some styles with web fonts (Geist for nova, JetBrains Mono for lyra, Playfair Display headings for sera). Only embed a font if the user asks: put the `.woff2` in `src/assets/`, add an `@font-face` in `src/index.css`, and set `--font-sans` / `--font-heading` in the `@theme inline` block. Subset it if it's large (CJK fonts are several MB).
