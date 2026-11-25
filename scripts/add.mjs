#!/usr/bin/env node
// Add shadcn/ui components (react route) to a page, with the components and
// packages they depend on. Existing files are kept unless --overwrite.
// Usage: node scripts/add.mjs [--dir <page>] <component...> | --list

import fs from "node:fs"
import path from "node:path"
import { parseArgs } from "node:util"
import { ASSETS, fail, findPageDir, install, readJson } from "./lib/common.mjs"
import { manifest, styleCss, syncDeps } from "./lib/kit.mjs"
import { writeIfChanged } from "./lib/common.mjs"

const { values: o, positionals } = parseArgs({
  allowPositionals: true,
  options: {
    dir: { type: "string" },
    list: { type: "boolean", default: false },
    overwrite: { type: "boolean", default: false },
    "no-install": { type: "boolean", default: false },
    npm: { type: "boolean", default: false },
  },
})

const m = manifest()
if (o.list) {
  console.log(Object.keys(m.components).join(" "))
  process.exit(0)
}
if (!positionals.length) fail("usage: node scripts/add.mjs [--dir <page>] <component...>   (--list shows them)")
const dir = findPageDir(o.dir)
const kit = readJson(path.join(dir, "kit.json"))
if (kit.route !== "react") fail("add.mjs is for the react route. In the html route, use the UI kit's classes directly (see references/plain-html.md).")

const src = path.join(ASSETS, "react", "shadcn")
const want = { ui: new Set(), hooks: new Set(), lib: new Set() }
const npm = new Set()
function visit(kind, name) {
  const table = kind === "ui" ? m.components : m[kind]
  const item = table[name]
  if (!item) fail(`unknown ${kind === "ui" ? "component" : kind} "${name}". Run with --list to see the components.`)
  if (want[kind].has(name)) return
  want[kind].add(name)
  item.npm.forEach((p) => npm.add(p))
  item.ui.forEach((n) => visit("ui", n))
  item.hooks.forEach((n) => visit("hooks", n))
  item.lib.forEach((n) => visit("lib", n))
}
for (const name of positionals) visit("ui", name)

const added = []
const kept = []
function copy(from, to) {
  if (fs.existsSync(to) && !o.overwrite) return kept.push(path.relative(dir, to))
  fs.mkdirSync(path.dirname(to), { recursive: true })
  fs.copyFileSync(from, to)
  added.push(path.relative(dir, to))
}
for (const n of want.ui) copy(path.join(src, "ui", `${n}.tsx`), path.join(dir, "src", "components", "ui", `${n}.tsx`))
for (const n of want.hooks) copy(path.join(src, m.hooks[n].file), path.join(dir, "src", m.hooks[n].file))
for (const n of want.lib) copy(path.join(src, m.lib[n].file), path.join(dir, "src", m.lib[n].file))

writeIfChanged(path.join(dir, "src", "styles", "style.css"), styleCss(kit.style ?? "vega", dir))
const changed = syncDeps(dir, kit, [...npm])
if (added.length) console.log(`html-page: added ${added.join(", ")}`)
if (kept.length) console.log(`html-page: kept existing ${kept.join(", ")} (use --overwrite to replace)`)
if (changed && !o["no-install"]) install(dir, { npm: o.npm })
