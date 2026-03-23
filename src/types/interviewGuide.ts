/** Interview guide workspace — independent of legacy `research` types for v1. */

export type InterviewGuidePriority = 'low' | 'medium' | 'high'

export type InterviewGuideStatus =
  | 'draft'
  | 'refined'
  | 'final'
  | 'parked'

export interface InterviewGuideSection {
  id: string
  title: string
  order: number
  /** Freeform notes for this section (Structure tab) */
  notes?: string
}

/** Reminders on the Interview Overview — ordered list, independent of sections. */
export interface InterviewGuideThought {
  id: string
  text: string
  order: number
}

/** Fixed options for Participation row “Type” (multi-select). */
export const PARTICIPATION_TYPE_OPTIONS = [
  'Venue owner',
  'Promoter',
  'Artist and booker',
  'Booker (employed)',
] as const

export type ParticipationTypeOption = (typeof PARTICIPATION_TYPE_OPTIONS)[number]

/** Progress stage for Participation rows (single-select). */
export const PARTICIPATION_PROGRESS_OPTIONS = [
  'Not contacted',
  'Awaiting their response',
  'I need to respond',
  'Confirmed',
  'Interviewed',
] as const

export type ParticipationProgressOption =
  (typeof PARTICIPATION_PROGRESS_OPTIONS)[number]

/** Participation tab — one row per interview / participant. */
export interface InterviewParticipationRow {
  id: string
  name: string
  /** Multi-select; values should match PARTICIPATION_TYPE_OPTIONS labels */
  participantTypes: string[]
  notes: string
  /** One of PARTICIPATION_PROGRESS_OPTIONS */
  progress: string
  /** ISO 8601 datetime string, or empty if not set */
  interviewDateTime: string
  location: string
  order: number
}

export interface InterviewGuideQuestion {
  id: string
  sectionId: string
  questionText: string
  rationale: string
  learningGoal: string
  /** Freeform — e.g. one probe per line */
  followUpProbes: string
  theme: string
  priority: InterviewGuidePriority
  status: InterviewGuideStatus
  wordingNotes: string
  possibleFindingsLink: string
  /** Sort order within the section (lower = earlier). Reordering hooks here later. */
  order: number
}
