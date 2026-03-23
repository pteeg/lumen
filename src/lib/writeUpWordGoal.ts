import type { WriteUpSectionId } from './writeUpSections'

/** Sections that count toward the dashboard essay word goal. */
export const WRITE_UP_WORD_COUNT_SECTION_IDS: readonly WriteUpSectionId[] = [
  'introduction',
  'literature-review',
  'methodology',
  'findings',
  'discussion',
  'conclusion',
]

export const WRITE_UP_WORD_GOAL = 12_000
