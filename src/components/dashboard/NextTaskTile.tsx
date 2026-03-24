import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useInterviewGuideWorkspaceContext } from '../../context/InterviewGuideWorkspaceContext'
import { Button } from '../ui/Button'
import { Dialog } from '../ui/Dialog'
import { Label, Textarea } from '../ui/Field'
import { DashboardCard } from './DashboardCard'
import { DashboardSectionLabel } from './DashboardSectionLabel'

type Props = {
  className?: string
}

export function NextTaskTile({ className = '' }: Props) {
  const { dashboardTasksActive, updateDashboardTask, deleteDashboardTask } =
    useInterviewGuideWorkspaceContext()
  const next = dashboardTasksActive[0]

  const [taskModalOpen, setTaskModalOpen] = useState(false)
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null)
  const [taskDraft, setTaskDraft] = useState('')

  function openEditTask() {
    if (!next) return
    setEditingTaskId(next.id)
    setTaskDraft(next.text)
    setTaskModalOpen(true)
  }

  function saveTaskModal() {
    if (!editingTaskId) return
    const trimmed = taskDraft.trim()
    if (!trimmed) return
    updateDashboardTask(editingTaskId, { text: trimmed })
    setTaskModalOpen(false)
    setEditingTaskId(null)
    setTaskDraft('')
  }

  function deleteTaskFromModal() {
    if (!editingTaskId) return
    deleteDashboardTask(editingTaskId)
    setTaskModalOpen(false)
    setEditingTaskId(null)
    setTaskDraft('')
  }

  return (
    <DashboardCard
      dense
      surface="transparent"
      className={`flex flex-col ${className}`}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <DashboardSectionLabel>Next task</DashboardSectionLabel>
        <Link
          to="/tasks"
          className="shrink-0 text-sm font-medium text-neutral-700 underline decoration-neutral-400 underline-offset-2 transition hover:text-neutral-900 hover:decoration-neutral-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500"
        >
          All tasks
        </Link>
      </div>

      {next ? (
        <div className="mt-5 rounded-[1.25rem] border border-neutral-200/80 bg-white p-4 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={next.completed}
              onChange={(e) =>
                updateDashboardTask(next.id, {
                  completed: e.target.checked,
                })
              }
              className="h-4 w-4 shrink-0 rounded border-neutral-300 text-neutral-900 focus:ring-blue-500/30"
              aria-label={next.completed ? 'Mark as not done' : 'Mark as done'}
            />
            <p className="min-w-0 flex-1 whitespace-pre-wrap text-sm leading-relaxed text-neutral-800">
              {next.text}
            </p>
            <Button
              variant="ghost"
              className="-mr-1 shrink-0 px-2 py-1 text-xs font-medium text-neutral-600 hover:text-neutral-900"
              aria-label="Edit task"
              onClick={openEditTask}
            >
              Edit
            </Button>
          </div>
        </div>
      ) : (
        <p className="mt-5 text-sm leading-relaxed text-neutral-500">
          No tasks yet. Add some on the Tasks page.
        </p>
      )}

      <Dialog
        open={taskModalOpen}
        title={editingTaskId ? 'Edit task' : 'New task'}
        onClose={() => {
          setTaskModalOpen(false)
          setEditingTaskId(null)
          setTaskDraft('')
        }}
        footer={
          <div className="flex w-full flex-wrap items-center gap-2">
            {editingTaskId ? (
              <Button
                variant="danger"
                type="button"
                className="text-sm"
                onClick={deleteTaskFromModal}
              >
                Delete task
              </Button>
            ) : null}
            <div className="ml-auto flex flex-wrap gap-2">
              <Button
                variant="secondary"
                type="button"
                onClick={() => {
                  setTaskModalOpen(false)
                  setEditingTaskId(null)
                  setTaskDraft('')
                }}
              >
                Cancel
              </Button>
              <Button
                variant="dark"
                type="button"
                onClick={saveTaskModal}
                disabled={!taskDraft.trim()}
              >
                Save
              </Button>
            </div>
          </div>
        }
      >
        <div>
          <Label htmlFor="tasks-page-task-text">Task</Label>
          <Textarea
            id="tasks-page-task-text"
            value={taskDraft}
            onChange={(e) => setTaskDraft(e.target.value)}
            placeholder="What do you need to do?"
            rows={4}
            autoFocus
            onKeyDown={(e) => {
              if (
                e.key === 'Enter' &&
                (e.metaKey || e.ctrlKey) &&
                taskDraft.trim()
              ) {
                e.preventDefault()
                saveTaskModal()
              }
            }}
          />
        </div>
      </Dialog>
    </DashboardCard>
  )
}
