import type { FindingsTheme, InterviewQuestion } from '../../types/research'
import { Button } from '../ui/Button'
import { Input, Label, Textarea } from '../ui/Field'

export function FindingsThemeEditor({
  theme,
  interviewQuestions,
  onChange,
  onDelete,
}: {
  theme: FindingsTheme
  interviewQuestions: InterviewQuestion[]
  onChange: (patch: Partial<FindingsTheme>) => void
  onDelete: () => void
}) {
  function toggleQuestion(id: string) {
    const set = new Set(theme.linkedInterviewQuestionIds)
    if (set.has(id)) set.delete(id)
    else set.add(id)
    onChange({ linkedInterviewQuestionIds: [...set] })
  }

  return (
    <div className="space-y-5">
      <div>
        <Label htmlFor="ftitle">Theme title</Label>
        <Input
          id="ftitle"
          value={theme.title}
          onChange={(e) => onChange({ title: e.target.value })}
        />
      </div>

      <div>
        <Label htmlFor="fdesc">Description</Label>
        <Textarea
          id="fdesc"
          value={theme.description}
          onChange={(e) => onChange({ description: e.target.value })}
          rows={4}
        />
      </div>

      <div>
        <Label htmlFor="fevidence">Possible interview evidence</Label>
        <Textarea
          id="fevidence"
          value={theme.possibleEvidence}
          onChange={(e) => onChange({ possibleEvidence: e.target.value })}
          rows={4}
          placeholder="Quotes, observations, patterns you expect might cluster here…"
        />
      </div>

      <div>
        <Label htmlFor="fessay">Essay structure sketch</Label>
        <Textarea
          id="fessay"
          value={theme.essayStructure}
          onChange={(e) => onChange({ essayStructure: e.target.value })}
          rows={4}
          placeholder="How this theme might appear as a section or thread in the final essay…"
        />
      </div>

      <div>
        <Label htmlFor="fnotes">Notes</Label>
        <Textarea
          id="fnotes"
          value={theme.notes}
          onChange={(e) => onChange({ notes: e.target.value })}
          rows={3}
        />
      </div>

      <div>
        <p className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-500">
          Linked interview questions
        </p>
        <div className="max-h-56 space-y-2 overflow-y-auto rounded-lg border border-slate-200 bg-slate-50/50 p-3">
          {interviewQuestions.length === 0 ? (
            <p className="text-sm text-slate-600">No interview questions yet.</p>
          ) : (
            interviewQuestions.map((q) => (
              <label
                key={q.id}
                className="flex cursor-pointer gap-3 rounded-md px-2 py-2 hover:bg-white"
              >
                <input
                  type="checkbox"
                  className="mt-1"
                  checked={theme.linkedInterviewQuestionIds.includes(q.id)}
                  onChange={() => toggleQuestion(q.id)}
                />
                <span className="min-w-0">
                  <span className="block text-xs text-slate-500">{q.section}</span>
                  <span className="block text-sm text-slate-900">{q.questionText}</span>
                </span>
              </label>
            ))
          )}
        </div>
      </div>

      <div className="flex items-center justify-between gap-3 border-t border-slate-100 pt-4">
        <Button
          variant="danger"
          onClick={() => {
            if (window.confirm('Delete this findings theme?')) onDelete()
          }}
        >
          Delete theme
        </Button>
      </div>
    </div>
  )
}
