// Shared helpers for the html-page scripts. Node 20.19+, no dependencies.

import fs from "node:fs"
import os from "node:os"
import path from "node:path"
import { spawnSync } from "node:child_process"
import { fileURLToPath } from "node:url"

export const SKILL_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..")
export const ASSETS = path.join(SKILL_ROOT, "assets")
const isWin = process.platform === "win32"

export function fail(message, code = 1) {
  console.error(`html-page: ${message}`)
  process.exit(code)
}

export function readJson(file) {
  return JSON.parse(fs.readFileSync(file, "utf8"))
}

export function writeJson(file, data) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2) + "\n")
}

export function writeIfChanged(file, content) {
  if (fs.existsSync(file) && fs.readFileSync(file, "utf8") === content) return false
  fs.mkdirSync(path.dirname(file), { recursive: true })
  fs.writeFileSync(file, content)
  return true
}

export const versions = () => readJson(path.join(ASSETS, "versions.json"))

// The page folder: --dir, else the current folder, else the nearest parent with kit.json.
export function findPageDir(dir) {
  let d = path.resolve(dir ?? process.cwd())
  if (dir) {
    if (!fs.existsSync(path.join(d, "kit.json"))) fail(`no kit.json in ${d}. Create a page with scripts/new.mjs first.`)
    return d
  }
  for (;;) {
    if (fs.existsSync(path.join(d, "kit.json"))) return d
    const up = path.dirname(d)
    if (up === d) fail("no page here. Pass --dir <page folder> or run scripts/new.mjs first.")
    d = up
  }
}

// Where the history log lives. Same folder for every agent on the machine.
export function dataDir() {
  if (process.env.HTML_PAGE_HOME) return path.resolve(process.env.HTML_PAGE_HOME)
  if (isWin) return path.join(process.env.LOCALAPPDATA || path.join(os.homedir(), "AppData", "Local"), "html-page")
  const xdg = process.env.XDG_DATA_HOME
  return path.join(xdg && path.isAbsolute(xdg) ? xdg : path.join(os.homedir(), ".local", "share"), "html-page")
}

export function run(cmd, args, opts = {}) {
  const r = spawnSync(cmd, args, { stdio: "inherit", shell: isWin && !path.isAbsolute(cmd), ...opts })
  if (r.error) return { status: 1, error: r.error }
  return r
}

function has(cmd) {
  const r = spawnSync(cmd, ["--version"], { stdio: "ignore", shell: isWin })
  return r.status === 0
}

// Install a page's dependencies. Each page has its own node_modules; with pnpm the
// files are hard links into pnpm's global store, so a page costs almost no disk.
// --no-frozen-lockfile: pnpm freezes the lockfile when CI=true (some agent sandboxes
// set it), which would break add/apply after they change package.json.
export function install(pageDir, { npm = false } = {}) {
  const wantNpm = npm || process.env.HTML_PAGE_PM === "npm"
  if (!wantNpm && has("pnpm")) {
    const r = run("pnpm", ["install", "--ignore-workspace", "--prefer-offline", "--no-frozen-lockfile", "--config.confirmModulesPurge=false"], { cwd: pageDir })
    if (r.status !== 0) fail("pnpm install failed (see above). If this is the first install, check the network connection.")
    return "pnpm"
  }
  if (!wantNpm) {
    fail(
      "pnpm is not installed. Ask the user to install it (`npm install -g pnpm`, or see https://pnpm.io/installation), " +
        "or rerun with --npm to use npm instead (npm copies every package into the page folder, about 150 MB per page).",
      3,
    )
  }
  const r = run("npm", ["install", "--ignore-scripts", "--prefer-offline", "--no-audit", "--no-fund"], { cwd: pageDir })
  if (r.status !== 0) fail("npm install failed (see above).")
  return "npm"
}

export function viteBin(pageDir) {
  const bin = path.join(pageDir, "node_modules", "vite", "bin", "vite.js")
  return fs.existsSync(bin) ? bin : null
}

export function ensureInstalled(pageDir, opts) {
  if (!viteBin(pageDir)) install(pageDir, opts)
  if (!viteBin(pageDir)) fail("vite is missing after install.")
}
