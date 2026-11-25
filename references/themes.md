# Themes

A theme is a set of CSS variables (shadcn's token names) for light (`:root`) and dark (`.dark`). Components and Tailwind classes like `bg-primary`, `text-muted-foreground`, `border`, `chart-1` read them, so changing the theme recolors everything without touching code.

## Built-in

`"theme"` in `kit.json` picks a **base** palette (backgrounds, text, borders):

`neutral` (pure gray, default) · `stone` (warm gray) · `zinc` (cool gray) · `mauve` (purple-tinted) · `olive` (green-tinted) · `mist` (blue-tinted) · `taupe` (brown-tinted)

`"accent"` optionally overrides primary, secondary, chart and sidebar-primary colors:

`amber` `blue` `cyan` `emerald` `fuchsia` `green` `indigo` `lime` `orange` `pink` `purple` `red` `rose` `sky` `teal` `violet` `yellow`

These are shadcn's own palettes (vendored, MIT). Without an accent, primary is near-black/near-white: good for serious, editorial or data pages. Add one accent for brand or emphasis; don't add a second accent color by hand.

## Custom themes

`"theme"` can also be:

- **A path to a `.css` file** (relative to the page folder or absolute), e.g. `"theme": "../brand.css"`.
- **A name of a file in the user's theme folder**: `<data dir>/themes/<name>.css`, where `<data dir>` is `~/.local/share/ohmypage` (macOS/Linux, or `$XDG_DATA_HOME/ohmypage`) or `%LOCALAPPDATA%\ohmypage` (Windows), or `$OHMYPAGE_HOME`. Put a personal or company theme there once and use `"theme": "<name>"` on every page.

A theme file defines any of these variables; missing ones fall back to nothing, so start from a full one (copy `src/styles/theme.css` from any page):

```css
:root {
  --radius: 0.625rem;
  --background: oklch(1 0 0);            --foreground: oklch(0.145 0 0);
  --card: oklch(1 0 0);                  --card-foreground: oklch(0.145 0 0);
  --popover: oklch(1 0 0);               --popover-foreground: oklch(0.145 0 0);
  --primary: oklch(0.205 0 0);           --primary-foreground: oklch(0.985 0 0);
  --secondary: oklch(0.97 0 0);          --secondary-foreground: oklch(0.205 0 0);
  --muted: oklch(0.97 0 0);              --muted-foreground: oklch(0.556 0 0);
  --accent: oklch(0.97 0 0);             --accent-foreground: oklch(0.205 0 0);
  --destructive: oklch(0.577 0.245 27.325);
  --border: oklch(0.922 0 0);            --input: oklch(0.922 0 0);   --ring: oklch(0.708 0 0);
  --chart-1: …; --chart-2: …; --chart-3: …; --chart-4: …; --chart-5: …;
  --sidebar: …; --sidebar-foreground: …; --sidebar-primary: …; --sidebar-primary-foreground: …;
  --sidebar-accent: …; --sidebar-accent-foreground: …; --sidebar-border: …; --sidebar-ring: …;
}
.dark { /* same names */ }
```

Any CSS color works (hex, `oklch()`, `hsl()`). Note shadcn's `--accent` is a subtle hover background, not the brand color; the brand color is `--primary`.

Tools that export this format, or palettes to build one from: [color-tools.md](color-tools.md) (tweakcn exports shadcn variables directly).

## daisyUI

daisyUI pages (`"ui": "daisyui"`) don't use these variables. They use daisyUI's themes: set `"daisyThemes": ["<light theme>", "<dark theme>"]` in `kit.json` (e.g. `["corporate", "business"]`). See https://daisyui.com/docs/themes/.

## Checks

- Contrast: body text ≥ 4.5:1 and large text ≥ 3:1 against its background, in light and dark.
- Chart colors must be distinguishable from each other and from the background; don't rely on color alone (add labels or patterns).
