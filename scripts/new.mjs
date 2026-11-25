#!/usr/bin/env node
// Create a page folder from a template.
// Usage: node scripts/new.mjs <folder> [--route react|html] [--style vega] [--theme neutral]
//        [--accent blue] [--icons lucide] [--ui basecoat|daisyui|none] [--color-scheme system]
//        [--title "Page title"] [--kind report] [--no-install] [--npm]

import fs from "node:fs"
import path from "node:path"
import { parseArgs } from "node:util"
import { ASSETS, fail, install, writeJson } from "./lib/common.mjs"
import { applyKit, defaultKit, validateKit } from "./lib/kit.mjs"

const { values: o, positionals } = parseArgs({
  allowPositionals: true,
  options: {
    route: { type: "string", default: "react" },
    style: { type: "string" },
    theme: { type: "string" },
    accent: { type: "string" },
    icons: { type: "string" },
    ui: { type: "string" },
    "color-scheme": { type: "string" },
    title: { type: "string" },
    kind: { type: "string" },
    "no-install": { type: "boolean", default: false },
    npm: { type: "boolean", default: false },
  },
})

if (positionals.length !== 1) fail("usage: node scripts/new.mjs <folder> [options]. See SKILL.md.")
const dir = path.resolve(positionals[0])
if (fs.existsSync(dir) && fs.readdirSync(dir).length) fail(`${dir} exists and is not empty. Pick another name, or work on it with apply/add/build.`)

const kit = defaultKit(o.route)
for (const [k, v] of Object.entries({ style: o.style, theme: o.theme, accent: o.accent, icons: o.icons, ui: o.ui, colorScheme: o["color-scheme"], kind: o.kind })) {
  if (v !== undefined) kit[k] = v
}
if (kit.route === "html") delete kit.icons
validateKit(kit)

const name = path.basename(dir)
const title = o.title ?? name.replace(/[-_]+/g, " ").replace(/^\w/, (c) => c.toUpperCase())
const template = path.join(ASSETS, kit.route, "template")
fs.mkdirSync(dir, { recursive: true })
fs.cpSync(template, dir, { recursive: true })
for (const f of ["index.html", "src/App.tsx"]) {
  const file = path.join(dir, f)
  if (fs.existsSync(file)) {
    const esc = title.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    fs.writeFileSync(file, fs.readFileSync(file, "utf8").replaceAll("%PAGE_TITLE%", esc))
  }
}
const pkgName = name.toLowerCase().replace(/[^a-z0-9-_.]+/g, "-").replace(/^[-_.]+/, "") || "page"
writeJson(path.join(dir, "package.json"), { name: pkgName, private: true, type: "module", dependencies: {}, devDependencies: {} })
writeJson(path.join(dir, "kit.json"), kit)

const { themeSource } = applyKit(dir)
console.log(`ohmypage: created ${dir} (route ${kit.route}, style ${kit.style}, theme ${themeSource}${kit.icons ? `, icons ${kit.icons}` : ""})`)
if (!o["no-install"]) {
  const pm = install(dir, { npm: o.npm })
  console.log(`ohmypage: dependencies installed with ${pm}`)
}
console.log(`ohmypage: next: edit ${kit.route === "react" ? "src/App.tsx" : "index.html"}, then node <skill>/scripts/build.mjs --dir ${dir}`)
