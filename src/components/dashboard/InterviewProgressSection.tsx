import { Link } from 'react-router-dom'
import { DashboardCard } from './DashboardCard'
import { DashboardSectionLabel } from './DashboardSectionLabel'
import { DashboardStatItem } from './DashboardStatItem'

type Props = {
  /** Counts for each participation progress stage, in display order */
  progressCounts: { label: string; count: number }[]
  /** When false, hides the “See all” link (e.g. on the participation page). */
  showSeeAllLink?: boolean
}

export function InterviewProgressSection({
  progressCounts,
  showSeeAllLink = true,
}: Props) {
  const total = progressCounts.reduce((s, { count }) => s + count, 0)

  return (
    <DashboardCard dense>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <DashboardSectionLabel>Interview progress</DashboardSectionLabel>
        <div className="flex flex-wrap items-baseline justify-end gap-x-4 gap-y-1">
          <p className="text-sm tabular-nums text-neutral-500">
            {total} participant{total === 1 ? '' : 's'}
          </p>
          {showSeeAllLink ? (
            <Link
              to="/interviews/participation"
              className="shrink-0 text-sm font-medium text-neutral-700 underline decoration-neutral-400 underline-offset-2 transition hover:text-neutral-900 hover:decoration-neutral-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500"
            >
              See all
            </Link>
          ) : null}
        </div>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-6 lg:grid-cols-5 lg:gap-4">
        {progressCounts.map(({ label, count }) => (
          <DashboardStatItem key={label} value={count} label={label} />
        ))}
      </div>
    </DashboardCard>
  )
}
