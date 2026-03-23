import type { DashboardQuestionBank } from '../../types/dashboard'
import { DashboardCard } from './DashboardCard'
import { DashboardSectionLabel } from './DashboardSectionLabel'
import { DashboardStatItem } from './DashboardStatItem'

type Props = {
  data: DashboardQuestionBank
}

export function QuestionBankSnapshotSection({ data }: Props) {
  return (
    <DashboardCard dense>
      <DashboardSectionLabel>Question bank</DashboardSectionLabel>
      <div className="mt-6 grid grid-cols-3 gap-4 divide-x divide-neutral-100 md:gap-6">
        <DashboardStatItem value={data.total} label="Total" />
        <DashboardStatItem value={data.refined} label="Refined" />
        <DashboardStatItem value={data.final} label="Final" />
      </div>
    </DashboardCard>
  )
}
