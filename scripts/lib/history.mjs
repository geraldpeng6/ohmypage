// The history log: one JSON object per line, one line per page version.
// Format and rules: references/history-log.md.

import fs from "node:fs"
import path from "node:path"
import { spawnSync } from "node:child_process"
import { dataDir } from "./common.mjs"

const TWO_HOURS = 2 * 60 * 60 * 1000
const NOTE_MAX = 120

export function historyFile() {
  return path.join(dataDir(), "history.jsonl")
}

export function historyDisabled() {
  return /^(off|0|false|no)$/i.test(process.env.HTML_PAGE_HISTORY ?? "")
}

export function detectAgent() {
  const e = process.env
  if (e.AI_AGENT) return e.AI_AGENT
  if (e.CLAUDECODE) return "claude-code"
  if (e.CODEX_THREAD_ID || e.CODEX_SANDBOX || e.CODEX_MANAGED_BY_NPM) return "codex"
  if (e.GEMINI_CLI) return "gemini-cli"
  return undefined
}

export function detectSession() {
  const e = process.env
  return e.CLAUDE_CODE_SESSION_ID || e.CODEX_THREAD_ID || e.CODEX_SESSION_ID || undefined
}

function gitRef(dir) {
  const git = (args) => spawnSync("git", ["-C", dir, ...args], { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] })
  const sha = git(["rev-parse", "--short", "HEAD"])
  if (sha.status !== 0) return undefined
  const branch = git(["rev-parse", "--abbrev-ref", "HEAD"])
  return `${branch.stdout.trim()}@${sha.stdout.trim()}`
}

const samePath = (a, b) => (process.platform === "win32" || process.platform === "darwin" ? a.toLowerCase() === b.toLowerCase() : a === b)

function withLock(dir, fn) {
  const lock = path.join(dir, "history.lock")
  const deadline = Date.now() + 3000
  let fd
  for (;;) {
    try {
      fd = fs.openSync(lock, "wx")
      break
    } catch (e) {
      if (e.code !== "EEXIST") throw e
      try {
        if (Date.now() - fs.statSync(lock).mtimeMs > 30_000) fs.rmSync(lock, { force: true })
      } catch {}
      if (Date.now() > deadline) return fn() // give up on the lock rather than lose the entry
      const until = Date.now() + 50
      while (Date.now() < until) {}
    }
  }
  try {
    return fn()
  } finally {
    fs.closeSync(fd)
    fs.rmSync(lock, { force: true })
  }
}

function readLines(file) {
  if (!fs.existsSync(file)) return []
  return fs
    .readFileSync(file, "utf8")
    .split("\n")
    .filter(Boolean)
    .map((l) => {
      try {
        return JSON.parse(l)
      } catch {
        return null
      }
    })
}

// entry: { path, src?, sha, kind?, recipe?, note?, label?, agent?, session? }
// Returns { written: bool, rev, reason? }.
export function record(entry) {
  if (historyDisabled()) return { written: false, reason: "disabled" }
  const dir = dataDir()
  fs.mkdirSync(dir, { recursive: true })
  const file = historyFile()
  const now = new Date()
  const e = {
    ts: now.toISOString().replace(/\.\d{3}Z$/, "Z"),
    path: entry.path,
    src: entry.src,
    rev: 0,
    label: entry.label || undefined,
    sha: entry.sha,
    kind: entry.kind || undefined,
    recipe: entry.recipe,
    note: entry.note ? Array.from(entry.note).slice(0, NOTE_MAX).join("") : undefined,
    agent: entry.agent ?? detectAgent(),
    session: entry.session ?? detectSession(),
    cwd: process.cwd(),
    git: gitRef(entry.src ?? path.dirname(entry.path)),
  }

  return withLock(dir, () => {
    const lines = readLines(file)
    const mine = lines.filter((l) => l && typeof l.path === "string" && samePath(l.path, e.path))
    const last = mine.at(-1)
    if (last && last.sha === e.sha && !e.label && !e.note) return { written: false, rev: last.rev, reason: "unchanged" }

    const sameVersion =
      last &&
      (e.session ? last.session === e.session : !last.session && now - new Date(last.ts) < TWO_HOURS)
    e.rev = sameVersion ? last.rev : Math.max(0, ...mine.map((l) => l.rev || 0)) + 1
    if (sameVersion) {
      e.label ??= last.label
      e.kind ??= last.kind
      e.note ??= last.note
    }
    const line = JSON.stringify(e) + "\n"

    // Same page, same version, and it is the last line: replace it, so iterating
    // never floods the log. Otherwise append.
    const tail = lines.at(-1)
    if (sameVersion && tail && samePath(tail.path ?? "", e.path) && tail.rev === e.rev) {
      const text = fs.readFileSync(file, "utf8")
      const cut = text.lastIndexOf("\n", text.length - 2) + 1
      fs.writeFileSync(file, text.slice(0, cut) + line)
    } else {
      const text = fs.existsSync(file) ? fs.readFileSync(file, "utf8") : ""
      fs.appendFileSync(file, (text && !text.endsWith("\n") ? "\n" : "") + line)
    }
    return { written: true, rev: e.rev }
  })
}
