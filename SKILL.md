---
name: html-page
description: Build a polished, self-contained single-file HTML page that opens offline - a report, dashboard, article, explainer, prototype, landing page or small tool - from any folder. React + shadcn/ui (all 8 styles) or plain HTML + Basecoat/daisyUI, on Tailwind CSS v4. Keeps a history log so pages made earlier, and their look, can be found and reused. Use when the user asks for a web page, an HTML report or dashboard, a one-pager, a visual write-up, or wants to redo or reuse "that page I made before".
license: MIT
compatibility: Needs Node.js 20.19+ and pnpm (npm works with --npm but copies ~150 MB into each page). Network is needed the first time a package version is installed. macOS, Linux and Windows.
metadata:
  version: "0.1.0"
---

# html-page

Make one HTML file that looks designed, works offline, and can be found again later.

`<skill>` below means the folder that contains this SKILL.md. Run every script with `node <skill>/scripts/<name>.mjs`; they behave the same on macOS, Linux and Windows.

**Not for:** multi-page apps or production projects with their own build. There, use only the references (catalog, styles, themes); don't run these scripts or log anything. A page made here can be promoted later: its folder is a normal Vite + React project.

## Workflow

1. **Check history first** if the user mentions earlier work ("like the one I made last week", "same style as the GPU report"). See [Finding earlier work](#finding-earlier-work).
2. **Pick a route and design** (below). If the user has no clear direction, offer 3–5 sites from [references/inspiration.md](references/inspiration.md) or suggest a style + theme yourself. Don't ask more than one round of questions.
3. **Create the page** in the user's current folder:
   ```bash
   node <skill>/scripts/new.mjs <name> --style vega --theme neutral [--accent blue] [--icons lucide] [--kind report]
   node <skill>/scripts/new.mjs <name> --route html --ui basecoat --style nova
   ```
   This makes `<name>/` (source, `kit.json`, its own `node_modules`) and installs dependencies. The result will be `<name>.html` next to it.
4. **Add components** (react route): `node <skill>/scripts/add.mjs --dir <name> button card table tabs` (`--list` shows all 63).
5. **Write the page**: `src/App.tsx` (react) or `index.html` + `src/page.css` (html). Put data in `src/data.ts` or a JSON file and import it.
6. **Build**: `node <skill>/scripts/build.mjs --dir <name> --note "<what and why, ≤120 chars>" --kind <report|dashboard|article|landing|tool|prototype|…>`
7. **Check it**: open `<name>.html`. If you can take screenshots or read the console, do it once at the end, not after every edit.
8. **Iterate**: edit, rebuild. Builds in the same session update the same history entry, so rebuild freely. If you can keep a process running, `node <skill>/scripts/dev.mjs --dir <name>` gives live reload (not logged).

If a script exits with code 3, pnpm is missing: tell the user and ask whether to install it (`npm install -g pnpm`) or to use `--npm`. Never install it yourself without asking.

## Routes

| | `react` (default) | `html` |
|---|---|---|
| Use for | Anything interactive: filters, sortable tables, charts, tabs, dialogs, chat-like UIs | Content-heavy pages with light interaction; HTML the user wants to hand-edit; markup to paste into a server template |
| UI | shadcn/ui components copied into the page | `--ui basecoat` (default; shadcn look, same tokens), `daisyui` (its own themes), `none` (Tailwind + tokens only) |
| Icons | `--icons` lucide (default), tabler, phosphor, hugeicons, remixicon | Inline SVG (copy from the icon set's site) |

One route per page. Don't mix daisyUI with shadcn/Basecoat on a page: their color variables differ.

## Design choices: kit.json

Every page has `kit.json`. Edit it, then run `node <skill>/scripts/apply.mjs --dir <name>`.

```json
{ "route": "react", "style": "vega", "theme": "neutral", "accent": null, "icons": "lucide", "colorScheme": "system", "kind": "report" }
```

- **style** - shape and density, all 8 shadcn styles. Pick by page type; details in [references/styles.md](references/styles.md).

  | style | character | good for |
  |---|---|---|
  | vega | clean, neutral, familiar | default; general pages |
  | nova | reduced padding and margins | tools, settings, forms |
  | maia | rounded, generous spacing | friendly product pages, onboarding |
  | lyra | boxy, sharp, mono-friendly | technical/dev pages, terminals, specs |
  | mira | compact, dense | dashboards, data tables, admin |
  | luma | fluid, luminous, soft | consumer, marketing, showcase |
  | sera | editorial, typographic | articles, reports, docs |
  | rhea | luma, but compact | dense pages that should still feel soft |

- **theme** - colors. One of 7 base palettes (`neutral`, `stone`, `zinc`, `mauve`, `olive`, `mist`, `taupe`), plus optional **accent** (`amber blue cyan emerald fuchsia green indigo lime orange pink purple red rose sky teal violet yellow`) for primary and chart colors. Or a path to a `.css` file, or the name of a file in the user's theme folder. See [references/themes.md](references/themes.md).
- **icons** - library used inside components; page code imports from the same library.
- **colorScheme** - `system` (follows the OS), `light` or `dark`. Write pages that work in both unless told otherwise.
- **ui**, **daisyThemes** - html route only. `daisyThemes: ["light", "dark"]` picks the daisyUI theme for each scheme.

## Adding libraries

Check the catalog first; every entry says when to use it and when not to:
[components](references/components.md) · [data & charts](references/data.md) · [motion](references/motion.md) · [layout](references/layout.md) · [icons](references/icons.md) · [color tools](references/color-tools.md) · [plain HTML](references/plain-html.md) · [inspiration](references/inspiration.md)

Install inside the page folder, always with `--ignore-workspace` so a surrounding project is never touched:

```bash
cd <name> && pnpm add <package> --ignore-workspace
```

Avoid anything that loads from a CDN or needs an API key at runtime: the page must work offline. Images go in `src/assets/` and are inlined; keep them small. Fonts: use the system stack that is set up; only embed a font file if the user asks.

## Design principles

- Decide what the page is for before styling it. One focal point per screen; secondary things look secondary.
- Content width: body text 60–75 characters per line (`max-w-prose` or `max-w-[65ch]`); data pages can go wide.
- Numbers: `tabular-nums`, right-aligned in tables, consistent units and decimals.
- Use the theme tokens (`bg-background`, `text-muted-foreground`, `border`, `bg-primary`, `chart-1..5`), not raw colors, so theme and dark mode keep working.
- Spacing and type from a small scale; don't invent one-off sizes.
- Avoid the generic AI look: everything centered, purple gradients, glassy cards everywhere, emoji as icons, identical rounded boxes, decorative charts with no data.
- Mixed pages (e.g. a report with an interactive table): choose the main type and its style; embed the rest as sections.
- Accessible by default: real headings, labels on inputs, visible focus, contrast that passes in both schemes.

## History log

`build.mjs` appends one line per page version to a JSONL file shared by all agents on the machine:

- macOS/Linux: `$XDG_DATA_HOME/html-page/history.jsonl` (default `~/.local/share/html-page/history.jsonl`)
- Windows: `%LOCALAPPDATA%\html-page\history.jsonl`
- Override the folder with `HTML_PAGE_HOME`; turn logging off with `HTML_PAGE_HISTORY=off`.

Pass `--note` (what the page is and why, ≤120 characters), `--kind`, and `--label` when the user names a version ("0.2", "for the board"). The agent and session are detected; pass `--agent`/`--session` if your tool doesn't expose them. Field rules and how to append a line by hand (for pages built without these scripts): [references/history-log.md](references/history-log.md).

## Finding earlier work

1. Read the history file (format above). Match on `note`, `kind`, `label`, `path`, `recipe`, `ts`. Each `rev` is one version; the last line for a `(path, rev)` is final.
2. If the HTML file still exists and its SHA-256 (first 12 hex chars) equals `sha`, it is that version. If not equal, it was edited after the build.
3. To keep working on it, use its `src` folder (`kit.json` + sources). To reuse only its look in a new page, create the new page with the same `recipe` values (`style`, `theme`, `accent`, `icons`, `route`/`ui`) and the same extra `libs`.
4. If neither file nor source exists, rebuild from the recipe and the note.

## Troubleshooting

- **Exit code 3**: pnpm missing - ask the user (see Workflow).
- **Install fails offline**: the package version isn't in pnpm's store yet; it needs network once.
- **Page inside another project**: fine. Each page installs with `--ignore-workspace`, and its Vite config ignores parent PostCSS config.
- **Windows, page on another drive than pnpm's store**: pnpm copies instead of linking the first time on that drive; slower, still works.
- **Output references local files**: the build warns. Import assets from `src/` instead of linking by path.
- **Styles look wrong after changing kit.json**: run `apply.mjs`.
