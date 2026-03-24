import { useCallback, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Button } from '../ui/Button'
import { Dialog } from '../ui/Dialog'
import { Label, Textarea } from '../ui/Field'
import { useInterviewGuideWorkspaceContext } from '../../context/InterviewGuideWorkspaceContext'
import type { DashboardTask } from '../../types/dashboard'
import { DashboardCard } from '../dashboard/DashboardCard'
import { DashboardSectionLabel } from '../dashboard/DashboardSectionLabel'

type TaskTab = 'current' | 'completed'

function computeTaskInsertIndex(
  clientY: number,
  without: DashboardTask[],
  rowRefs: Map<string, HTMLElement>,
): number {
  for (let i = 0; i < without.length; i++) {
    const el = rowRefs.get(without[i].id)
    if (!el) continue
    const rect = el.getBoundingClientRect()
    const mid = rect.top + rect.height / 2
    if (clientY < mid) return i
  }
  return without.length
}

const tabBtnClass = (active: boolean) =>
  `border-b-2 px-1 pb-3 text-sm font-medium transition-colors whitespace-nowrap ${
    active
      ? 'border-neutral-900 text-neutral-900'
      : 'border-transparent text-neutral-500 hover:text-neutral-800'
  }`

export function TasksManager() {
  const {
    dashboardTasksActive,
    dashboardTasksCompleted,
    addDashboardTask,
    updateDashboardTask,
    deleteDashboardTask,
    reorderDashboardTasks,
  } = useInterviewGuideWorkspaceContext()

  const [tab, setTab] = useState<TaskTab>('current')

  const visibleTasks =
    tab === 'current' ? dashboardTasksActive : dashboardTasksCompleted

  const [draggingTaskId, setDraggingTaskId] = useState<string | null>(null)
  const [insertIndex, setInsertIndex] = useState(0)
  const [ghostPos, setGhostPos] = useState({ x: 0, y: 0 })
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const [ghostSize, setGhostSize] = useState({ width: 0, height: 0 })

  const rowRefs = useRef<Map<string, HTMLElement>>(new Map())
  const tasksRef = useRef(visibleTasks)
  tasksRef.current = visibleTasks

  const tabRef = useRef(tab)
  tabRef.current = tab

  const insertIndexRef = useRef(0)
  insertIndexRef.current = insertIndex

  const reorderRef = useRef(reorderDashboardTasks)
  reorderRef.current = reorderDashboardTasks

  useEffect(() => {
    setDraggingTaskId(null)
  }, [tab])

  const setRowRef = useCallback((id: string, el: HTMLElement | null) => {
    const m = rowRefs.current
    if (el) m.set(id, el)
    else m.delete(id)
  }, [])

  const [taskModalOpen, setTaskModalOpen] = useState(false)
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null)
  const [taskDraft, setTaskDraft] = useState('')

  function openAddTask() {
    setTab('current')
    setEditingTaskId(null)
    setTaskDraft('')
    setTaskModalOpen(true)
  }

  function openEditTask(t: DashboardTask) {
    setEditingTaskId(t.id)
    setTaskDraft(t.text)
    setTaskModalOpen(true)
  }

  function saveTaskModal() {
    const trimmed = taskDraft.trim()
    if (!trimmed) return
    if (editingTaskId) {
      updateDashboardTask(editingTaskId, { text: trimmed })
    } else {
      addDashboardTask(trimmed)
    }
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

  function handleTaskPointerDown(
    e: React.PointerEvent<HTMLElement>,
    t: DashboardTask,
  ) {
    if (e.button !== 0) return
    e.preventDefault()
    e.stopPropagation()
    const el = e.currentTarget.closest('li')
    if (!el) return
    const rect = el.getBoundingClientRect()
    const list = tasksRef.current
    const startIdx = list.findIndex((x) => x.id === t.id)
    if (startIdx < 0) return

    setDragOffset({ x: e.clientX - rect.left, y: e.clientY - rect.top })
    setGhostSize({ width: rect.width, height: rect.height })
    setGhostPos({ x: e.clientX, y: e.clientY })
    setInsertIndex(startIdx)
    insertIndexRef.current = startIdx
    setDraggingTaskId(t.id)

    const draggedId = t.id
    const completedGroup = tabRef.current === 'completed'

    function onMove(ev: PointerEvent) {
      setGhostPos({ x: ev.clientX, y: ev.clientY })
      const currentList = tasksRef.current
      const without = currentList.filter((x) => x.id !== draggedId)
      const next = computeTaskInsertIndex(
        ev.clientY,
        without,
        rowRefs.current,
      )
      setInsertIndex(next)
      insertIndexRef.current = next
    }

    function cleanupListeners() {
      window.removeEventListener('pointermove', onMove, true)
      window.removeEventListener('pointerup', onUp, true)
      window.removeEventListener('pointercancel', onCancel, true)
      document.body.style.cursor = ''
      document.body.style.userSelect = ''
    }

    function onUp() {
      cleanupListeners()
      const without = tasksRef.current.filter((x) => x.id !== draggedId)
      const idx = insertIndexRef.current
      const orderedIds = [
        ...without.slice(0, idx).map((x) => x.id),
        draggedId,
        ...without.slice(idx).map((x) => x.id),
      ]
      reorderRef.current(orderedIds, completedGroup)
      setDraggingTaskId(null)
    }

    function onCancel() {
      cleanupListeners()
      setDraggingTaskId(null)
    }

    document.body.style.cursor = 'grabbing'
    document.body.style.userSelect = 'none'
    window.addEventListener('pointermove', onMove, { capture: true })
    window.addEventListener('pointerup', onUp, { capture: true })
    window.addEventListener('pointercancel', onCancel, { capture: true })
  }

  const draggedTask = draggingTaskId
    ? visibleTasks.find((x) => x.id === draggingTaskId)
    : null

  const withoutDragged = draggingTaskId
    ? visibleTasks.filter((x) => x.id !== draggingTaskId)
    : visibleTasks

  const previewSlots: Array<
    { kind: 'placeholder' } | { kind: 'task'; t: DashboardTask }
  > = []
  if (draggingTaskId) {
    for (let i = 0; i < withoutDragged.length; i++) {
      if (i === insertIndex) {
        previewSlots.push({ kind: 'placeholder' })
      }
      previewSlots.push({ kind: 'task', t: withoutDragged[i] })
    }
    if (insertIndex === withoutDragged.length) {
      previewSlots.push({ kind: 'placeholder' })
    }
  }

  function renderTaskRow(t: DashboardTask) {
    return (
      <li
        key={t.id}
        ref={(el) => setRowRef(t.id, el)}
        className="rounded-[1.25rem] border border-neutral-200/80 bg-white p-4 shadow-[0_1px_2px_rgba(15,23,42,0.04)] transition-[transform,opacity] duration-150 ease-out"
      >
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={t.completed}
            onChange={(e) =>
              updateDashboardTask(t.id, { completed: e.target.checked })
            }
            className="h-4 w-4 shrink-0 rounded border-neutral-300 text-neutral-900 focus:ring-blue-500/30"
            aria-label={t.completed ? 'Mark as not done' : 'Mark as done'}
          />
          <button
            type="button"
            aria-label="Drag to reorder"
            onPointerDown={(e) => handleTaskPointerDown(e, t)}
            className="touch-none shrink-0 cursor-grab rounded-md px-1 py-1 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-600 active:cursor-grabbing"
          >
            <span
              aria-hidden
              className="inline-block select-none text-lg leading-none tracking-tighter"
            >
              ⋮⋮
            </span>
          </button>
          <p className="min-w-0 flex-1 whitespace-pre-wrap text-sm leading-relaxed text-neutral-800">
            {t.text}
          </p>
          <Button
            variant="ghost"
            className="-mr-1 shrink-0 px-2 py-1 text-xs font-medium text-neutral-600 hover:text-neutral-900"
            aria-label="Edit task"
            onPointerDown={(e) => e.preventDefault()}
            onClick={() => openEditTask(t)}
          >
            Edit
          </Button>
        </div>
      </li>
    )
  }

  const ghost =
    draggingTaskId && draggedTask && ghostSize.width > 0 ? (
      <div
        className="pointer-events-none fixed z-[9999] max-h-48 overflow-hidden rounded-[1.25rem] border border-neutral-200/80 bg-white p-4 shadow-lg ring-2 ring-neutral-300/40"
        style={{
          left: ghostPos.x - dragOffset.x,
          top: ghostPos.y - dragOffset.y,
          width: ghostSize.width,
          minHeight: ghostSize.height,
        }}
        aria-hidden
      >
        <p className="whitespace-pre-wrap text-sm leading-relaxed text-neutral-900">
          {draggedTask.text}
        </p>
      </div>
    ) : null

  const emptyCurrent =
    tab === 'current' &&
    visibleTasks.length === 0 &&
    !draggingTaskId
  const emptyCompleted =
    tab === 'completed' &&
    visibleTasks.length === 0 &&
    !draggingTaskId

  return (
    <>
      <DashboardCard dense surface="transparent">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <DashboardSectionLabel>Tasks</DashboardSectionLabel>
          <Button
            variant="dark"
            className="shrink-0 text-sm"
            type="button"
            onClick={openAddTask}
          >
            Add task
          </Button>
        </div>

        <div
          className="mt-4 flex flex-wrap gap-x-6 gap-y-2 border-b border-neutral-200/80"
          role="tablist"
          aria-label="Task lists"
        >
          <button
            type="button"
            role="tab"
            aria-selected={tab === 'current'}
            className={tabBtnClass(tab === 'current')}
            onClick={() => setTab('current')}
          >
            Current tasks
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={tab === 'completed'}
            className={tabBtnClass(tab === 'completed')}
            onClick={() => setTab('completed')}
          >
            Completed tasks
          </button>
        </div>

        <ul className="mt-4 space-y-3" role="tabpanel">
          {emptyCurrent ? (
            <li className="rounded-xl border border-dashed border-neutral-200/90 bg-neutral-50/40 px-4 py-8 text-center text-sm text-neutral-500">
              No current tasks. Add one or complete tasks from this list.
            </li>
          ) : emptyCompleted ? (
            <li className="rounded-xl border border-dashed border-neutral-200/90 bg-neutral-50/40 px-4 py-8 text-center text-sm text-neutral-500">
              No completed tasks yet.
            </li>
          ) : draggingTaskId ? (
            previewSlots.map((slot, slotIndex) => {
              if (slot.kind === 'placeholder') {
                return (
                  <li
                    key={`task-ph-${slotIndex}`}
                    className="rounded-[1.25rem] border-2 border-dashed border-neutral-300/90 bg-neutral-50/50 shadow-none"
                    style={{ minHeight: ghostSize.height || undefined }}
                    aria-hidden
                  />
                )
              }
              return renderTaskRow(slot.t)
            })
          ) : (
            visibleTasks.map((t) => renderTaskRow(t))
          )}
        </ul>
      </DashboardCard>

      {typeof document !== 'undefined' && ghost
        ? createPortal(ghost, document.body)
        : null}

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
              if (e.key === 'Enter' && (e.metaKey || e.ctrlKey) && taskDraft.trim()) {
                e.preventDefault()
                saveTaskModal()
              }
            }}
          />
        </div>
      </Dialog>
    </>
  )
}
