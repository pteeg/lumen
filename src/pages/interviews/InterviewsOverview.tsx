import { DashboardCard } from '../../components/dashboard/DashboardCard'
import { DashboardSectionLabel } from '../../components/dashboard/DashboardSectionLabel'
import { OverviewThoughtsCard } from '../../components/interviewGuide/OverviewThoughtsCard'
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
    <div className="space-y-6">
      <DashboardCard dense>
        <p className="text-sm leading-relaxed text-neutral-800">
          You only need to walk out of each interview knowing{' '}
          <strong className="font-semibold text-neutral-900">4</strong> things:
        </p>
        <ol className="mt-5 space-y-5 text-sm text-neutral-800">
          <li>
            <p className="font-semibold text-neutral-900">
              1. How information flows
            </p>
            <p className="mt-1 pl-0 text-neutral-600 italic">
              → &ldquo;who do they talk to?&rdquo;
            </p>
          </li>
          <li>
            <p className="font-semibold text-neutral-900">
              2. How awareness happens
            </p>
            <p className="mt-1 pl-0 text-neutral-600 italic">
              → &ldquo;how do they hear about things?&rdquo;
            </p>
          </li>
          <li>
            <p className="font-semibold text-neutral-900">
              3. Who influences decisions
            </p>
            <p className="mt-1 pl-0 text-neutral-600 italic">
              → &ldquo;who do they trust / listen to?&rdquo;
            </p>
          </li>
          <li>
            <p className="font-semibold text-neutral-900">
              4. Why they haven&rsquo;t adopted platforms
            </p>
            <p className="mt-1 pl-0 text-neutral-600 italic">
              → &ldquo;what&rsquo;s stopping them?&rdquo;
            </p>
          </li>
        </ol>
        <p className="mt-6 text-sm font-medium text-neutral-900">That&rsquo;s it.</p>
        <p className="mt-2 text-sm text-neutral-600">
          If you get those → your project works.
        </p>
      </DashboardCard>

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

      <OverviewThoughtsCard />
    </div>
  )
}
