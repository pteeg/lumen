import type { DashboardUpcomingInterview } from '../../types/dashboard'
import { DashboardCard } from './DashboardCard'
import { DashboardSectionLabel } from './DashboardSectionLabel'

type Props = {
  interview: DashboardUpcomingInterview | null
  className?: string
}

function statusPillClass(statusLabel: string) {
  const confirmed =
    statusLabel.trim().toLowerCase() === 'confirmed'
  if (confirmed) {
    return 'shrink-0 rounded-full bg-green-200 px-2.5 py-1 text-[11px] font-medium uppercase tracking-wide text-green-900'
  }
  return 'shrink-0 rounded-full border border-neutral-200/90 bg-neutral-50 px-2.5 py-1 text-[11px] font-medium uppercase tracking-wide text-neutral-600'
}

export function UpcomingInterviewSection({ interview, className = '' }: Props) {
  return (
    <DashboardCard dense className={`flex h-full flex-col ${className}`}>
      <DashboardSectionLabel>Upcoming interview</DashboardSectionLabel>

      {interview ? (
        <div className="mt-5 flex flex-1 flex-col">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <p className="text-lg font-semibold tracking-tight text-neutral-900">
                {interview.name}
              </p>
              {interview.organisation ? (
                <p className="mt-1 text-sm text-neutral-600">
                  {interview.organisation}
                </p>
              ) : null}
            </div>
            {interview.statusLabel ? (
              <span className={statusPillClass(interview.statusLabel)}>
                {interview.statusLabel}
              </span>
            ) : null}
          </div>
          <p className="mt-5 text-sm font-medium text-neutral-800">
            {interview.dateTimeLabel}
          </p>
          {interview.location ? (
            <p className="mt-2 text-sm leading-relaxed text-neutral-600">
              {interview.location}
            </p>
          ) : null}
        </div>
      ) : (
        <div className="mt-8 flex flex-1 flex-col items-center justify-center rounded-xl border border-dashed border-neutral-200/90 bg-neutral-50/50 px-4 py-8 text-center">
          <p className="text-sm font-medium text-neutral-600">No upcoming interviews</p>
          <p className="mt-1.5 max-w-xs text-xs leading-relaxed text-neutral-500">
            Add a row on Interviews → Participation with a future date and time.
          </p>
        </div>
      )}
    </DashboardCard>
  )
}
