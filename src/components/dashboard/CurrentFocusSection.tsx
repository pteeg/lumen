import type { DashboardCurrentFocus } from '../../types/dashboard'
import { DashboardCard } from './DashboardCard'
import { DashboardSectionLabel } from './DashboardSectionLabel'

type Props = {
  data: DashboardCurrentFocus
}

export function CurrentFocusSection({ data }: Props) {
  return (
    <DashboardCard dense className="border-neutral-200/90 bg-white/90">
      <div className="flex flex-col gap-1 md:flex-row md:items-baseline md:justify-between md:gap-8">
        <div>
          <DashboardSectionLabel>Current focus</DashboardSectionLabel>
          <p className="mt-3 text-lg font-medium tracking-tight text-neutral-900 md:text-xl">
            {data.label}
          </p>
        </div>
        {data.description ? (
          <p className="max-w-xl text-sm leading-relaxed text-neutral-600 md:text-right md:text-[0.9375rem]">
            {data.description}
          </p>
        ) : null}
      </div>
    </DashboardCard>
  )
}
