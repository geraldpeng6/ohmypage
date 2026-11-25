#!/usr/bin/env node
// End-to-end tests. Runs on macOS, Linux and Windows (CI runs all three).
// Usage: node tests/run.mjs [--quick]   (--quick: fewer styles/icon libraries)
// Needs pnpm and network on the first run.

import assert from "node:assert/strict"
import crypto from "node:crypto"
import fs from "node:fs"
import os from "node:os"
import path from "node:path"
import { spawnSync } from "node:child_process"
import { fileURLToPath } from "node:url"

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..")
const quick = process.argv.includes("--quick")
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "ohmypage-test-"))
const home = path.join(tmp, "home")
const env = { ...process.env, OHMYPAGE_HOME: home, CLAUDE_CODE_SESSION_ID: "", CODEX_THREAD_ID: "", AI_AGENT: "test-agent" }

// An outer project whose config must not leak into pages created inside it.
const outer = path.join(tmp, "outer")
fs.mkdirSync(outer, { recursive: true })
fs.writeFileSync(path.join(outer, "package.json"), JSON.stringify({ name: "outer", private: true }))
fs.writeFileSync(path.join(outer, "pnpm-workspace.yaml"), "packages:\n  - '*'\n")
fs.writeFileSync(path.join(outer, "postcss.config.js"), 'throw new Error("outer postcss config was loaded")\n')
fs.writeFileSync(path.join(outer, ".browserslistrc"), "ie 6\n")

let passed = 0
function step(name, fn) {
  process.stdout.write(`- ${name} ... `)
  const t = Date.now()
  fn()
  passed++
  console.log(`ok (${((Date.now() - t) / 1000).toFixed(1)}s)`)
}

function sh(script, args, extraEnv = {}) {
  const r = spawnSync(process.execPath, [path.join(ROOT, "scripts", script), ...args], {
    cwd: outer,
    env: { ...env, ...extraEnv },
    encoding: "utf8",
  })
  if (r.status !== 0) {
    console.log(`\n$ ${script} ${args.join(" ")}\n${r.stdout}\n${r.stderr}`)
    throw new Error(`${script} exited ${r.status}`)
  }
  return r.stdout + r.stderr
}

const sha = (f) => crypto.createHash("sha256").update(fs.readFileSync(f)).digest("hex").slice(0, 12)
const history = () =>
  fs.existsSync(path.join(home, "history.jsonl"))
    ? fs.readFileSync(path.join(home, "history.jsonl"), "utf8").split("\n").filter(Boolean).map((l) => JSON.parse(l))
    : []
function assertSingleFile(file) {
  const t = fs.readFileSync(file, "utf8")
  assert.ok(t.length > 1000, "output too small")
  assert.doesNotMatch(t, /<script\b[^>]*\bsrc="(?!data:)/i, "external script left in output")
  assert.doesNotMatch(t, /<link\b[^>]*rel="stylesheet"[^>]*href="(?!data:)/i, "external stylesheet left in output")
}

const STYLES = quick ? ["vega", "mira"] : ["vega", "nova", "maia", "lyra", "mira", "luma", "sera", "rhea"]
const ICONS = quick ? ["lucide", "phosphor"] : ["lucide", "tabler", "phosphor", "hugeicons", "remixicon"]
const react = path.join(outer, "react-page")

step("new react page (inside an outer pnpm workspace)", () => {
  sh("new.mjs", ["react-page", "--kind", "report"])
  assert.ok(fs.existsSync(path.join(react, "node_modules", "vite")))
  assert.ok(!fs.existsSync(path.join(outer, "node_modules")), "installed into the outer workspace")
  assert.ok(!fs.existsSync(path.join(outer, "pnpm-lock.yaml")), "wrote the outer lockfile")
})

step("add every component", () => {
  const list = sh("add.mjs", ["--list"]).trim().split(/\s+/)
  assert.ok(list.length > 50)
  sh("add.mjs", ["--dir", react, ...list])
  // Import every component so the build compiles all of them.
  const names = list.map((n) => n.replace(/-(\w)/g, (_, c) => c.toUpperCase()))
  const app = [
    ...list.map((n, i) => `import * as C${i} from "@/components/ui/${n}"`),
    `const all = [${list.map((_, i) => `C${i}`).join(", ")}]`,
    `export default function App() {`,
    `  return <main className="p-6"><h1 className="text-right text-2xl">All components</h1><p>{all.length} modules: ${names.length}</p></main>`,
    `}`,
  ].join("\n")
  fs.writeFileSync(path.join(react, "src", "App.tsx"), app + "\n")
})

for (const style of STYLES) {
  step(`build with style ${style}`, () => {
    const kit = JSON.parse(fs.readFileSync(path.join(react, "kit.json"), "utf8"))
    kit.style = style
    fs.writeFileSync(path.join(react, "kit.json"), JSON.stringify(kit, null, 2))
    sh("apply.mjs", ["--dir", react])
    sh("build.mjs", ["--dir", react, "--no-log"])
    assertSingleFile(`${react}.html`)
    assert.match(fs.readFileSync(path.join(react, "index.html"), "utf8"), new RegExp(`class="style-${style}"`))
  })
}

for (const icons of ICONS) {
  step(`build with icons ${icons}`, () => {
    const kit = JSON.parse(fs.readFileSync(path.join(react, "kit.json"), "utf8"))
    kit.icons = icons
    fs.writeFileSync(path.join(react, "kit.json"), JSON.stringify(kit, null, 2))
    sh("apply.mjs", ["--dir", react])
    sh("build.mjs", ["--dir", react, "--no-log"])
    assertSingleFile(`${react}.html`)
  })
}

step("themes: base + accent, and a user theme by name", () => {
  const kit = JSON.parse(fs.readFileSync(path.join(react, "kit.json"), "utf8"))
  Object.assign(kit, { style: "vega", icons: "lucide", theme: "stone", accent: "emerald" })
  fs.writeFileSync(path.join(react, "kit.json"), JSON.stringify(kit, null, 2))
  sh("apply.mjs", ["--dir", react])
  const css = fs.readFileSync(path.join(react, "src", "styles", "theme.css"), "utf8")
  assert.match(css, /accent "emerald"/)
  fs.mkdirSync(path.join(home, "themes"), { recursive: true })
  fs.writeFileSync(path.join(home, "themes", "mine.css"), ":root { --primary: #ff0000; }\n.dark { --primary: #00ff00; }\n")
  kit.theme = "mine"
  kit.accent = null
  fs.writeFileSync(path.join(react, "kit.json"), JSON.stringify(kit, null, 2))
  sh("apply.mjs", ["--dir", react])
  assert.match(fs.readFileSync(path.join(react, "src", "styles", "theme.css"), "utf8"), /#ff0000/)
})

step("deterministic build", () => {
  sh("build.mjs", ["--dir", react, "--no-log"])
  const a = sha(`${react}.html`)
  fs.rmSync(path.join(react, ".ohmypage"), { recursive: true, force: true })
  sh("build.mjs", ["--dir", react, "--no-log"])
  assert.equal(sha(`${react}.html`), a)
})

step("history: revisions, same-session replace, unchanged skip, label, note limit", () => {
  const app = path.join(react, "src", "App.tsx")
  const touch = (s) => fs.appendFileSync(app, `\n// ${s}\n`)
  sh("build.mjs", ["--dir", react, "--session", "s1", "--note", "first"])
  let h = history()
  assert.equal(h.length, 1)
  assert.equal(h[0].rev, 1)
  assert.match(h[0].ts, /^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\dZ$/)
  assert.ok(path.isAbsolute(h[0].path))
  assert.equal(h[0].agent, "test-agent")
  assert.equal(h[0].recipe.route, "react")

  sh("build.mjs", ["--dir", react, "--session", "s1"])
  assert.equal(history().length, 1, "unchanged build was logged")

  touch("a")
  sh("build.mjs", ["--dir", react, "--session", "s1"])
  h = history()
  assert.equal(h.length, 1, "same session should replace the last line")
  assert.equal(h[0].note, "first", "note carried over within a version")

  touch("b")
  sh("build.mjs", ["--dir", react, "--session", "s2", "--label", "0.2", "--note", "x".repeat(300)])
  h = history()
  assert.equal(h.length, 2)
  assert.equal(h[1].rev, 2)
  assert.equal(h[1].label, "0.2")
  assert.equal(Array.from(h[1].note).length, 120)

  touch("c")
  sh("build.mjs", ["--dir", react, "--session", "s3"], { OHMYPAGE_HISTORY: "off" })
  assert.equal(history().length, 2, "OHMYPAGE_HISTORY=off still logged")
})

for (const ui of ["basecoat", "daisyui", "none"]) {
  step(`html route with ui ${ui}`, () => {
    const name = `html-${ui}`
    sh("new.mjs", [name, "--route", "html", "--ui", ui, "--style", "nova"])
    const index = path.join(outer, name, "index.html")
    const body =
      ui === "daisyui"
        ? '<button class="btn btn-primary">Go</button>'
        : ui === "basecoat"
          ? '<button class="btn">Go</button><div class="card"><header><h2>Card</h2></header></div>'
          : '<button class="bg-primary text-primary-foreground rounded-md px-3 py-1">Go</button>'
    fs.writeFileSync(index, fs.readFileSync(index, "utf8").replace("</main>", `${body}</main>`))
    sh("build.mjs", ["--dir", path.join(outer, name), "--no-log"])
    assertSingleFile(path.join(outer, `${name}.html`))
  })
}

step("outer workspace untouched", () => {
  assert.ok(!fs.existsSync(path.join(outer, "node_modules")))
  assert.ok(!fs.existsSync(path.join(outer, "pnpm-lock.yaml")))
})

console.log(`\n${passed} checks passed. Temp folder: ${tmp}`)
if (!process.env.KEEP_TMP) fs.rmSync(tmp, { recursive: true, force: true })
