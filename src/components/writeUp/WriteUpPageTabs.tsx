import { NavLink } from 'react-router-dom'
import { WRITE_UP_SECTIONS } from '../../lib/writeUpSections'

const tabClass = ({ isActive }: { isActive: boolean }) =>
  `border-b-2 px-1 pb-3 text-sm font-medium transition-colors whitespace-nowrap ${
    isActive
      ? 'border-neutral-900 text-neutral-900'
      : 'border-transparent text-neutral-500 hover:text-neutral-800'
  }`

export function WriteUpPageTabs() {
  return (
    <div className="mb-6 flex flex-wrap gap-x-6 gap-y-2 md:mb-7">
      {WRITE_UP_SECTIONS.map((s) => (
        <NavLink
          key={s.id}
          to={`/write-up/${s.id}`}
          className={tabClass}
        >
          {s.label}
        </NavLink>
      ))}
    </div>
  )
}
