# Tables, charts and data visualization

Libraries for tabular data, charts, custom visualizations and number/date formatting. Everything here bundles into a single offline file.
Use the first-listed default (shadcn Chart for charts, TanStack Table for tables, `Intl` for formatting) unless the use case says otherwise.

Theme tip: shadcn themes define `--chart-1` … `--chart-5`. Use them as `var(--chart-1)` in every library, not hard-coded hex values, so charts follow the theme and dark mode.

### shadcn Chart (Recharts)
- **What:** shadcn's `chart` component. It wraps Recharts 3 with `ChartContainer`, `ChartTooltipContent` and `ChartLegendContent`, plus a `ChartConfig` that maps series to labels and colors.
- **Use when:** Line, area, bar, pie, radar or radial charts in reports and dashboards. This is the default.
- **Avoid when:** You have more than about 5k points, or need heatmaps, sankey, treemap or geo maps. Use ECharts.
- **Route:** react
- **License:** MIT · **Install:** `pnpm dlx shadcn@latest add chart` (the registry pins `recharts@3.8.0`; latest is 3.11.1, and don't bump unless needed) · **Verified:** 2026-11-25 · https://ui.shadcn.com/docs/components/radix/chart

```tsx
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart"

const config = { revenue: { label: "Revenue", color: "var(--chart-1)" } } satisfies ChartConfig
<ChartContainer config={config} className="min-h-64 w-full">
  <BarChart accessibilityLayer data={rows}>
    <CartesianGrid vertical={false} /><XAxis dataKey="month" tickLine={false} axisLine={false} />
    <ChartTooltip content={<ChartTooltipContent />} />
    <Bar dataKey="revenue" fill="var(--color-revenue)" radius={4} />
  </BarChart>
</ChartContainer>
```

### TanStack Table v9
- **What:** A headless table engine for sorting, filtering, pagination, grouping and selection. Render it with shadcn `table`. shadcn's `data-table` guide now targets v9.
- **Use when:** Any table where people sort, filter or page through data.
- **Avoid when:** The table is small and static. Use shadcn `table` alone.
- **Route:** react
- **License:** MIT · **Install:** `pnpm add @tanstack/react-table` (9.3.1) · **Verified:** 2026-11-25 · https://tanstack.com/table/latest
- **v9 changes:** `useReactTable` became `useTable`. Features are opt-in through `tableFeatures({...})`. For sorting, add `rowSortingFeature` and `sortedRowModel: createSortedRowModel()`. Keep `features`, `columns` and fallback data stable at module scope. After installing, `npx @tanstack/intent@latest install` gives agents version-matched docs.

```tsx
import { createColumnHelper, tableFeatures, useTable } from "@tanstack/react-table"

const features = tableFeatures({})
const col = createColumnHelper<typeof features, Row>()
const columns = col.columns([col.accessor("region", { header: "Region" }), col.accessor("revenue", { header: "Revenue" })])
// in the component:
const table = useTable({ features, columns, data })
// header: <table.FlexRender header={h} />   cell: <table.FlexRender cell={c} />
// rows:   table.getRowModel().rows.map(r => r.getAllCells())
```

### TanStack Virtual
- **What:** A headless virtualizer that renders only the visible rows or items.
- **Use when:** Tables or lists with thousands of rows embedded in the page.
- **Avoid when:** There are fewer than about 500 rows. Plain rendering is simpler.
- **Route:** react
- **License:** MIT · **Install:** `pnpm add @tanstack/react-virtual` (3.14.28) · **Verified:** 2026-11-25 · https://tanstack.com/virtual/latest

```tsx
import { useVirtualizer } from "@tanstack/react-virtual"

const v = useVirtualizer({ count: rows.length, getScrollElement: () => parentRef.current, estimateSize: () => 36 })
<div ref={parentRef} className="h-96 overflow-auto"><div style={{ height: v.getTotalSize(), position: "relative" }}>
  {v.getVirtualItems().map((i) => (
    <div key={i.key} style={{ position: "absolute", top: 0, width: "100%", height: i.size, transform: `translateY(${i.start}px)` }}>{rows[i.index].name}</div>
  ))}
</div></div>
```

### Apache ECharts 6
- **What:** A full-featured chart engine: heatmap, sankey, treemap, sunburst, graph, candlestick, gauge, large-data rendering, and canvas or SVG output.
- **Use when:** Heavy dashboards, big datasets, or chart types Recharts lacks.
- **Avoid when:** Simple charts. It is much larger than Recharts and doesn't style itself from shadcn tokens, so pass `var(--chart-n)` colors yourself. Geo maps need their GeoJSON bundled locally because there is no runtime fetch.
- **Route:** both
- **License:** Apache-2.0 · **Install:** `pnpm add echarts` (6.1.0; optional React wrapper `echarts-for-react` 3.1.0 supports echarts 6) · **Verified:** 2026-11-25 · https://echarts.apache.org/en/index.html

```ts
import * as echarts from "echarts/core"
import { BarChart } from "echarts/charts"
import { GridComponent, TooltipComponent } from "echarts/components"
import { SVGRenderer } from "echarts/renderers"
echarts.use([BarChart, GridComponent, TooltipComponent, SVGRenderer]) // tree-shaken
const chart = echarts.init(el, null, { renderer: "svg" })
chart.setOption({ tooltip: {}, xAxis: { type: "category", data: ["A", "B"] }, yAxis: {}, series: [{ type: "bar", data: [5, 9] }] })
new ResizeObserver(() => chart.resize()).observe(el) // call chart.dispose() on unmount
```

### Observable Plot
- **What:** A concise grammar-of-graphics library that returns a static SVG element.
- **Use when:** Exploratory or analytical figures in reports (dot plots, faceting, distributions, regressions) with very little code.
- **Avoid when:** You need rich interactive tooltips or legends that match the shadcn UI. Use shadcn Chart.
- **Route:** both
- **License:** ISC · **Install:** `pnpm add @observablehq/plot` (0.6.19) · **Verified:** 2026-11-25 · https://observablehq.github.io/plot/

```ts
import * as Plot from "@observablehq/plot"

const svg = Plot.plot({ y: { grid: true }, marks: [Plot.lineY(data, { x: "date", y: "value", stroke: "var(--chart-1)" }), Plot.ruleY([0])] })
container.replaceChildren(svg) // in React: do this inside useEffect and return () => svg.remove()
```

### d3 (and visx)
- **What:** Low-level scales, shapes, layouts, geo and formatting. visx (`@visx/visx` 4.0.0, MIT) wraps d3 math as React components.
- **Use when:** A bespoke visualization no chart library offers, or you only need `d3-scale`/`d3-format` helpers.
- **Avoid when:** A standard chart would do. d3 costs far more code.
- **Route:** both
- **License:** ISC · **Install:** `pnpm add d3` (7.9.2), plus `@types/d3` for TypeScript · **Verified:** 2026-11-25 · https://d3js.org

```ts
import * as d3 from "d3"

const x = d3.scaleLinear().domain([0, d3.max(data, (d) => d.value)!]).range([0, width]).nice()
const fmt = d3.format(",.2~f") // 12,345.6
```

### Intl (built-in) and date-fns
- **What:** `Intl.NumberFormat`, `Intl.DateTimeFormat` and `Intl.RelativeTimeFormat` cover most formatting with zero bytes. date-fns adds parsing, date math and pattern formatting.
- **Use when:** Always format KPI numbers, currency, percentages and dates. Don't show raw floats or ISO strings. Add date-fns only for parsing or arithmetic.
- **Avoid when:** n/a. Skip moment.js. numbro has had no release since 2024-04.
- **Route:** both
- **License:** built-in · date-fns MIT · **Install:** `pnpm add date-fns` (4.4.0) · **Verified:** 2026-11-25 · https://date-fns.org

```ts
new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 1 }).format(1234567) // "1.2M"
new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(1234.5)       // "$1,234.50"
new Intl.NumberFormat("en-US", { style: "percent", signDisplay: "exceptZero", maximumFractionDigits: 1 }).format(0.123) // "+12.3%"
new Intl.RelativeTimeFormat("en", { numeric: "auto" }).format(-1, "day")                     // "yesterday"
import { format, parseISO } from "date-fns"; format(parseISO("2026-11-25"), "MMM d, yyyy")    // "Nov 25, 2026"
```

### Chart.js + Basecoat chart (html route)
- **What:** Basecoat's `chart` helper drives Chart.js with shadcn-style defaults (`--chart-n` colors, tooltip and legend styling).
- **Use when:** Charts in the plain-HTML route.
- **Avoid when:** You are on the react route. Use shadcn Chart. The Basecoat docs show Chart.js from a CDN. Bundle it instead, as below.
- **Route:** html
- **License:** MIT (chart.js, basecoat-css) · **Install:** `pnpm add chart.js basecoat-css` (chart.js 4.6.2) · **Verified:** 2026-11-25 · https://basecoatui.com/components/chart/

```js
import Chart from "chart.js/auto"
import "basecoat-css/basecoat"
import "basecoat-css/chart" // not included in basecoat-css/all
window.basecoat.chart("#visitors", { Chart, type: "bar", labelKey: "month", data: rows,
  series: { desktop: { label: "Desktop", color: "var(--chart-1)" } } })
```
