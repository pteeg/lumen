import { NavLink } from 'react-router-dom'

const tabClass = ({ isActive }: { isActive: boolean }) =>
  `border-b-2 px-1 pb-3 text-sm font-medium transition-colors ${
    isActive
      ? 'border-neutral-900 text-neutral-900'
      : 'border-transparent text-neutral-500 hover:text-neutral-800'
  }`

export function InterviewPageTabs() {
  return (
    <div className="mb-6 flex gap-8 md:mb-7">
      <NavLink to="/interviews/overview" className={tabClass}>
        Overview
      </NavLink>
      <NavLink to="/interviews" end className={tabClass}>
        Structure
      </NavLink>
    </div>
  )
}
