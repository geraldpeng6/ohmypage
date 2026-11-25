#!/usr/bin/env node
// Maintainer tool: write assets/versions.json with the exact version of every
// package the skill may install. Pages get exact pins so builds are reproducible.
// Usage: node tools/pin-versions.mjs

import fs from "node:fs"
import path from "node:path"
import { execFileSync } from "node:child_process"
import { fileURLToPath } from "node:url"

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..")
const manifest = JSON.parse(fs.readFileSync(path.join(root, "assets/react/shadcn/manifest.json"), "utf8"))

const pkgs = new Set([
  // build
  "vite", "@vitejs/plugin-react", "vite-plugin-singlefile", "tailwindcss", "@tailwindcss/vite",
  "@tailwindcss/typography", "tw-animate-css",
  // react route
  "react", "react-dom", "@types/react", "@types/react-dom", "cn", "class-variance-authority", "radix-ui",
  // html route
  "basecoat-css", "daisyui",
])
for (const c of Object.values(manifest.components)) c.npm.forEach((p) => pkgs.add(p))
for (const c of Object.values(manifest.hooks)) c.npm.forEach((p) => pkgs.add(p))
for (const c of Object.values(manifest.lib)) c.npm.forEach((p) => pkgs.add(p))
for (const deps of Object.values(manifest.iconDeps)) deps.forEach((p) => pkgs.add(p))

const npm = process.platform === "win32" ? "npm.cmd" : "npm"
const versions = {}
for (const p of [...pkgs].sort()) {
  versions[p] = execFileSync(npm, ["view", p, "version"], { encoding: "utf8", shell: process.platform === "win32" }).trim()
  console.log(p, versions[p])
}
fs.writeFileSync(path.join(root, "assets/versions.json"), JSON.stringify(versions, null, 2) + "\n")
