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
