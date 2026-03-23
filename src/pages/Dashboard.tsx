import { useMemo } from 'react'
import {
  InterviewProgressSection,
  ResearchQuestionSection,
  UpcomingInterviewSection,
} from '../components/dashboard'
import { GreetingBar } from '../components/layout/GreetingBar'
import { useInterviewGuideWorkspaceContext } from '../context/InterviewGuideWorkspaceContext'
import { countParticipationRowsByProgress } from '../lib/participationProgressCounts'
import {
  formatParticipationInterviewWhen,
  pickNextUpcomingParticipationRow,
} from '../lib/participationUpcoming'
import type {
  DashboardResearchQuestion,
  DashboardUpcomingInterview,
} from '../types/dashboard'

/**
 * Lumen home — research question and interview stats from the interview guide Firestore doc.
 */
export function Dashboard() {
  const {
    participationRows,
    researchQuestion: mainResearchQuestion,
    researchAim,
    subQuestions,
    saveDashboardResearchQuestion,
  } = useInterviewGuideWorkspaceContext()

  const researchQuestion = useMemo(
    (): DashboardResearchQuestion => ({
      mainQuestion: mainResearchQuestion,
      subQuestions,
      researchAim,
    }),
    [mainResearchQuestion, subQuestions, researchAim],
  )

  const interviewProgressCounts = useMemo(
    () => countParticipationRowsByProgress(participationRows),
    [participationRows],
  )

  const upcomingInterview = useMemo((): DashboardUpcomingInterview | null => {
    const row = pickNextUpcomingParticipationRow(participationRows)
    if (!row) return null
    const dateTimeLabel = formatParticipationInterviewWhen(row.interviewDateTime)
    if (!dateTimeLabel) return null
    return {
      id: row.id,
      name: row.name,
      location: row.location.trim() || undefined,
      dateTimeLabel,
      statusLabel: row.progress.trim() || undefined,
    }
  }, [participationRows])

  return (
    <div className="space-y-8 md:space-y-10">
      <GreetingBar />
      <ResearchQuestionSection
        data={researchQuestion}
        onSave={saveDashboardResearchQuestion}
      />

      <InterviewProgressSection progressCounts={interviewProgressCounts} />

      <UpcomingInterviewSection interview={upcomingInterview} />
    </div>
  )
}
