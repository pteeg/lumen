import { NavLink } from 'react-router-dom'
import type { InterviewParticipationRow } from '../../types/interviewGuide'

const tabClass = ({ isActive }: { isActive: boolean }) =>
  `border-b-2 px-1 pb-3 text-sm font-medium transition-colors whitespace-nowrap ${
    isActive
      ? 'border-neutral-900 text-neutral-900'
      : 'border-transparent text-neutral-500 hover:text-neutral-800'
  }`

type Props = {
  participants: InterviewParticipationRow[]
}

export function FindingsPageTabs({ participants }: Props) {
  return (
    <div className="mb-6 flex flex-wrap gap-x-6 gap-y-2 md:mb-7">
      {participants.map((p) => (
        <NavLink
          key={p.id}
          to={`/findings/${p.id}`}
          className={tabClass}
        >
          {p.name.trim() || 'Unnamed'}
        </NavLink>
      ))}
    </div>
  )
}
