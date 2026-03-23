import type { InterviewQuestion } from '../../types/research'
import { INTERVIEW_SECTIONS } from '../../types/research'
import { Button } from '../ui/Button'
import { Input, Label, Select, Textarea } from '../ui/Field'

const priorities = ['low', 'medium', 'high'] as const
const statuses = ['draft', 'ready', 'scheduled', 'done'] as const
const audiences = ['all', 'hosts', 'guests', 'mixed'] as const

export function InterviewQuestionEditor({
  question,
  onChange,
  onDelete,
}: {
  question: InterviewQuestion
  onChange: (patch: Partial<InterviewQuestion>) => void
  onDelete: () => void
}) {
  return (
    <div className="space-y-5">
      <div>
        <Label htmlFor="qtext">Question</Label>
        <Textarea
          id="qtext"
          value={question.questionText}
          onChange={(e) => onChange({ questionText: e.target.value })}
          rows={4}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="section">Section</Label>
          <Select
            id="section"
            value={question.section}
            onChange={(e) =>
              onChange({ section: e.target.value as InterviewQuestion['section'] })
            }
          >
            {INTERVIEW_SECTIONS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </Select>
        </div>
        <div>
          <Label htmlFor="theme">Theme tag</Label>
          <Input
            id="theme"
            value={question.theme}
            onChange={(e) => onChange({ theme: e.target.value })}
            placeholder="e.g. Trust, Networks"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="rationale">Why this question is relevant</Label>
        <Textarea
          id="rationale"
          value={question.rationale}
          onChange={(e) => onChange({ rationale: e.target.value })}
          rows={4}
        />
      </div>

      <div>
        <Label htmlFor="learning">What you are trying to learn</Label>
        <Textarea
          id="learning"
          value={question.learningGoal}
          onChange={(e) => onChange({ learningGoal: e.target.value })}
          rows={3}
        />
      </div>

      <div>
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          value={question.notes}
          onChange={(e) => onChange({ notes: e.target.value })}
          rows={3}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <Label htmlFor="audience">Interview type / audience</Label>
          <Select
            id="audience"
            value={question.audienceType}
            onChange={(e) =>
              onChange({
                audienceType: e.target.value as InterviewQuestion['audienceType'],
              })
            }
          >
            {audiences.map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </Select>
        </div>
        <div>
          <Label htmlFor="priority">Priority</Label>
          <Select
            id="priority"
            value={question.priority}
            onChange={(e) =>
              onChange({
                priority: e.target.value as InterviewQuestion['priority'],
              })
            }
          >
            {priorities.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </Select>
        </div>
        <div>
          <Label htmlFor="status">Status</Label>
          <Select
            id="status"
            value={question.status}
            onChange={(e) =>
              onChange({ status: e.target.value as InterviewQuestion['status'] })
            }
          >
            {statuses.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </Select>
        </div>
      </div>

      <div className="flex items-center justify-between gap-3 border-t border-slate-100 pt-4">
        <Button
          variant="danger"
          onClick={() => {
            if (window.confirm('Delete this interview question?')) onDelete()
          }}
        >
          Delete question
        </Button>
      </div>
    </div>
  )
}
