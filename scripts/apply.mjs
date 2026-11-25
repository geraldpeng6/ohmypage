#!/usr/bin/env node
// Apply kit.json to a page after editing it (style, theme, accent, icons, ui, colorScheme).
// Usage: node scripts/apply.mjs [--dir <page>] [--no-install] [--npm]

import { parseArgs } from "node:util"
import { findPageDir, install } from "./lib/common.mjs"
import { applyKit } from "./lib/kit.mjs"

const { values: o } = parseArgs({
  options: {
    dir: { type: "string" },
    "no-install": { type: "boolean", default: false },
    npm: { type: "boolean", default: false },
  },
})
const dir = findPageDir(o.dir)
const { kit, depsChanged, themeSource } = applyKit(dir)
console.log(`ohmypage: applied kit.json (style ${kit.style}, theme ${themeSource}${kit.icons ? `, icons ${kit.icons}` : ""}${kit.ui ? `, ui ${kit.ui}` : ""})`)
if (depsChanged && !o["no-install"]) install(dir, { npm: o.npm })
