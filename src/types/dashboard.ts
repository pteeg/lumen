/** Dashboard view model — swap mock for store/API later. */

export interface DashboardResearchQuestion {
  /** Primary research question — main anchor of the dashboard */
  mainQuestion: string
  /** Optional supporting questions */
  subQuestions?: string[]
  /** Optional one-line aim or framing */
  researchAim?: string
}

export interface DashboardCurrentFocus {
  /** Short label shown prominently */
  label: string
  /** Optional supporting line */
  description?: string
}

export interface DashboardInterviewProgress {
  planned: number
  completed: number
  analysed: number
}

export interface DashboardQuestionBank {
  total: number
  refined: number
  final: number
}

export interface DashboardInsight {
  id: string
  text: string
  /** Optional display date, e.g. "2 days ago" */
  createdAtLabel?: string
}

export interface DashboardUpcomingInterview {
  id: string
  name: string
  organisation: string
  venue?: string
  /** Pre-formatted for display */
  dateTimeLabel: string
  statusLabel?: string
}

export interface DashboardData {
  researchQuestion: DashboardResearchQuestion
  currentFocus: DashboardCurrentFocus
  interviewProgress: DashboardInterviewProgress
  questionBank: DashboardQuestionBank
  insights: DashboardInsight[]
  upcomingInterview: DashboardUpcomingInterview | null
}
