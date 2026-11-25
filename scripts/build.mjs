#!/usr/bin/env node
// Build a page into one self-contained HTML file and record it in the history log.
// Usage: node scripts/build.mjs [--dir <page>] [--out <file.html>] [--note "why/what"] [--kind report]
//        [--label "0.2"] [--agent name] [--session id] [--no-log] [--npm]
// Default output: <page folder>.html next to the page folder.

import crypto from "node:crypto"
import fs from "node:fs"
import path from "node:path"
import { parseArgs } from "node:util"
import { ensureInstalled, fail, findPageDir, readJson, run, viteBin } from "./lib/common.mjs"
import { BASE_DEPS, manifest } from "./lib/kit.mjs"
import { historyFile, record } from "./lib/history.mjs"

const { values: o } = parseArgs({
  options: {
    dir: { type: "string" },
    out: { type: "string" },
    note: { type: "string" },
    kind: { type: "string" },
    label: { type: "string" },
    agent: { type: "string" },
    session: { type: "string" },
    "no-log": { type: "boolean", default: false },
    npm: { type: "boolean", default: false },
  },
})

const dir = findPageDir(o.dir)
const kit = readJson(path.join(dir, "kit.json"))
ensureInstalled(dir, { npm: o.npm })

const r = run(process.execPath, [viteBin(dir), "build", "--logLevel", "warn"], { cwd: dir })
if (r.status !== 0) fail("build failed (see above).")

const built = path.join(dir, ".html-page", "dist", "index.html")
if (!fs.existsSync(built)) fail("build produced no index.html.")
const html = fs.readFileSync(built)
const text = html.toString("utf8")
const external = [...text.matchAll(/<(?:script|link|img)\b[^>]*\b(?:src|href)="(?!data:|https?:|#|mailto:)([^"]+)"/gi)].map((m) => m[1])
if (external.length) console.warn(`html-page: warning: the page still references local files that are not inlined: ${external.join(", ")}`)
const remote = [...text.matchAll(/<(?:script|link)\b[^>]*\b(?:src|href)="(https?:[^"]+)"/gi)].map((m) => m[1])
if (remote.length) console.warn(`html-page: warning: the page loads from the network, so it will not work offline: ${remote.join(", ")}`)

const out = path.resolve(o.out ?? `${dir}.html`)
fs.mkdirSync(path.dirname(out), { recursive: true })
fs.writeFileSync(out, html)
const sha = crypto.createHash("sha256").update(html).digest("hex").slice(0, 12)
const kb = (html.length / 1024).toFixed(0)
console.log(`html-page: built ${out} (${kb} KB, sha ${sha})`)

if (o["no-log"]) process.exit(0)

// Recipe: the design choices, plus packages added on top of the template.
const pkg = readJson(path.join(dir, "package.json"))
const known = new Set([...BASE_DEPS[kit.route].dependencies, ...BASE_DEPS[kit.route].devDependencies, "basecoat-css", "daisyui"])
if (kit.route === "react") Object.values(manifest().iconDeps).flat().forEach((d) => known.add(d))
const libs = Object.keys({ ...pkg.dependencies, ...pkg.devDependencies }).filter((d) => !known.has(d))
const recipe = Object.fromEntries(
  Object.entries({
    route: kit.route,
    ui: kit.ui,
    style: kit.ui === "daisyui" ? undefined : kit.style,
    theme: kit.ui === "daisyui" ? (kit.daisyThemes ?? ["light", "dark"]).join("/") : kit.theme,
    accent: kit.accent ?? undefined,
    icons: kit.icons,
    libs: libs.length ? libs : undefined,
  }).filter(([, v]) => v !== undefined && v !== null),
)

const res = record({ path: out, src: dir, sha, kind: o.kind ?? kit.kind, recipe, note: o.note, label: o.label, agent: o.agent, session: o.session })
if (res.written) console.log(`html-page: logged rev ${res.rev} in ${historyFile()}`)
else if (res.reason === "unchanged") console.log(`html-page: unchanged since rev ${res.rev}, not logged`)
if (res.written && !o.note && !(o.kind ?? kit.kind)) console.log(`html-page: tip: pass --note "what this page is and why" (and --kind) so it can be found later`)
