# Plain HTML route: CSS kits and light interactivity

Component CSS for route "html" (plain HTML + Tailwind v4, bundled into one file) and ways to add small interactivity without React.
Use the first-listed default (Basecoat, then native HTML and a small module script) unless the use case says otherwise. Use daisyUI only when the user wants its themes or already uses it.

### Basecoat (default)
- **What:** The shadcn/ui design system as Tailwind v4 CSS plus small vanilla JS, with no React or Radix. It uses the same CSS variables as shadcn (`--primary`, `--chart-1`, `--radius` …), so shadcn and tweakcn themes paste in directly. It ships all 8 shadcn styles as bundles (`basecoat-css/vega`, `nova`, `maia`, `lyra`, `mira`, `luma`, `sera`, `rhea`; the default import is Vega). It also includes newer pieces such as `message`, `bubble`, `trace`, `code-block`, `chart` and `typeset`.
- **Use when:** Any html-route page. It matches the react route's look.
- **Avoid when:** The user explicitly wants daisyUI themes, or the page needs heavy app state. Switch to the react route.
- **Route:** html
- **License:** MIT · **Install:** `pnpm add basecoat-css` (1.3.0) · **Verified:** 2026-11-25 · https://basecoatui.com
- **Notes:** Variants are attributes in 1.x (`data-variant`, `data-size`). `basecoat-css/compat` keeps older class names. JS: `import "basecoat-css/all"` auto-initializes every component except Chart (see `data.md`). The docs show CDN tags, but import from npm so everything bundles.

```css
@import "tailwindcss";
@import "basecoat-css/nova";      /* pick one of the 8 styles */
@import "basecoat-css/typeset";   /* optional: long-form text */
```
```html
<script type="module">import "basecoat-css/all"</script>
<div class="card"><header><h2>Revenue</h2><p>Last 30 days</p></header><section>…</section>
  <footer><button class="btn" data-variant="outline" data-size="sm">Export</button></footer></div>
```

### daisyUI v5
- **What:** A Tailwind v4 plugin with semantic component classes (`btn btn-primary`, `card card-body`, `stats`) and 35 built-in themes switched with `data-theme`.
- **Use when:** The user asks for daisyUI or one of its themes, or the folder already uses it.
- **Avoid when:** By default. It has **its own variable names** (`--color-base-100`, `--color-primary`, `--color-primary-content`, `--radius-box` …), not shadcn's, so shadcn, tweakcn and Basecoat themes don't apply. Don't mix it with Basecoat on one page.
- **Route:** html
- **License:** MIT · **Install:** `pnpm add -D daisyui` (5.8.2) · **Verified:** 2026-11-25 · https://daisyui.com

```css
@import "tailwindcss";
@plugin "daisyui" { themes: light --default, dark --prefersdark; }
```
```html
<div class="card bg-base-100 shadow-sm"><div class="card-body"><h2 class="card-title">Revenue</h2>
  <button class="btn btn-primary btn-sm">Export</button></div></div>
```

### Native HTML + a small module script (default for interactivity)
- **What:** Built-in platform features: `<details>/<summary>` (disclosure and accordion), `<dialog>` with `showModal()`, the `popover` attribute with `popovertarget`, `:has()`/`:target` CSS, and `<input type="search">` filtering with a few lines of JS.
- **Use when:** Tabs, accordions, modals, a filterable list, copy-to-clipboard, or a theme toggle. This covers most report and doc interactivity with zero dependencies.
- **Avoid when:** State is shared across many widgets. Use Alpine, or switch to the react route.
- **Route:** html
- **License:** n/a (web platform) · **Install:** none · **Verified:** 2026-11-25 · https://developer.mozilla.org/en-US/docs/Web/HTML/Element/dialog

```html
<button popovertarget="help" class="btn" data-variant="ghost">?</button>
<div id="help" popover class="rounded-lg border bg-popover p-4">Figures are in USD.</div>
<input id="q" type="search" placeholder="Filter rows…">
<script type="module">
  const q = document.getElementById("q"), rows = [...document.querySelectorAll("tbody tr")]
  q.addEventListener("input", (e) => rows.forEach((r) => (r.hidden = !r.textContent.toLowerCase().includes(e.target.value.toLowerCase()))))
</script>
```

### Alpine.js
- **What:** Declarative reactivity in HTML attributes (`x-data`, `x-show`, `x-for`, `@click`, `x-model`, `x-transition`). About 56 KB minified (about 20 KB gzip).
- **Use when:** Several interactive widgets on one page share state (filters plus a table plus counts), and native HTML gets messy.
- **Avoid when:** Interactivity is trivial (use the native option above) or app-like (use the react route). The standard build evaluates expressions with `new Function`. Under a strict CSP, use `@alpinejs/csp` (3.17.5, MIT).
- **Route:** html
- **License:** MIT · **Install:** `pnpm add alpinejs` (3.17.5) · **Verified:** 2026-11-25 · https://alpinejs.dev

```js
import Alpine from "alpinejs"
window.Alpine = Alpine
Alpine.start()
```
```html
<div x-data="{ open: false, q: '' }">
  <input x-model="q" placeholder="Filter…"><button @click="open = !open" class="btn">Toggle</button>
  <div x-show="open" x-transition>Showing results for <span x-text="q"></span></div>
</div>
```

## Considered and dropped
- **Pico CSS:** The GitHub repo `picocss/pico` is archived, and the last npm release was 2.1.1 on 2025-03-15.
- **petite-vue:** No release since 0.4.1 (2022-01).
- **htmx:** Needs a server to return HTML fragments, so it doesn't fit a single offline file.
