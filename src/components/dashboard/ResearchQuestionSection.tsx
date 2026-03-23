import { useState } from 'react'
import type { DashboardResearchQuestion } from '../../types/dashboard'
import { Button } from '../ui/Button'
import { Dialog } from '../ui/Dialog'
import { Label, Textarea } from '../ui/Field'
import { DashboardCard } from './DashboardCard'
import { DashboardSectionLabel } from './DashboardSectionLabel'

type Props = {
  data: DashboardResearchQuestion
  /** When set, shows Edit and persists changes via this callback */
  onSave?: (next: DashboardResearchQuestion) => void
}

function toSubQuestionsText(lines: string[] | undefined): string {
  return (lines ?? []).join('\n')
}

function parseSubQuestionsText(raw: string): string[] {
  return raw
    .split('\n')
    .map((s) => s.trim())
    .filter(Boolean)
}

export function ResearchQuestionSection({ data, onSave }: Props) {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [mainQuestion, setMainQuestion] = useState('')
  const [researchAim, setResearchAim] = useState('')
  const [subQuestionsText, setSubQuestionsText] = useState('')

  function openEdit() {
    setMainQuestion(data.mainQuestion)
    setResearchAim(data.researchAim ?? '')
    setSubQuestionsText(toSubQuestionsText(data.subQuestions))
    setDialogOpen(true)
  }

  function handleSave() {
    const trimmed = mainQuestion.trim()
    if (!trimmed || !onSave) return
    onSave({
      mainQuestion: trimmed,
      researchAim: researchAim.trim() || undefined,
      subQuestions: parseSubQuestionsText(subQuestionsText),
    })
    setDialogOpen(false)
  }

  return (
    <DashboardCard>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <DashboardSectionLabel>Research question</DashboardSectionLabel>
        {onSave ? (
          <Button
            type="button"
            variant="ghost"
            className="shrink-0 px-3 py-1.5 text-xs font-medium text-neutral-600 hover:text-neutral-900"
            onClick={openEdit}
          >
            {data.mainQuestion.trim() ? 'Edit' : 'Add'}
          </Button>
        ) : null}
      </div>

      {data.mainQuestion.trim() ? (
        <h1 className="mt-4 w-full min-w-0 max-w-none text-2xl font-semibold leading-snug tracking-tight text-neutral-900 md:text-[1.75rem] md:leading-[1.35]">
          {data.mainQuestion}
        </h1>
      ) : (
        <p className="mt-4 w-full min-w-0 text-pretty text-base leading-relaxed text-neutral-500 md:text-lg">
          No research question yet. Use Add to enter your main question, aim, and
          sub-questions.
        </p>
      )}

      {data.researchAim ? (
        <p className="mt-5 w-full min-w-0 max-w-none text-sm leading-relaxed text-neutral-600 md:text-[0.9375rem]">
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

      {onSave ? (
        <Dialog
          open={dialogOpen}
          title="Research question"
          onClose={() => setDialogOpen(false)}
          footer={
            <>
              <Button variant="secondary" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                variant="dark"
                onClick={handleSave}
                disabled={!mainQuestion.trim()}
              >
                Save
              </Button>
            </>
          }
        >
          <div className="space-y-4">
            <div>
              <Label htmlFor="rq-main">Main question</Label>
              <Textarea
                id="rq-main"
                value={mainQuestion}
                onChange={(e) => setMainQuestion(e.target.value)}
                rows={4}
                placeholder="Your primary research question…"
              />
            </div>
            <div>
              <Label htmlFor="rq-aim">Research aim (optional)</Label>
              <Textarea
                id="rq-aim"
                value={researchAim}
                onChange={(e) => setResearchAim(e.target.value)}
                rows={3}
                placeholder="One line framing what you want to learn or argue…"
              />
            </div>
            <div>
              <Label htmlFor="rq-subs">Sub-questions (optional)</Label>
              <Textarea
                id="rq-subs"
                value={subQuestionsText}
                onChange={(e) => setSubQuestionsText(e.target.value)}
                rows={5}
                placeholder="One sub-question per line…"
              />
            </div>
          </div>
        </Dialog>
      ) : null}
    </DashboardCard>
  )
}
