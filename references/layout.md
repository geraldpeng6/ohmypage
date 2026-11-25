# Layout building blocks

Long-form typography, resizable panes, carousels, node/flow diagrams and drag-and-drop.
For long-form text, prefer the first-listed default (shadcn Typeset). For everything else, pick the entry that matches the use case.

### shadcn Typeset (long-form text, default)
- **What:** One CSS file you own that styles rendered HTML or markdown inside a `.typeset` container. It takes colors, fonts and radius from the shadcn theme and is tuned by three variables: `--typeset-size`, `--typeset-leading` and `--typeset-flow`.
- **Use when:** Articles, docs, report narrative, or rendered markdown in the react route. It follows the shadcn theme and dark mode automatically.
- **Avoid when:** You are on the html route with daisyUI. Use `@tailwindcss/typography`. Basecoat ships its own `basecoat-css/typeset`.
- **Route:** react (html + Basecoat: `@import "basecoat-css/typeset";`)
- **License:** MIT (shadcn/ui) · **Install:** generate `typeset.css` in the builder at https://ui.shadcn.com/typeset and save it next to your main CSS · **Verified:** 2026-11-25 · https://ui.shadcn.com/docs/typeset
- **Note:** It sets no max-width. Add one yourself (for example `max-w-[68ch] mx-auto`).

```css
@import "tailwindcss";
@import "./typeset.css";
.typeset-article { --typeset-leading: 1.75; --typeset-flow: 1.5em; }
```
```tsx
<article className="typeset typeset-article mx-auto max-w-[68ch]">{html}</article>
```

### @tailwindcss/typography
- **What:** The `prose` classes for styling HTML you don't control.
- **Use when:** The html route with daisyUI or plain Tailwind, or when a project already uses `prose`.
- **Avoid when:** The react route with a shadcn theme. Its default palettes don't read shadcn tokens. If you use it anyway, map them with a `@utility` as shown below.
- **Route:** both
- **License:** MIT · **Install:** `pnpm add -D @tailwindcss/typography` (0.5.20) · **Verified:** 2026-11-25 · https://github.com/tailwindlabs/tailwindcss-typography

```css
@import "tailwindcss";
@plugin "@tailwindcss/typography";
/* Only with shadcn/Basecoat tokens: they already flip in dark mode, so skip dark:prose-invert */
@utility prose-theme { --tw-prose-body: var(--foreground); --tw-prose-headings: var(--foreground); --tw-prose-links: var(--primary); --tw-prose-bold: var(--foreground); }
```
```html
<article class="prose dark:prose-invert max-w-none">…</article> <!-- plain Tailwind/daisyUI; class="not-prose" opts a block out -->
```

### Resizable panels (shadcn `resizable`, react-resizable-panels v4)
- **What:** Drag-to-resize split panes (horizontal or vertical, nestable).
- **Use when:** Tool pages and explorers: list plus detail, code plus preview, sidebar plus canvas.
- **Avoid when:** Simple responsive layouts. CSS grid is enough. Remember that mobile needs a stacked fallback.
- **Route:** react
- **License:** MIT · **Install:** `pnpm dlx shadcn@latest add resizable` (react-resizable-panels 4.24.2) · **Verified:** 2026-11-25 · https://react-resizable-panels.vercel.app
- **v4 gotchas:** The primitives are now `Group`/`Panel`/`Separator`, with `orientation` instead of `direction`. Size props treat **numbers as pixels** and unit-less strings as percent. Use `"30%"` style strings.

```tsx
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable"

<ResizablePanelGroup orientation="horizontal" className="min-h-[70vh] rounded-lg border">
  <ResizablePanel defaultSize="30%" minSize="20%">Files</ResizablePanel>
  <ResizableHandle withHandle />
  <ResizablePanel>Preview</ResizablePanel>
</ResizablePanelGroup>
```

### Carousel (shadcn `carousel`, Embla)
- **What:** An accessible, swipeable carousel built on Embla.
- **Use when:** Screenshot galleries, testimonials, or step-through slides.
- **Avoid when:** The content is important. Hidden slides are rarely seen, so use a grid.
- **Route:** react (html: Basecoat `carousel`)
- **License:** MIT · **Install:** `pnpm dlx shadcn@latest add carousel` (embla-carousel-react 8.6.0; v9 is still RC) · **Verified:** 2026-11-25 · https://www.embla-carousel.com

```tsx
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel"

<Carousel opts={{ loop: true }} className="mx-auto max-w-xl">
  <CarouselContent>{shots.map((s) => <CarouselItem key={s.src}><img src={s.src} alt={s.alt} /></CarouselItem>)}</CarouselContent>
  <CarouselPrevious /><CarouselNext />
</Carousel>
```

### React Flow (@xyflow/react)
- **What:** Interactive node graphs with pan and zoom, minimap, controls and custom nodes.
- **Use when:** Architecture, pipeline, workflow or dependency diagrams that users explore, or node editors.
- **Avoid when:** A static diagram is enough. Use inline SVG or a pre-rendered image. Automatic layout needs an extra lib such as dagre or elkjs.
- **Route:** react
- **License:** MIT (paid "React Flow Pro" is optional support and examples) · **Install:** `pnpm add @xyflow/react` (13.0.3) · **Verified:** 2026-11-25 · https://reactflow.dev
- **Note:** The parent element needs an explicit height. Use `style.css`, or `base.css` if you style it fully yourself.

```tsx
import { Background, Controls, ReactFlow } from "@xyflow/react"
import "@xyflow/react/style.css"

const nodes = [{ id: "a", position: { x: 0, y: 0 }, data: { label: "Ingest" } }, { id: "b", position: { x: 220, y: 0 }, data: { label: "Transform" } }]
const edges = [{ id: "a-b", source: "a", target: "b", animated: true }]
<div className="h-[480px] rounded-lg border"><ReactFlow nodes={nodes} edges={edges} fitView><Background /><Controls /></ReactFlow></div>
```

### dnd-kit (@dnd-kit/react)
- **What:** Drag and drop: sortable lists, kanban columns, drop zones.
- **Use when:** A prototype or tool page needs reordering or kanban.
- **Avoid when:** A simple reorder would work with up/down buttons. `@dnd-kit/react` is still pre-1.0 (0.5.3). The legacy `@dnd-kit/core` 6.3.1 and `@dnd-kit/sortable` 10.0.0 have had no release since 2024-12. Use them only if a copied block requires them.
- **Route:** react
- **License:** MIT · **Install:** `pnpm add @dnd-kit/react` (0.5.3) · **Verified:** 2026-11-25 · https://dndkit.com

```tsx
import { DragDropProvider } from "@dnd-kit/react"
import { useSortable } from "@dnd-kit/react/sortable"

function Item({ id, index }: { id: string; index: number }) {
  const { ref } = useSortable({ id, index })
  return <li ref={ref}>{id}</li>
}
<DragDropProvider onDragEnd={(e) => { if (!e.canceled) persistOrder() }}><ul>{ids.map((id, i) => <Item key={id} id={id} index={i} />)}</ul></DragDropProvider>
```
