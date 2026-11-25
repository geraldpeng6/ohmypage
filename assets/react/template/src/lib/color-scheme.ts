// Stands in for next-themes inside the shadcn components (sonner uses it).
// The color scheme is set by kit.json "colorScheme" and the script in index.html.
export function useTheme() {
  const value = document.documentElement.getAttribute("data-color-scheme") ?? "system"
  return { theme: value as "light" | "dark" | "system" }
}
