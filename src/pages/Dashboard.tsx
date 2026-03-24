import { useMemo } from 'react'
import {
  ConfirmedInterviewsPieTile,
  InterviewProgressSection,
  NextTaskTile,
  UpcomingInterviewSection,
} from '../components/dashboard'
import { GreetingBar } from '../components/layout/GreetingBar'
import { useInterviewGuideWorkspaceContext } from '../context/InterviewGuideWorkspaceContext'
import { countParticipationRowsByProgress } from '../lib/participationProgressCounts'
import { InterviewsCalendar } from './interviews/InterviewsCalendar'
import {
  formatParticipationInterviewWhen,
  pickNextUpcomingParticipationRow,
} from '../lib/participationUpcoming'
import type { DashboardUpcomingInterview } from '../types/dashboard'

/**
 * Lumen home — interview stats from the interview guide Firestore doc.
 */
export function Dashboard() {
  const { participationRows } = useInterviewGuideWorkspaceContext()

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
      <div className="flex flex-col gap-6 pt-2 md:grid md:grid-cols-[1fr_auto_1fr] md:items-start md:gap-x-6 md:gap-y-6 lg:gap-x-8 md:pt-4">
        <div className="min-w-0 pb-4 md:pb-6 md:justify-self-start">
          <GreetingBar />
        </div>
        <div className="flex min-h-0 justify-center md:justify-self-center">
          <ConfirmedInterviewsPieTile />
        </div>
        <div className="min-h-0 w-full md:w-auto md:justify-self-end">
          <div className="w-full min-w-0 md:w-72 md:shrink-0">
            <UpcomingInterviewSection interview={upcomingInterview} />
          </div>
        </div>
      </div>

      <NextTaskTile className="-mt-2 md:-mt-3" />
      <InterviewProgressSection progressCounts={interviewProgressCounts} />
      <InterviewsCalendar />
    </div>
  )
}
