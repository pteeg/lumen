import { DashboardCard } from '../../components/dashboard/DashboardCard'
import { DashboardSectionLabel } from '../../components/dashboard/DashboardSectionLabel'
import { useInterviewGuideWorkspaceContext } from '../../context/InterviewGuideWorkspaceContext'

function sortSections<T extends { order: number }>(items: T[]) {
  return [...items].sort((a, b) => a.order - b.order)
}

export function InterviewsOverview() {
  const { sections, questions } = useInterviewGuideWorkspaceContext()

  const bySection = sortSections(sections).map((s) => ({
    section: s,
    count: questions.filter((q) => q.sectionId === s.id).length,
  }))

  return (
    <DashboardCard dense>
      <DashboardSectionLabel>By section</DashboardSectionLabel>

      <ul className="mt-4 divide-y divide-neutral-100">
        {bySection.length === 0 ? (
          <li className="py-6 text-center text-sm text-neutral-500">
            No sections yet. Add them in the Structure tab.
          </li>
        ) : (
          bySection.map(({ section, count }) => (
            <li
              key={section.id}
              className="flex items-baseline justify-between gap-4 py-3 first:pt-0 last:pb-0"
            >
              <span className="text-sm font-medium text-neutral-900">
                {section.title}
              </span>
              <span className="shrink-0 text-sm tabular-nums text-neutral-500">
                {count} question{count === 1 ? '' : 's'}
              </span>
            </li>
          ))
        )}
      </ul>
    </DashboardCard>
  )
}
