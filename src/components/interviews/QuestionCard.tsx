import type { InterviewQuestion } from '../../types/research'
import { Badge } from '../ui/Badge'
import { Button } from '../ui/Button'

function priorityTone(p: InterviewQuestion['priority']) {
  if (p === 'high') return 'danger' as const
  if (p === 'medium') return 'warning' as const
  return 'default' as const
}

function statusTone(s: InterviewQuestion['status']) {
  if (s === 'ready') return 'accent' as const
  if (s === 'done') return 'success' as const
  return 'default' as const
}

export function QuestionCard({
  question,
  onOpen,
  onMove,
  canMoveUp,
  canMoveDown,
}: {
  question: InterviewQuestion
  onOpen: () => void
  onMove: (direction: 'up' | 'down') => void
  canMoveUp: boolean
  canMoveDown: boolean
}) {
  return (
    <div
      role="button"
      tabIndex={0}
      aria-label="Open question details"
      onClick={onOpen}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onOpen()
        }
      }}
      className="group w-full cursor-pointer rounded-xl border border-slate-200/90 bg-white p-4 text-left shadow-sm transition hover:border-slate-300 hover:shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-medium leading-snug text-slate-900 line-clamp-3">
            {question.questionText}
          </p>
          {question.rationale ? (
            <p className="mt-2 text-xs leading-relaxed text-slate-500 line-clamp-2">
              {question.rationale}
            </p>
          ) : null}
        </div>
        <div className="flex shrink-0 flex-col items-end gap-2">
          <div className="flex flex-wrap justify-end gap-1.5">
            {question.theme ? (
              <Badge tone="accent">{question.theme}</Badge>
            ) : null}
            <Badge tone={priorityTone(question.priority)}>
              {question.priority}
            </Badge>
            <Badge tone={statusTone(question.status)}>{question.status}</Badge>
          </div>
          <div
            className="flex gap-1 opacity-0 transition group-hover:opacity-100"
            onClick={(e) => e.stopPropagation()}
          >
            <Button
              variant="ghost"
              className="!px-2 !py-1 text-xs"
              disabled={!canMoveUp}
              onClick={() => onMove('up')}
            >
              Up
            </Button>
            <Button
              variant="ghost"
              className="!px-2 !py-1 text-xs"
              disabled={!canMoveDown}
              onClick={() => onMove('down')}
            >
              Down
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
