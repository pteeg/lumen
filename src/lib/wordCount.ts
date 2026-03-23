/** Whitespace-separated word count for Latin-style prose. */
export function countWords(text: string): number {
  const t = text.trim()
  if (!t) return 0
  return t.split(/\s+/).length
}
