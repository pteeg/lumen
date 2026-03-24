/** Dashboard view model — swap mock for store/API later. */

export interface DashboardResearchQuestion {
  /** Primary research question — main anchor of the dashboard */
  mainQuestion: string
  /** Optional supporting questions */
  subQuestions?: string[]
  /** Optional one-line aim or framing */
  researchAim?: string
}

export interface DashboardUpcomingInterview {
  id: string
  name: string
  /** Optional secondary line (e.g. organisation) */
  organisation?: string
  /** Where the interview takes place */
  location?: string
  /** Pre-formatted for display */
  dateTimeLabel: string
  statusLabel?: string
}

export interface DashboardData {
  researchQuestion: DashboardResearchQuestion
}

/** Persisted to the interview guide doc — task list (Tasks page + Next task tile). */
export interface DashboardTask {
  id: string
  text: string
  /** Order within active tasks, or within completed tasks (separate sequences). */
  order: number
  completed: boolean
}
