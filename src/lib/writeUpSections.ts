export const WRITE_UP_SECTIONS = [
  { id: 'abstract', label: 'Abstract' },
  { id: 'introduction', label: 'Introduction' },
  { id: 'literature-review', label: 'Literature review' },
  { id: 'methodology', label: 'Methodology' },
  { id: 'findings', label: 'Findings' },
  { id: 'discussion', label: 'Discussion' },
  { id: 'conclusion', label: 'Conclusion' },
  { id: 'references', label: 'References' },
  { id: 'appendix', label: 'Appendix' },
] as const

export type WriteUpSectionId = (typeof WRITE_UP_SECTIONS)[number]['id']

export function emptyWriteUpContent(): Record<WriteUpSectionId, string> {
  return Object.fromEntries(
    WRITE_UP_SECTIONS.map((s) => [s.id, '']),
  ) as Record<WriteUpSectionId, string>
}

const ID_SET = new Set<string>(WRITE_UP_SECTIONS.map((s) => s.id))

export function isWriteUpSectionId(s: string): s is WriteUpSectionId {
  return ID_SET.has(s)
}
