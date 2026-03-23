import type { DashboardInsight } from '../../types/dashboard'
import { DashboardCard } from './DashboardCard'
import { DashboardSectionLabel } from './DashboardSectionLabel'

type Props = {
  insights: DashboardInsight[]
}

export function RecentInsightsSection({ insights }: Props) {
  const items = insights.slice(0, 4)

  return (
    <DashboardCard dense className="flex h-full flex-col">
      <DashboardSectionLabel>Recent insights</DashboardSectionLabel>
      <ul className="mt-5 flex flex-1 flex-col gap-5">
        {items.map((insight) => (
          <li key={insight.id}>
            <blockquote className="border-l-[3px] border-neutral-200 pl-4 text-sm leading-relaxed text-neutral-700 md:text-[0.9375rem]">
              {insight.text}
            </blockquote>
            {insight.createdAtLabel ? (
              <p className="mt-2 pl-4 text-xs text-neutral-400">
                {insight.createdAtLabel}
              </p>
            ) : null}
          </li>
        ))}
      </ul>
    </DashboardCard>
  )
}
