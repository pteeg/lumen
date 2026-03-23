import type { DashboardResearchQuestion } from '../../types/dashboard'
import { DashboardCard } from './DashboardCard'
import { DashboardSectionLabel } from './DashboardSectionLabel'

type Props = {
  data: DashboardResearchQuestion
}

export function ResearchQuestionSection({ data }: Props) {
  return (
    <DashboardCard>
      <DashboardSectionLabel>Research question</DashboardSectionLabel>
      <h1 className="mt-4 max-w-4xl text-balance text-2xl font-semibold leading-snug tracking-tight text-neutral-900 md:text-[1.75rem] md:leading-[1.35]">
        {data.mainQuestion}
      </h1>

      {data.researchAim ? (
        <p className="mt-5 max-w-3xl text-balance text-sm leading-relaxed text-neutral-600 md:text-[0.9375rem]">
          {data.researchAim}
        </p>
      ) : null}

      {data.subQuestions?.length ? (
        <div className="mt-8 border-t border-neutral-100 pt-8">
          <DashboardSectionLabel>Sub-questions</DashboardSectionLabel>
          <ul className="mt-4 space-y-3 text-sm leading-relaxed text-neutral-600 md:text-[0.9375rem]">
            {data.subQuestions.map((q) => (
              <li key={q} className="flex gap-3">
                <span
                  className="mt-2 h-1 w-1 shrink-0 rounded-full bg-neutral-400"
                  aria-hidden
                />
                <span>{q}</span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </DashboardCard>
  )
}
