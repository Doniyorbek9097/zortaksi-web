/** navigateTo query — undefined/null bo'sh qiymatlar URL da "undefined" bo'lmasin */
export function compactQuery(
  query: Record<string, unknown>,
): Record<string, string> {
  const out: Record<string, string> = {}
  for (const [key, value] of Object.entries(query)) {
    if (value == null || value === '') continue
    out[key] = String(value)
  }
  return out
}
