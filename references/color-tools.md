# Color and theme tools

Tools for making or picking a theme, and how each one maps onto shadcn's CSS variables. The same variable names apply to the react route and to Basecoat. daisyUI uses its own names.
Use the first-listed default (shadcn Create, then tweakcn) unless the use case says otherwise.

**The target shape.** A shadcn theme is a set of OKLCH CSS variables in `:root` and `.dark`: `--background`/`--foreground`, `--card`, `--popover`, `--primary`, `--secondary`, `--muted`, `--accent`, `--destructive` (each with a `-foreground` pair), `--border`, `--input`, `--ring`, `--chart-1` … `--chart-5`, `--sidebar-*` and `--radius`. Every tool below either outputs this shape directly or gives you scales you map into it by hand. Check text/background contrast after mapping. Offline: if a theme names a web font (for example Inter), bundle it locally (such as an `@fontsource/*` package) or drop it. Never link Google Fonts.

### shadcn Create (official)
- **What:** The official visual builder for style, base color, theme, chart colors, radius, fonts and icon library. It produces a short preset code.
- **Use when:** Starting a react-route page. It's the fastest way to get a coherent style and theme combination.
- **Avoid when:** You need a specific brand color the presets can't reach. Use tweakcn.
- **Route:** react (copy the generated variables into Basecoat's CSS for html)
- **License:** MIT (shadcn/ui) · **Install:** web tool; `pnpm dlx shadcn@latest apply <preset> --only theme` · **Verified:** 2026-11-25 · https://ui.shadcn.com/create

```bash
pnpm dlx shadcn@latest preset decode <preset>         # inspect what a code contains
pnpm dlx shadcn@latest apply <preset> --only theme    # theme only; --only font for fonts
```

### tweakcn
- **What:** An open-source visual editor for shadcn themes with many community presets. It exports Tailwind v4 OKLCH `:root`/`.dark` blocks, or a shadcn registry URL.
- **Use when:** The user wants a specific mood or a brand color applied across every token, or wants to pick from ready-made themes.
- **Avoid when:** The output must be a strict brand system with exact token values someone else defined.
- **Route:** both (variables also work under Basecoat)
- **License:** Apache-2.0 (site source) · **Install:** web tool; `pnpm dlx shadcn@latest add https://tweakcn.com/r/themes/<name>.json` · **Verified:** 2026-11-25 · https://tweakcn.com
- **Note:** Theme JSON sets `font-sans`/`font-serif`/`font-mono` to named web fonts. Bundle those or remove them.

```bash
pnpm dlx shadcn@latest add https://tweakcn.com/r/themes/modern-minimal.json
```

### Radix Colors
- **What:** 12-step accessible scales (light, dark, alpha and P3) where each step has a defined job: 1–2 app backgrounds, 3–5 component backgrounds, 6–8 borders, 9–10 solid colors, 11–12 text.
- **Use when:** Building a custom theme by hand that needs reliable contrast, or status colors (success, warning, info) beyond shadcn's tokens.
- **Avoid when:** A preset theme would do.
- **Route:** both
- **License:** MIT · **Install:** `pnpm add @radix-ui/colors` (3.0.0; a stable palette, no release since 2023-10) · **Verified:** 2026-11-25 · https://www.radix-ui.com/colors
- **Mapping:** `--background` → step 1, `--muted`/`--accent` → step 3, `--border` → step 6, `--primary` → step 9, `--muted-foreground` → step 11, `--foreground` → step 12. Import the `-dark.css` file for `.dark`.

```css
@import "@radix-ui/colors/slate.css";
@import "@radix-ui/colors/slate-dark.css";   /* defines vars under .dark / .dark-theme */
@import "@radix-ui/colors/indigo.css";
:root { --background: var(--slate-1); --border: var(--slate-6); --primary: var(--indigo-9); --foreground: var(--slate-12); }
```

### Harmony (Evil Martians)
- **What:** An OKLCH and APCA palette with Tailwind-compatible names (50–950). Shades of the same number have equal lightness and contrast across every hue.
- **Use when:** You want a drop-in Tailwind palette where `blue-600` and `red-600` have the same contrast. This makes `--chart-*` and status colors predictable.
- **Avoid when:** You need a brand-specific hue.
- **Route:** both
- **License:** MIT · **Install:** `pnpm add @evilmartians/harmony` (1.4.0) · **Verified:** 2026-11-25 · https://github.com/evilmartians/harmony

```css
@import "tailwindcss";
@import "@evilmartians/harmony/tailwind.css";   /* replaces Tailwind's default palette */
:root { --chart-1: var(--color-blue-500); --chart-2: var(--color-orange-500); --chart-3: var(--color-green-500); }
```

### Flexoki
- **What:** An "inky" warm paper palette by Steph Ango, with paper and black base tones and 8 accents in light and dark.
- **Use when:** Editorial, reading or notes-style pages. It gives a calm, print-like feel.
- **Avoid when:** You need a crisp SaaS or neutral look.
- **Route:** both
- **License:** MIT · **Install:** no npm package; copy `css/flexoki.css` or `tailwind/namespaced.css` from the repo · **Verified:** 2026-11-25 · https://stephango.com/flexoki
- **Mapping:** `--background: var(--flexoki-paper)`, `--foreground: var(--flexoki-black)`, `--border: var(--flexoki-150)`, `--muted-foreground: var(--flexoki-600)`, `--primary` → one accent (for example `--flexoki-blue-600`). The file has no dark variables. Under `.dark`, set `--background: var(--flexoki-black)` and `--foreground: var(--flexoki-200)`, and use lighter accent shades (for example `-400`).

### Catppuccin
- **What:** A popular pastel palette with four flavors (Latte light, then Frappé, Macchiato and Mocha dark) and 26 named colors each. It ships CSS variables with hex, rgb, hsl and oklch values.
- **Use when:** Developer-facing pages, or when the user already uses Catppuccin in their editor or terminal.
- **Avoid when:** You need a corporate or neutral look.
- **Route:** both
- **License:** MIT · **Install:** `pnpm add @catppuccin/palette` (1.8.0) · **Verified:** 2026-11-25 · https://catppuccin.com/palette
- **Mapping:** `--background` → base, `--card` → mantle, `--muted` → surface0, `--border` → surface1, `--foreground` → text, `--muted-foreground` → subtext0, `--primary` → mauve (or any accent). Latte maps to `:root` and Mocha to `.dark`. tweakcn also has a ready `catppuccin` theme.

```css
@import "@catppuccin/palette/css/catppuccin.css";
:root { --background: var(--ctp-latte-base); --foreground: var(--ctp-latte-text); --primary: var(--ctp-latte-mauve); }
.dark { --background: var(--ctp-mocha-base); --foreground: var(--ctp-mocha-text); --primary: var(--ctp-mocha-mauve); }
```

### Material Color Utilities
- **What:** Google's HCT color science behind Material 3 dynamic color. It turns one source color, or an image, into tonal palettes and light and dark schemes.
- **Use when:** You only have a brand hex or a logo or image and need a full, harmonious light and dark scheme generated at build time.
- **Avoid when:** A visual tool would do. The output uses Material role names, so you must map them.
- **Route:** both (run once in a build script with `npx tsx gen-theme.ts`, not at runtime. Plain `node` ESM fails on the package's extensionless imports. Vite bundling works.)
- **License:** Apache-2.0 · **Install:** `pnpm add -D @material/material-color-utilities` (0.4.0) · **Verified:** 2026-11-25 · https://github.com/material-foundation/material-color-utilities
- **Mapping:** `primary` → `--primary`, `onPrimary` → `--primary-foreground`, `surface` → `--background`, `onSurface` → `--foreground`, `outlineVariant` → `--border`, `error` → `--destructive`.

```ts
import { argbFromHex, hexFromArgb, themeFromSourceColor } from "@material/material-color-utilities"

const t = themeFromSourceColor(argbFromHex("#3b82f6"))
const light = { "--primary": hexFromArgb(t.schemes.light.primary), "--background": hexFromArgb(t.schemes.light.surface) }
```

### Realtime Colors
- **What:** Previews five colors (text, background, primary, secondary, accent) on a live sample website. It can randomize and export CSS or Tailwind.
- **Use when:** Choosing a palette with the user by showing it on a real layout, not as swatches.
- **Avoid when:** You need a full 12-step scale.
- **Route:** both
- **License:** proprietary web tool, free · **Install:** n/a · **Verified:** 2026-11-25 · https://www.realtimecolors.com
- **Mapping:** text → `--foreground`, background → `--background`, primary → `--primary`, secondary → `--secondary`, accent → `--accent`. Derive `--muted`/`--border` by mixing, for example `color-mix(in oklch, var(--foreground) 12%, var(--background))`.

### Coolors
- **What:** A fast palette generator and explorer. Press space to generate, lock the swatches you like, and browse popular palettes.
- **Use when:** Exploring a mood quickly, or picking 3–5 accent colors for `--chart-1…5`.
- **Avoid when:** You need accessible UI scales. It gives swatches, not tokens. Some features need an account or Pro.
- **Route:** both
- **License:** proprietary web tool, freemium · **Install:** n/a · **Verified:** 2026-11-25 · https://coolors.co

### OKLCH picker (and culori)
- **What:** oklch.com, an OKLCH picker by Evil Martians that shows gamut (sRGB/P3) and converts to and from hex. culori is the JS library for doing the same in build scripts.
- **Use when:** Tweaking a single shadcn token. Since shadcn tokens are OKLCH, adjust L for contrast, C for vividness and H for hue, then paste the result.
- **Avoid when:** n/a.
- **Route:** both
- **License:** oklch.com: free web tool · culori: MIT · **Install:** `pnpm add -D culori` (4.0.2) · **Verified:** 2026-11-25 · https://oklch.com

```ts
import { formatCss, oklch, parse } from "culori"
formatCss(oklch(parse("#3b82f6")!)) // "oklch(0.623… 0.188… 259.8…)" → paste into --primary
```
