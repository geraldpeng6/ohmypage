# Icons

Icon libraries for page-level icons (feature lists, KPI tiles, nav, empty states) and for the icons inside shadcn components.
Use the first-listed default (Lucide) unless the chosen shadcn style or the use case says otherwise. Use one icon family per page.

**Component-internal icons vs page icons.** In this skill, the icons *inside* shadcn components (chevrons, checks, close buttons) come from the `iconLibrary` set in `components.json`. shadcn supports only `lucide`, `tabler`, `hugeicons`, `phosphor` and `remixicon` there. Some styles default to a non-Lucide set (for example maia/mira use Hugeicons and lyra uses Phosphor). Any other library, such as Kubai Icons, is for **page-level icons only**. Don't rewrite component internals to use it.

Sizing tips: in React, set size with `className="size-4"` or the `size` prop. Use `aria-hidden` on decorative icons and an accessible label on icon-only buttons. All of the following bundle as inline SVG, so they work offline.

### Lucide (default)
- **What:** A large, consistent set of 24px stroke icons (more than 2,000 components ship in lucide-react 1.x). shadcn's default set.
- **Use when:** Almost always.
- **Avoid when:** The chosen shadcn style uses another library. Match it.
- **Route:** both (html: `pnpm add lucide` and `createIcons`, or paste SVG from lucide.dev)
- **License:** ISC · **Install:** `pnpm add lucide-react` (1.80.0) · **Verified:** 2026-11-25 · https://lucide.dev

```tsx
import { ArrowUpRightIcon, ChartBarIcon } from "lucide-react"

<ChartBarIcon className="size-4 text-muted-foreground" aria-hidden />
<ArrowUpRightIcon size={16} strokeWidth={1.5} />
```

### Tabler Icons
- **What:** About 5,500 outline icons plus about 1,000 filled variants (6,546 components in 3.53.0). The biggest free outline set.
- **Use when:** Lucide lacks a glyph, especially for dashboards, devices or finance, or the style uses Tabler.
- **Avoid when:** Mixing with Lucide on the same page. Their stroke rhythm differs.
- **Route:** both (`@tabler/icons` SVG or webfont for html)
- **License:** MIT · **Install:** `pnpm add @tabler/icons-react` (3.53.0) · **Verified:** 2026-11-25 · https://tabler.io/icons

```tsx
import { IconChartBar } from "@tabler/icons-react"

<IconChartBar size={16} stroke={1.5} />
```

### Phosphor Icons
- **What:** About 1,500 icons, each in six weights: thin, light, regular, bold, fill and duotone.
- **Use when:** You want weight or duotone variation for a softer, friendlier look, or the style is lyra.
- **Avoid when:** You need a guaranteed active release cadence. The last npm release was 2.1.10 on 2025-05-22, about 18 months ago, though the repo still had commits in 2026-01.
- **Route:** both
- **License:** MIT · **Install:** `pnpm add @phosphor-icons/react` (2.1.10) · **Verified:** 2026-11-25 · https://phosphoricons.com

```tsx
import { ChartBarIcon } from "@phosphor-icons/react"

<ChartBarIcon size={16} weight="duotone" />
```

### Hugeicons (free set only)
- **What:** More than 6,000 free icons in the "Stroke Rounded" style, rendered via `HugeiconsIcon`. Pro (`@hugeicons-pro/*`, 10 styles) is paid. Don't use it without a license.
- **Use when:** The style is maia or mira (Hugeicons by default), or you want a rounded, modern look.
- **Avoid when:** You need solid or duotone variants. Those are Pro only.
- **Route:** react
- **License:** MIT (free packages) · **Install:** `pnpm add @hugeicons/react @hugeicons/core-free-icons` (1.1.10 / 4.4.0) · **Verified:** 2026-11-25 · https://hugeicons.com

```tsx
import { HugeiconsIcon } from "@hugeicons/react"
import { ChartBarLineIcon } from "@hugeicons/core-free-icons"

<HugeiconsIcon icon={ChartBarLineIcon} size={16} strokeWidth={1.5} />
```

### Remix Icon (not MIT, check the license)
- **What:** More than 3,100 neutral system icons (per its README) in paired Line and Fill styles.
- **Use when:** You want a neutral, slightly geometric system look with paired outline and fill.
- **Avoid when:** The icon would serve as a logo or brand mark, or the output is an icon pack or library.
- **Route:** both (`remixicon` package has SVG and webfont)
- **License:** **Remix Icon License v1.0** (January 2026, not OSI). Free for personal, commercial and client projects, with modification allowed and attribution optional. It **prohibits** selling or distributing the icons as a standalone product, icon pack or font, or as the primary value of a download. It prohibits creating a competing icon library, even with superficial changes. It prohibits using any icon, modified or not, as a logo, trademark, app icon or brand identity. Brand icons may only represent their own brand. Note: the npm `remixicon` 4.9.1 metadata still says Apache-2.0, but the repo's `License` file governs. · **Install:** `pnpm add @remixicon/react` (4.9.0) · **Verified:** 2026-11-25 · https://remixicon.com

```tsx
import { RiBarChartLine } from "@remixicon/react"

<RiBarChartLine size={16} className="text-muted-foreground" />
```

### Kubai Icons (page-level only)
- **What:** About 2,800 icons with built-in hover animation, plus badged and "off" variants, as one tree-shakable React component per icon.
- **Use when:** Landing and marketing pages, or feature grids where a playful animated icon adds character.
- **Avoid when:** Inside shadcn components (not a supported `iconLibrary`), or dense data UIs where hover motion is noise.
- **Route:** react (Vue, web components and static SVG also exist; see the site)
- **License:** MIT (icons and packages) · **Install:** `pnpm add kubai-icons-react` (0.15.0) · **Verified:** 2026-11-25 · https://icons.kubai.design

```tsx
import { Folder } from "kubai-icons-react"

<button data-kubai-trigger><Folder size={18} trigger="parent" /> Open</button>
```

**Kubai Icons drawing skill (separate, source-available).** A separate agent skill draws new icons in the Kubai style. Repo: https://github.com/kubai087/kubai-icons. Install:

```bash
git clone https://github.com/kubai087/kubai-icons.git ~/.claude/skills/kubai-icons   # Codex: ~/.agents/skills/kubai-icons
```

The skill is under the **Kubai Icons License** (source-available, not open source). Icons you make with it are yours for any use. You may run it and share exact, unmodified copies for free. You may **not** distribute modified or translated versions of its rules files, sell the skill, remove its notices, or present it under another name. The website code is all rights reserved. Read the repo's README and LICENSE directly for details. Don't copy or paraphrase its rule files into this skill.
