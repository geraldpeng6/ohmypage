# Motion and animation

Options for animation, from CSS-only utilities up to timeline engines, plus smooth scrolling.
Prefer the first-listed default (`tw-animate-css`, which is already installed) and reach for a JS library only when the use case says so. Always respect `prefers-reduced-motion`.

### tw-animate-css
- **What:** CSS-only Tailwind v4 utilities for enter and exit animations (`animate-in fade-in zoom-in`, `slide-in-from-bottom-2`, `duration-300`, `delay-150`, `accordion-down`). shadcn's style already imports it, and its overlays use it.
- **Use when:** Simple entrances, hover and open/close states, or staggered fades with `delay-*`. This costs zero JS.
- **Avoid when:** You need exit animations on unmount, layout or shared-element transitions, or scroll-linked motion. Use Motion.
- **Route:** both (html route: add the import yourself)
- **License:** MIT · **Install:** `pnpm add -D tw-animate-css` (1.4.0; shadcn init already adds it) · **Verified:** 2026-11-25 · https://github.com/Wombosvideo/tw-animate-css
- **Note:** The README warns that v2.0.0 will bring breaking changes. Stay on 1.x unless shadcn moves.

```css
@import "tailwindcss";
@import "tw-animate-css";
```
```html
<div class="animate-in fade-in slide-in-from-bottom-2 duration-500 motion-reduce:animate-none">…</div>
```

### Motion (formerly Framer Motion)
- **What:** The standard React animation library: springs, gestures, `AnimatePresence` exit animations, layout animations, `whileInView` and scroll-linked values.
- **Use when:** Exit animations, layout or reorder transitions, scroll reveals, or animated numbers and charts. Magic UI, Motion Primitives and Aceternity depend on it.
- **Avoid when:** A CSS class would do. Paid "Motion+" APIs and examples aren't needed. Everything below is MIT.
- **Route:** react (vanilla JS: `import { animate } from "motion"`)
- **License:** MIT · **Install:** `pnpm add motion` (14.14.0) · **Verified:** 2026-11-25 · https://motion.dev
- **Note:** Import from `motion/react`, not `framer-motion`. `AnimateView` (view transitions) lives in `motion/react-animate-view` and needs React 19.3 or later.

```tsx
import { AnimatePresence, MotionConfig, motion } from "motion/react"

<MotionConfig reducedMotion="user">
  <motion.section initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.3 }} />
  <AnimatePresence>
    {open && <motion.div key="panel" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ type: "spring", bounce: 0.2 }} />}
  </AnimatePresence>
</MotionConfig>
```

### AutoAnimate
- **What:** A zero-config hook. Add a ref to a parent and its children animate when added, removed or moved.
- **Use when:** Filtered lists, sortable tables, or adding and removing cards. It's the cheapest "feels alive" upgrade.
- **Avoid when:** You need choreographed or custom motion. Use Motion.
- **Route:** both (also works with vanilla `autoAnimate(el)`)
- **License:** MIT · **Install:** `pnpm add @formkit/auto-animate` (0.11.0) · **Verified:** 2026-11-25 · https://auto-animate.formkit.com

```tsx
import { useAutoAnimate } from "@formkit/auto-animate/react"

const [parent] = useAutoAnimate()
<ul ref={parent}>{items.map((i) => <li key={i.id}>{i.name}</li>)}</ul>
```

### Lenis
- **What:** Smooth (inertia) scrolling that keeps native scroll semantics. It honors `prefers-reduced-motion` by default.
- **Use when:** Long-scroll landing pages and storytelling pages, especially with scroll-linked animation (GSAP ScrollTrigger or Motion `useScroll`).
- **Avoid when:** Dashboards, docs and tool pages. Smooth scrolling hurts precise reading and scrolling there.
- **Route:** both
- **License:** MIT · **Install:** `pnpm add lenis` (1.3.28) · **Verified:** 2026-11-25 · https://lenis.darkroom.engineering

```tsx
import { ReactLenis } from "lenis/react"
import "lenis/dist/lenis.css"

<ReactLenis root options={{ lerp: 0.1, anchors: true }}>{children}</ReactLenis>
// vanilla: import Lenis from "lenis"; new Lenis({ autoRaf: true })
```

### GSAP (check the license)
- **What:** A timeline animation engine with plugins: ScrollTrigger, SplitText, MorphSVG, DrawSVG, Flip and others. All of them are free since Webflow's acquisition.
- **Use when:** Complex, sequenced or scroll-pinned storytelling, SVG morphing or text splitting.
- **Avoid when:** Motion covers the need, or the project requires an OSI license. Don't use it when building a no-code visual animation builder.
- **Route:** both (React helper: `@gsap/react` `useGSAP`)
- **License:** **GSAP Standard "No Charge" License (Webflow), not OSS.** Free for commercial and non-commercial sites and apps. It **prohibits** using GSAP in tools that let users build visual animations without code and that compete with Webflow's visual animation builder (unless Webflow consents in writing). It also prohibits reverse engineering GSAP to make such competing products and removing its notices or branding. Webflow may amend the terms, and later versions fall under the revised terms. It terminates on non-compliance. AI-generated GSAP code is explicitly allowed. · **Install:** `pnpm add gsap @gsap/react` (3.15.1 / 2.1.2) · **Verified:** 2026-11-25 · https://gsap.com/standard-license

```tsx
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { useGSAP } from "@gsap/react"
gsap.registerPlugin(useGSAP, ScrollTrigger)

const scope = useRef<HTMLDivElement>(null)
useGSAP(() => {
  gsap.from(".card", { y: 40, opacity: 0, stagger: 0.1, scrollTrigger: { trigger: ".card", start: "top 80%" } })
}, { scope })
```
