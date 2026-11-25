#!/usr/bin/env node
// Maintainer tool: copy shadcn/ui's radix base components, the 8 style sheets,
// the base Tailwind layer and the theme tokens into assets/react/shadcn.
//
// Usage: node tools/vendor-shadcn.mjs <path-to-shadcn-ui-checkout>
//
// The checkout needs apps/v4/registry and packages/shadcn/src (a sparse clone is fine):
//   git clone --depth 1 --filter=blob:none --sparse https://github.com/shadcn-ui/ui.git
//   git -C ui sparse-checkout set apps/v4/registry packages/shadcn/src
//
// Users never run this; the output is committed.

import fs from "node:fs"
import path from "node:path"
import { execFileSync } from "node:child_process"
import { fileURLToPath } from "node:url"

const repo = process.argv[2]
if (!repo) {
  console.error("usage: node tools/vendor-shadcn.mjs <shadcn-ui checkout>")
  process.exit(1)
}

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..")
const reg = path.join(repo, "apps/v4/registry")
const base = path.join(reg, "bases/radix")
const out = path.join(root, "assets/react/shadcn")

const commit = execFileSync("git", ["-C", repo, "rev-parse", "HEAD"], { encoding: "utf8" }).trim()

fs.rmSync(out, { recursive: true, force: true })
for (const d of ["ui", "hooks", "styles", "icons"]) fs.mkdirSync(path.join(out, d), { recursive: true })

// Libraries the page template already depends on.
const BASELINE = new Set(["react", "react-dom", "cn", "class-variance-authority", "radix-ui"])
// Components that depend on infrastructure we do not ship.
const SKIP = new Set([])

const ICON_LIBS = ["lucide", "tabler", "hugeicons", "phosphor", "remixicon"]
const iconNames = Object.fromEntries(ICON_LIBS.map((l) => [l, new Set()]))

function rewrite(src) {
  return src
    .replace(/from "@\/registry\/bases\/radix\/ui\/([\w-]+)"/g, 'from "@/components/ui/$1"')
    .replace(/from "@\/registry\/bases\/radix\/hooks\/([\w-]+)"/g, 'from "@/hooks/$1"')
    .replace(/from "@\/registry\/bases\/radix\/lib\/([\w-]+)"/g, 'from "@/lib/$1"')
    .replace(/from "@\/app\/\(create\)\/components\/icon-placeholder"/g, 'from "@/components/ui/icon-placeholder"')
    .replace(/from "next-themes"/g, 'from "@/lib/color-scheme"')
}

function scanIcons(src) {
  for (const m of src.matchAll(/<IconPlaceholder([\s\S]*?)\/>/g)) {
    for (const lib of ICON_LIBS) {
      const a = m[1].match(new RegExp(`\\b${lib}="([^"]+)"`))
      if (a) iconNames[lib].add(a[1])
    }
  }
}

function imports(src) {
  const ui = new Set()
  const hooks = new Set()
  const lib = new Set()
  const npm = new Set()
  for (const m of src.matchAll(/(?:import|export)[\s\S]*?from "([^"]+)"/g)) {
    const spec = m[1]
    if (spec.startsWith("@/components/ui/")) ui.add(spec.slice(16))
    else if (spec.startsWith("@/hooks/")) hooks.add(spec.slice(8))
    else if (spec.startsWith("@/lib/")) lib.add(spec.slice(6))
    else if (!spec.startsWith(".") && !spec.startsWith("@/")) {
      const pkg = spec.startsWith("@") ? spec.split("/").slice(0, 2).join("/") : spec.split("/")[0]
      if (!BASELINE.has(pkg)) npm.add(pkg)
    }
  }
  ui.delete("icon-placeholder")
  lib.delete("color-scheme")
  lib.delete("utils")
  return { ui: [...ui].sort(), hooks: [...hooks].sort(), lib: [...lib].sort(), npm: [...npm].sort() }
}

const manifest = { source: "https://github.com/shadcn-ui/ui", commit, components: {}, hooks: {}, lib: {} }

for (const f of fs.readdirSync(path.join(base, "ui")).sort()) {
  if (!f.endsWith(".tsx") || f.startsWith("_")) continue
  const name = f.replace(/\.tsx$/, "")
  if (SKIP.has(name)) continue
  const src = rewrite(fs.readFileSync(path.join(base, "ui", f), "utf8"))
  scanIcons(src)
  fs.writeFileSync(path.join(out, "ui", f), src)
  manifest.components[name] = imports(src)
}

for (const [dir, key] of [["hooks", "hooks"], ["lib", "lib"]]) {
  for (const f of fs.readdirSync(path.join(base, dir)).sort()) {
    if (f.startsWith("_") || f === "utils.ts") continue
    const name = f.replace(/\.tsx?$/, "")
    const src = rewrite(fs.readFileSync(path.join(base, dir, f), "utf8"))
    const target = dir === "hooks" ? path.join(out, "hooks", f) : path.join(out, "ui", "..", "lib", f)
    fs.mkdirSync(path.dirname(target), { recursive: true })
    fs.writeFileSync(target, src)
    manifest[key][name] = { file: `${dir}/${f}`, ...imports(src) }
  }
}

// Styles: one sheet per style. Each is `.style-<name> { ... }`, so the page
// puts `style-<name>` on <html>.
for (const f of fs.readdirSync(path.join(reg, "styles")).sort()) {
  if (!f.endsWith(".css")) continue
  fs.copyFileSync(path.join(reg, "styles", f), path.join(out, "styles", f.replace(/^style-/, "")))
}
fs.copyFileSync(path.join(repo, "packages/shadcn/src/tailwind.css"), path.join(out, "base.css"))

// Icon placeholders: one module per library, importing only the icons the
// components use, so the bundle stays small and switching libraries is one file.
const ICON_MODULE = {
  lucide: (names) => `import { ${names.join(", ")} } from "lucide-react"\n\nconst icons = { ${names.join(", ")} }\n`,
  tabler: (names) => `import { ${names.join(", ")} } from "@tabler/icons-react"\n\nconst icons = { ${names.join(", ")} }\n`,
  phosphor: (names) => `import { ${names.join(", ")} } from "@phosphor-icons/react"\n\nconst icons = { ${names.join(", ")} }\n`,
  remixicon: (names) => `import { ${names.join(", ")} } from "@remixicon/react"\n\nconst icons = { ${names.join(", ")} }\n`,
  hugeicons: (names) =>
    `import { HugeiconsIcon } from "@hugeicons/react"\nimport { ${names.join(", ")} } from "@hugeicons/core-free-icons"\n\nconst data = { ${names.join(", ")} }\n`,
}
const ICON_DEPS = {
  lucide: ["lucide-react"],
  tabler: ["@tabler/icons-react"],
  phosphor: ["@phosphor-icons/react"],
  remixicon: ["@remixicon/react"],
  hugeicons: ["@hugeicons/react", "@hugeicons/core-free-icons"],
}
for (const lib of ICON_LIBS) {
  const names = [...iconNames[lib]].sort()
  const head = `// Generated by tools/vendor-shadcn.mjs. Icons used inside the shadcn components,\n// rendered with ${lib}. Page code imports icons from the library directly.\nimport * as React from "react"\n`
  const body =
    lib === "hugeicons"
      ? `\nexport function IconPlaceholder({ hugeicons, lucide, tabler, phosphor, remixicon, strokeWidth = 2, ...props }: { hugeicons?: string; lucide?: string; tabler?: string; phosphor?: string; remixicon?: string } & Omit<React.ComponentProps<"svg">, "ref">) {\n  const icon = hugeicons ? data[hugeicons as keyof typeof data] : undefined\n  if (!icon) return null\n  return <HugeiconsIcon icon={icon} strokeWidth={Number(strokeWidth)} {...(props as any)} />\n}\n`
      : `\nexport function IconPlaceholder({ lucide, tabler, hugeicons, phosphor, remixicon, ...props }: { lucide?: string; tabler?: string; hugeicons?: string; phosphor?: string; remixicon?: string } & React.ComponentProps<"svg">) {\n  const name = ${lib}\n  const Icon = name ? (icons as Record<string, React.ComponentType<any>>)[name] : undefined\n  if (!Icon) return null\n  return <Icon {...props} />\n}\n`
  fs.writeFileSync(path.join(out, "icons", `${lib}.tsx`), head + ICON_MODULE[lib](names) + body)
}
manifest.iconDeps = ICON_DEPS

// Themes: base colors (full palettes) and accent colors (overrides on top).
const themesSrc = fs.readFileSync(path.join(reg, "themes.ts"), "utf8")
const themesJs = themesSrc
  .replace(/^import .*$/gm, "")
  .replace(/export const THEMES: RegistryItem\[\] =/, "return")
  .replace(/\] as const satisfies RegistryItem\[\]/, "]")
  .replace(/\bsatisfies [A-Za-z\[\]]+/g, "")
  .replace(/^export type .*$/gm, "")
const THEMES = new Function(themesJs)()
const BASE = ["neutral", "stone", "zinc", "mauve", "olive", "mist", "taupe"]
const themes = { base: {}, accent: {} }
for (const t of THEMES) {
  const kind = BASE.includes(t.name) ? "base" : "accent"
  themes[kind][t.name] = t.cssVars
}
fs.writeFileSync(path.join(out, "themes.json"), JSON.stringify(themes, null, 2) + "\n")

fs.writeFileSync(path.join(out, "manifest.json"), JSON.stringify(manifest, null, 2) + "\n")
console.log(`vendored shadcn ${commit.slice(0, 12)}: ${Object.keys(manifest.components).length} components`)
