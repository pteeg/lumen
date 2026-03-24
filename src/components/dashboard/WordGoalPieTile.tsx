import { Link } from 'react-router-dom'
import { useWriteUpBodyWordStats } from '../../context/WriteUpContext'
import { lumenLogoConicGoalGradient } from '../../lib/logoGradient'
import { DashboardCard } from './DashboardCard'
import { DashboardSectionLabel } from './DashboardSectionLabel'

type WordGoalPieTileProps = {
  /** When false, hides “Open write up” (e.g. on Write up → Overview). @default true */
  showOpenWriteUpLink?: boolean
}

export function WordGoalPieTile({
  showOpenWriteUpLink = true,
}: WordGoalPieTileProps) {
  const { totalWords, goal, percent } = useWriteUpBodyWordStats()
  const pctRounded = Math.round(percent * 10) / 10
  const pctDisplay =
    pctRounded % 1 === 0 ? String(Math.round(pctRounded)) : pctRounded.toFixed(1)

  return (
    <DashboardCard
      dense
      surface="transparent"
      className="flex h-full min-h-0 flex-col"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <DashboardSectionLabel>Write-up word goal</DashboardSectionLabel>
        {showOpenWriteUpLink ? (
          <Link
            to="/write-up"
            className="shrink-0 text-sm font-medium text-neutral-700 underline decoration-neutral-400 underline-offset-2 transition hover:text-neutral-900 hover:decoration-neutral-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500"
          >
            Open write up
          </Link>
        ) : null}
      </div>

      <div className="mt-6 flex flex-1 flex-col items-center justify-center gap-4">
        <div
          className="relative aspect-square w-[8.75rem] shrink-0 sm:w-[9rem]"
          role="img"
          aria-label={`Write-up progress: ${pctDisplay} percent of ${goal.toLocaleString()} words`}
        >
          <div
            className="absolute inset-0 rounded-full"
            style={{
              background: lumenLogoConicGoalGradient(percent),
              WebkitMask:
                'radial-gradient(closest-side, transparent 72%, black 73%)',
              mask: 'radial-gradient(closest-side, transparent 72%, black 73%)',
            }}
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="pointer-events-none flex h-[72%] w-[72%] flex-col items-center justify-center rounded-full text-center">
              <p className="text-xl font-semibold tabular-nums tracking-tight text-neutral-900 sm:text-2xl">
                {pctDisplay}%
              </p>
              <p className="mt-0.5 text-[11px] font-medium tabular-nums text-neutral-500">
                of goal
              </p>
            </div>
          </div>
        </div>

        <div className="w-full text-center">
          <p className="text-sm tabular-nums text-neutral-700">
            <span className="font-semibold text-neutral-900">
              {totalWords.toLocaleString()}
            </span>
            {' / '}
            {goal.toLocaleString()} words
          </p>
        </div>
      </div>
    </DashboardCard>
  )
}
