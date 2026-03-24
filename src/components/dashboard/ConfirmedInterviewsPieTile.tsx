import { useMemo } from 'react'
import { useInterviewGuideWorkspaceContext } from '../../context/InterviewGuideWorkspaceContext'
import { CONFIRMED_INTERVIEW_GOAL } from '../../lib/confirmedInterviewGoal'
import {
  lumenLogoConicGoalGradient,
  PIE_GOAL_TRACK_GREY,
} from '../../lib/logoGradient'
import { participationProgressBucket } from '../../lib/participationProgressCounts'
import { DashboardCard } from './DashboardCard'

export function ConfirmedInterviewsPieTile() {
  const { participationRows } = useInterviewGuideWorkspaceContext()

  const confirmedCount = useMemo(() => {
    let n = 0
    for (const row of participationRows) {
      if (participationProgressBucket(row.progress) === 'Confirmed') n += 1
    }
    return n
  }, [participationRows])

  const goal = CONFIRMED_INTERVIEW_GOAL
  const percent = goal > 0 ? Math.min(100, (confirmedCount / goal) * 100) : 0

  return (
    <DashboardCard
      dense
      surface="transparent"
      className="w-fit max-w-full min-w-0 !p-2 md:!p-2.5"
    >
      <div className="flex flex-col items-center justify-center">
        <div
          className="relative aspect-square w-[11.5rem] shrink-0 sm:w-[12.5rem]"
          role="img"
          aria-label={`${confirmedCount} of ${goal} interviews confirmed`}
        >
          <div
            className="absolute inset-0 rounded-full"
            style={{
              background: lumenLogoConicGoalGradient(percent, {
                trackColor: PIE_GOAL_TRACK_GREY,
              }),
              WebkitMask:
                'radial-gradient(closest-side, transparent 72%, black 73%)',
              mask: 'radial-gradient(closest-side, transparent 72%, black 73%)',
            }}
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="pointer-events-none flex h-[72%] w-[72%] flex-col items-center justify-center rounded-full px-1 text-center">
              <p className="text-base font-semibold tabular-nums text-neutral-900 sm:text-lg">
                {confirmedCount}/{goal}
              </p>
              <p className="mt-1 text-[9px] font-medium leading-tight text-neutral-600 sm:text-[10px]">
                interviews confirmed
              </p>
            </div>
          </div>
        </div>
      </div>
    </DashboardCard>
  )
}
