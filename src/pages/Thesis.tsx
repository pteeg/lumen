import { useMemo, useState } from 'react'
import { ResearchQuestionSection } from '../components/dashboard'
import { Textarea } from '../components/ui/Field'
import { useInterviewGuideWorkspaceContext } from '../context/InterviewGuideWorkspaceContext'
import type { DashboardResearchQuestion } from '../types/dashboard'

export function Thesis() {
  const [text, setText] = useState('')
  const {
    researchQuestion: mainResearchQuestion,
    researchAim,
    subQuestions,
    saveDashboardResearchQuestion,
  } = useInterviewGuideWorkspaceContext()

  const researchQuestion = useMemo(
    (): DashboardResearchQuestion => ({
      mainQuestion: mainResearchQuestion,
      subQuestions,
      researchAim,
    }),
    [mainResearchQuestion, subQuestions, researchAim],
  )

  return (
    <div className="space-y-8 md:space-y-10">
      <ResearchQuestionSection
        data={researchQuestion}
        onSave={saveDashboardResearchQuestion}
      />
      <Textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        aria-label="Thesis"
        placeholder="Start writing…"
        rows={20}
        className="min-h-[min(32rem,60vh)] w-full resize-y"
      />
    </div>
  )
}
