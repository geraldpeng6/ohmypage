# Components beyond core shadcn/ui

UI building blocks to add on top of the core shadcn/ui set: toasts, command palettes, drawers, agent/chat transcript patterns, animated marketing components, and where to find more registries.
In each section, use the first-listed option unless the use case says otherwise. Core shadcn components (`pnpm dlx shadcn@latest add <name>`) come before anything in this file.

Offline reminder: many showcase demos load remote images, avatars, fonts or tweets. Replace them with local assets before bundling. Never hotlink.

## Feedback and overlays

### Sonner (shadcn `sonner`)
- **What:** Toast notifications. This is what shadcn's `sonner` component wraps.
- **Use when:** Confirming an action (copied, exported, saved) or reporting a non-blocking error.
- **Avoid when:** The message must be read or acted on. Use `alert-dialog` or an inline `alert`.
- **Route:** react (html: Basecoat has its own `toast`)
- **License:** MIT · **Install:** `pnpm dlx shadcn@latest add sonner` (sonner 2.0.8) · **Verified:** 2026-11-25 · https://sonner.emilkowal.ski

Gotcha: the shadcn wrapper imports `useTheme` from `next-themes`. A Vite page has no ThemeProvider, so pass `theme="light"|"dark"|"system"` yourself or edit the wrapper.

```tsx
import { Toaster } from "@/components/ui/sonner"
import { toast } from "sonner"

<Toaster richColors position="top-right" />
<Button onClick={() => toast.success("Exported", { description: "report.csv" })}>Export</Button>
```

### cmdk (shadcn `command`)
- **What:** A command palette and filterable list. shadcn `command` and `combobox` are built on it.
- **Use when:** Jumping between sections of a long doc or dashboard (⌘K), or searching a list of items.
- **Avoid when:** There are fewer than about 10 options. Use `select` or plain buttons.
- **Route:** react (html: Basecoat `command`)
- **License:** MIT · **Install:** `pnpm dlx shadcn@latest add command` (cmdk 1.1.1) · **Verified:** 2026-11-25 · https://github.com/dip/cmdk
- **Status:** The last npm release was 2025-03-14, more than 18 months ago. It still works and shadcn still depends on it, but don't expect new features.

```tsx
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"

<Command>
  <CommandInput placeholder="Jump to…" />
  <CommandList>
    <CommandEmpty>No results.</CommandEmpty>
    <CommandGroup heading="Sections"><CommandItem onSelect={() => go("#summary")}>Summary</CommandItem></CommandGroup>
  </CommandList>
</Command>
```

### vaul (shadcn `drawer`)
- **What:** A bottom drawer you can swipe to dismiss. shadcn `drawer` wraps it.
- **Use when:** You need a mobile-first bottom sheet that dismisses with a swipe.
- **Avoid when:** Most of the time. The vaul README says the repo is **unmaintained**, and the last release was 1.1.2 on 2024-12-14. Prefer shadcn `sheet` (`side="bottom"`) or `dialog`.
- **Route:** react
- **License:** MIT · **Install:** `pnpm dlx shadcn@latest add drawer` (vaul 1.1.2) · **Verified:** 2026-11-25 · https://vaul.emilkowal.ski

```tsx
import { Drawer, DrawerContent, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer"

<Drawer>
  <DrawerTrigger asChild><Button variant="outline">Details</Button></DrawerTrigger>
  <DrawerContent><DrawerTitle>Row details</DrawerTitle>{/* … */}</DrawerContent>
</Drawer>
```

## Agent, chat and transcript UI

### AI Elements (now part of shadcn/ui)
- **What:** Patterns for agent interfaces: Message, Bubble, Message Scroller, Trace (Tool, Reasoning, Plan, Chain of Thought), Code Block, Sources, Inline Citation, Test Results, Terminal, File Tree and more. They are shadcn components you copy into the project. No runtime package is needed.
- **Use when:** Rendering a saved agent or chat transcript, tool calls, or an eval or test report as a static offline page. Feed it data. No AI SDK or API key is needed.
- **Avoid when:** You would need live model calls. Those need the network and an API key, so they don't fit an offline single-file page.
- **Route:** react
- **License:** MIT (shadcn/ui) · **Install:** `pnpm dlx shadcn@latest add message bubble trace code-block` · **Verified:** 2026-11-25 · https://ui.shadcn.com/docs/ai-elements
- **Status:** The old Vercel site (elements.ai-sdk.dev, `npx ai-elements`, `ai-elements` 1.9.1, Apache-2.0) says it will be deprecated at the end of November 2026, and new projects should use the shadcn versions. Copies already in a project keep working.

```tsx
import { Bubble, BubbleContent } from "@/components/ui/bubble"
import { Message, MessageContent } from "@/components/ui/message"

<Message align="end">
  <MessageContent><Bubble align="end" variant="muted"><BubbleContent>{userText}</BubbleContent></Bubble></MessageContent>
</Message>
<Message><MessageContent>{assistantText}</MessageContent></Message>
```

## Animated and marketing components

### Magic UI
- **What:** More than 150 animated landing-page components, such as Number Ticker, Marquee, Bento Grid, Border Beam, Blur Fade, Animated Beam and Dock. They are distributed as a shadcn registry (`@magicui`).
- **Use when:** Landing pages and hero or KPI sections that need polish fast.
- **Avoid when:** The page is a dense report or tool page where motion distracts. Some items load remote media (for example, tweet cards fetch from the network), so skip those offline.
- **Route:** react
- **License:** MIT · **Install:** `pnpm dlx shadcn@latest add @magicui/number-ticker` (pulls in `motion`) · **Verified:** 2026-11-25 · https://magicui.design

```tsx
import { NumberTicker } from "@/components/ui/number-ticker"

<NumberTicker value={98.6} decimalPlaces={1} className="text-5xl font-semibold tabular-nums" />
```

### Motion Primitives
- **What:** A small set of tasteful Motion-based primitives: Text Effect, Animated Group, In View, Morphing Dialog, Animated Number, Spotlight and others.
- **Use when:** You want subtle, product-style motion that is quieter than Magic UI.
- **Avoid when:** Plain `tw-animate-css` classes would do.
- **Route:** react
- **License:** MIT · **Install:** `pnpm dlx shadcn@latest add @motion-primitives/text-effect` · **Verified:** 2026-11-25 · https://motion-primitives.com
- **Note:** The standalone npm package `motion-primitives` (0.1.0, 2025-03) is only a CLI. Use the shadcn registry instead.

```tsx
import { TextEffect } from "@/components/ui/text-effect"

<TextEffect per="word" preset="fade-in-blur" as="h1" className="text-4xl font-semibold">
  Quarterly results at a glance
</TextEffect>
```

### Aceternity UI (check the license)
- **What:** Flashy effect components such as Background Beams, Spotlight, 3D Card, Lamp, Sparkles and Timeline. About 100 components are free. Paid "All-Access" adds premium blocks and templates.
- **Use when:** A marketing or landing page where the user explicitly wants a bold, effect-heavy look.
- **Avoid when:** Reports, dashboards and docs. Also avoid it if the page will itself be redistributed as a template.
- **Route:** react
- **License:** **Aceternity License (proprietary, not OSS).** You may use it in unlimited personal, client and commercial end products, and modify it. You may **not** redistribute the items or their source files, sell or redistribute them or derivatives on any marketplace, or build themes, templates or derivative products to sell. The pricing FAQ says the same about the free tier: it is usable commercially but cannot be resold or redistributed as a competing template or component library. · **Install:** `pnpm dlx shadcn@latest add @aceternity/background-beams` · **Verified:** 2026-11-25 · https://ui.aceternity.com/licence
- **Note:** shadcn's directory marks the `@aceternity` registry as "degraded" (sampled items failing validation). Check the installed file and replace remote images.

```tsx
import { BackgroundBeams } from "@/components/ui/background-beams"

<section className="relative h-[28rem] overflow-hidden"><h1 className="relative z-10">…</h1><BackgroundBeams /></section>
```

### React Bits (check the license)
- **What:** A very large collection of animated text, background and interactive components (registry `@react-bits`).
- **Use when:** You want one specific eye-catching effect, like animated text or a background, on a landing page.
- **Avoid when:** The output will be sold or redistributed as a component, template or asset pack.
- **Route:** react
- **License:** **MIT + Commons Clause** (not OSS). You may use it commercially as part of an application, website or product. You may not sell, sublicense or redistribute the components themselves, alone, in a bundle or as a port. · **Install:** `pnpm dlx shadcn@latest add @react-bits/<item>` (copy the exact item name from the site) · **Verified:** 2026-11-25 · https://reactbits.dev

## Finding more

### shadcn registry directory
- **What:** The official index of third-party shadcn registries, with health scores. Each one installs with `shadcn add @namespace/item`. Ones worth knowing: `@reui` (data grids, extra primitives), `@kibo-ui` (Gantt, kanban, editor-style blocks), `@diceui` (accessible extras), `@coss` (Base UI-based), `@animate-ui` (animated primitives, MIT + Commons Clause), `@shadcnblocks` (many marketing and admin blocks, some paid, health "degraded").
- **Use when:** Core shadcn lacks a component. Search here before hand-rolling one.
- **Avoid when:** The registry's health is "degraded" or its license is unclear. Read the copied file before relying on it.
- **Route:** react
- **License:** varies per registry; check each one · **Install:** `pnpm dlx shadcn@latest add @<registry>/<item>` · **Verified:** 2026-11-25 · https://ui.shadcn.com/docs/directory (also https://registry.directory)

```bash
pnpm dlx shadcn@latest search @reui -q "data grid"   # find an item
pnpm dlx shadcn@latest view @reui/<item>             # inspect before adding
pnpm dlx shadcn@latest add @reui/<item>
```
