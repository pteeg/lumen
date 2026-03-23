/** Fixed section labels for the interview guide (v1). */
export const INTERVIEW_SECTIONS = [
  'Opening questions',
  'Current booking behaviour',
  'Networks',
  'Awareness of platforms',
  'Trust & risk',
  'Closing reflections',
] as const

export type InterviewSection = (typeof INTERVIEW_SECTIONS)[number]

export type InterviewQuestionPriority = 'low' | 'medium' | 'high'

export type InterviewQuestionStatus = 'draft' | 'ready' | 'scheduled' | 'done'

export type AudienceType = 'all' | 'hosts' | 'guests' | 'mixed'

export interface InterviewQuestion {
  id: string
  questionText: string
  section: InterviewSection
  /** Why this question belongs in the study. */
  rationale: string
  /** What you intend to learn from the answer. */
  learningGoal: string
  notes: string
  /** Optional analytic theme tag. */
  theme: string
  audienceType: AudienceType
  priority: InterviewQuestionPriority
  status: InterviewQuestionStatus
  /** Sort order within the section (lower = earlier). */
  orderIndex: number
}

export interface FindingsTheme {
  id: string
  title: string
  description: string
  /** Types of quotes or observations that might sit here. */
  possibleEvidence: string
  linkedInterviewQuestionIds: string[]
  notes: string
  /** Rough sketch of how this could appear in the essay structure. */
  essayStructure: string
}

export interface ResearchProject {
  title: string
  researchQuestion: string
  subQuestions: string[]
  /** Optional framing line shown on the dashboard under the main question */
  researchAim?: string
  aims: string[]
}
