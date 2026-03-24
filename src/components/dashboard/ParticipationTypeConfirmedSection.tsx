import { DashboardCard } from './DashboardCard'
import { DashboardSectionLabel } from './DashboardSectionLabel'
import { DashboardStatItem } from './DashboardStatItem'

/** Plural labels for stat row copy (e.g. "3/5 Promoters"). */
const TYPE_DISPLAY_LABEL: Record<string, string> = {
  'Venue owner': 'Venue owners',
  Promoter: 'Promoters',
  'Artist and booker': 'Artists & bookers',
  'Booker (employed)': 'Bookers (employed)',
  Manager: 'Managers',
  Other: 'Other (no type)',
}

type TypeStat = { typeLabel: string; total: number; confirmed: number }

type Props = {
  typeStats: TypeStat[]
}

export function ParticipationTypeConfirmedSection({ typeStats }: Props) {
  return (
    <DashboardCard dense>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <DashboardSectionLabel>Participant types confirmed</DashboardSectionLabel>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-6 lg:grid-cols-5 lg:gap-4">
        {typeStats.map(({ typeLabel, total, confirmed }) => (
          <DashboardStatItem
            key={typeLabel}
            value={`${confirmed}/${total}`}
            label={TYPE_DISPLAY_LABEL[typeLabel] ?? typeLabel}
          />
        ))}
      </div>
    </DashboardCard>
  )
}
