#!/usr/bin/env node
// Live preview while iterating. Not logged. Extra arguments go to Vite (e.g. --port 5180 --open).
// Usage: node scripts/dev.mjs [--dir <page>] [vite options]

import { findPageDir, ensureInstalled, run, viteBin } from "./lib/common.mjs"

const args = process.argv.slice(2)
let dir
const i = args.indexOf("--dir")
if (i !== -1) {
  dir = args[i + 1]
  args.splice(i, 2)
}
const page = findPageDir(dir)
ensureInstalled(page)
const r = run(process.execPath, [viteBin(page), ...args], { cwd: page })
process.exit(r.status ?? 0)
