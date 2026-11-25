# ohmypage

An [Agent Skill](https://agentskills.io) for coding agents (Claude Code, Codex and others that read `SKILL.md`): build a polished single-file HTML page that opens offline, from any folder.

- **Two routes.** React + [shadcn/ui](https://ui.shadcn.com) for interactive pages, or plain HTML + [Basecoat](https://basecoatui.com) / [daisyUI](https://daisyui.com). Tailwind CSS v4 either way, bundled into one `.html` file.
- **All 8 shadcn styles**, 7 base palettes × 17 accents, 5 icon sets, light/dark. Switch any of them in `kit.json`.
- **Your own theme** once in a theme folder, reused by name on every page.
- **A curated catalog** of libraries and inspiration sites, each with when to use it and when not to.
- **A history log** (one JSON line per page version, shared by all agents on the machine) so "the page I made last week" can be found and its look reused.
- **No hooks, no global install.** Each page has its own `node_modules`, hard-linked from pnpm's store, so pages cost almost no disk and never touch the project around them.

## Install

Requirements: Node.js 20.19+ and [pnpm](https://pnpm.io/installation). macOS, Linux or Windows.

Put this folder in your agent's skills directory, for example:

```bash
git clone https://github.com/geraldpeng6/ohmypage ~/.claude/skills/ohmypage   # Claude Code
git clone https://github.com/geraldpeng6/ohmypage ~/.codex/skills/ohmypage    # Codex
```

Then ask for a page ("make an HTML report comparing these benchmark results"). The agent reads `SKILL.md` and does the rest.

## Use the scripts directly

```bash
node ohmypage/scripts/new.mjs gpu-report --style mira --theme zinc --accent blue --kind dashboard
node ohmypage/scripts/add.mjs --dir gpu-report table card tabs chart
# edit gpu-report/src/App.tsx
node ohmypage/scripts/build.mjs --dir gpu-report --note "GPU throughput comparison"
open gpu-report.html
```

| Script | Does |
|---|---|
| `new.mjs <name>` | Create a page folder and install dependencies |
| `add.mjs <component…>` | Copy shadcn components (and what they need) into the page |
| `apply.mjs` | Apply `kit.json` after editing it (style, theme, icons, …) |
| `dev.mjs` | Live-reload preview |
| `build.mjs` | Build `<name>.html` and log it |

## History log

`~/.local/share/ohmypage/history.jsonl` (or `$XDG_DATA_HOME/ohmypage/`, `%LOCALAPPDATA%\ohmypage\` on Windows, `$OHMYPAGE_HOME` to override). Set `OHMYPAGE_HISTORY=off` to disable. Format: [references/history-log.md](references/history-log.md).

## Maintaining

```bash
node tests/run.mjs            # end-to-end: every style, icon set, route and log rule
node tests/run.mjs --quick

# update the vendored shadcn/ui files
git clone --depth 1 --filter=blob:none --sparse https://github.com/shadcn-ui/ui.git /tmp/shadcn
git -C /tmp/shadcn sparse-checkout set apps/v4/registry packages/shadcn/src
node tools/vendor-shadcn.mjs /tmp/shadcn
node tools/pin-versions.mjs   # refresh exact package versions
```

CI runs the end-to-end tests on Ubuntu, macOS and Windows.

## License

MIT. Vendored shadcn/ui files are MIT; see [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md).
