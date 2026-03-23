import type { DashboardInterviewProgress } from '../../types/dashboard'
import { DashboardCard } from './DashboardCard'
import { DashboardSectionLabel } from './DashboardSectionLabel'
import { DashboardStatItem } from './DashboardStatItem'

type Props = {
  data: DashboardInterviewProgress
}

export function InterviewProgressSection({ data }: Props) {
  return (
    <DashboardCard dense>
      <DashboardSectionLabel>Interview progress</DashboardSectionLabel>
      <div className="mt-6 grid grid-cols-3 gap-4 divide-x divide-neutral-100 md:gap-6">
        <DashboardStatItem value={data.planned} label="Planned" />
        <DashboardStatItem value={data.completed} label="Completed" />
        <DashboardStatItem value={data.analysed} label="Analysed" />
      </div>
    </DashboardCard>
  )
}
