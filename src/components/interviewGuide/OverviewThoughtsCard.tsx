import { useCallback, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Button } from '../ui/Button'
import { Dialog } from '../ui/Dialog'
import { Label, Textarea } from '../ui/Field'
import { DashboardCard } from '../dashboard/DashboardCard'
import { DashboardSectionLabel } from '../dashboard/DashboardSectionLabel'
import { useInterviewGuideWorkspaceContext } from '../../context/InterviewGuideWorkspaceContext'
import type { InterviewGuideThought } from '../../types/interviewGuide'

function computeThoughtInsertIndex(
  clientY: number,
  without: InterviewGuideThought[],
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

export function OverviewThoughtsCard() {
  const {
    thoughts,
    addThought,
    updateThought,
    deleteThought,
    reorderThoughts,
  } = useInterviewGuideWorkspaceContext()

  const [draggingThoughtId, setDraggingThoughtId] = useState<string | null>(
    null,
  )
  const [insertIndex, setInsertIndex] = useState(0)
  const [ghostPos, setGhostPos] = useState({ x: 0, y: 0 })
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const [ghostSize, setGhostSize] = useState({ width: 0, height: 0 })

  const rowRefs = useRef<Map<string, HTMLElement>>(new Map())
  const thoughtsRef = useRef(thoughts)
  thoughtsRef.current = thoughts

  const insertIndexRef = useRef(0)
  insertIndexRef.current = insertIndex

  const reorderRef = useRef(reorderThoughts)
  reorderRef.current = reorderThoughts

  const setRowRef = useCallback((id: string, el: HTMLElement | null) => {
    const m = rowRefs.current
    if (el) m.set(id, el)
    else m.delete(id)
  }, [])

  const [thoughtModalOpen, setThoughtModalOpen] = useState(false)
  const [editingThoughtId, setEditingThoughtId] = useState<string | null>(null)
  const [thoughtDraft, setThoughtDraft] = useState('')

  function openAddThought() {
    setEditingThoughtId(null)
    setThoughtDraft('')
    setThoughtModalOpen(true)
  }

  function openEditThought(t: InterviewGuideThought) {
    setEditingThoughtId(t.id)
    setThoughtDraft(t.text)
    setThoughtModalOpen(true)
  }

  function saveThoughtModal() {
    const trimmed = thoughtDraft.trim()
    if (!trimmed) return
    if (editingThoughtId) {
      updateThought(editingThoughtId, { text: trimmed })
    } else {
      addThought(trimmed)
    }
    setThoughtModalOpen(false)
    setEditingThoughtId(null)
    setThoughtDraft('')
  }

  function handleThoughtPointerDown(
    e: React.PointerEvent<HTMLElement>,
    t: InterviewGuideThought,
  ) {
    if (e.button !== 0) return
    e.preventDefault()
    e.stopPropagation()
    const el = e.currentTarget.closest('li')
    if (!el) return
    const rect = el.getBoundingClientRect()
    const list = thoughtsRef.current
    const startIdx = list.findIndex((x) => x.id === t.id)
    if (startIdx < 0) return

    setDragOffset({ x: e.clientX - rect.left, y: e.clientY - rect.top })
    setGhostSize({ width: rect.width, height: rect.height })
    setGhostPos({ x: e.clientX, y: e.clientY })
    setInsertIndex(startIdx)
    insertIndexRef.current = startIdx
    setDraggingThoughtId(t.id)

    const draggedId = t.id

    function onMove(ev: PointerEvent) {
      setGhostPos({ x: ev.clientX, y: ev.clientY })
      const currentList = thoughtsRef.current
      const without = currentList.filter((x) => x.id !== draggedId)
      const next = computeThoughtInsertIndex(
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
      const without = thoughtsRef.current.filter((x) => x.id !== draggedId)
      const idx = insertIndexRef.current
      const orderedIds = [
        ...without.slice(0, idx).map((x) => x.id),
        draggedId,
        ...without.slice(idx).map((x) => x.id),
      ]
      reorderRef.current(orderedIds)
      setDraggingThoughtId(null)
    }

    function onCancel() {
      cleanupListeners()
      setDraggingThoughtId(null)
    }

    document.body.style.cursor = 'grabbing'
    document.body.style.userSelect = 'none'
    window.addEventListener('pointermove', onMove, { capture: true })
    window.addEventListener('pointerup', onUp, { capture: true })
    window.addEventListener('pointercancel', onCancel, { capture: true })
  }

  const draggedThought = draggingThoughtId
    ? thoughts.find((x) => x.id === draggingThoughtId)
    : null

  const withoutDragged = draggingThoughtId
    ? thoughts.filter((x) => x.id !== draggingThoughtId)
    : thoughts

  const previewSlots: Array<
    { kind: 'placeholder' } | { kind: 'thought'; t: InterviewGuideThought }
  > = []
  if (draggingThoughtId) {
    for (let i = 0; i < withoutDragged.length; i++) {
      if (i === insertIndex) {
        previewSlots.push({ kind: 'placeholder' })
      }
      previewSlots.push({ kind: 'thought', t: withoutDragged[i] })
    }
    if (insertIndex === withoutDragged.length) {
      previewSlots.push({ kind: 'placeholder' })
    }
  }

  function renderThoughtTile(t: InterviewGuideThought) {
    return (
      <li
        key={t.id}
        ref={(el) => setRowRef(t.id, el)}
        className="rounded-[1.25rem] border border-neutral-200/80 bg-white p-4 shadow-[0_1px_2px_rgba(15,23,42,0.04)] transition-[transform,opacity] duration-150 ease-out"
      >
        <div className="flex items-center gap-2">
          <button
            type="button"
            aria-label="Drag to reorder"
            onPointerDown={(e) => handleThoughtPointerDown(e, t)}
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
            aria-label="Edit thought"
            onPointerDown={(e) => e.preventDefault()}
            onClick={() => openEditThought(t)}
          >
            Edit
          </Button>
          <Button
            variant="ghost"
            className="shrink-0 px-2 py-1 text-xs text-neutral-500 hover:text-red-700"
            aria-label="Delete thought"
            onPointerDown={(e) => e.preventDefault()}
            onClick={() => deleteThought(t.id)}
          >
            Delete
          </Button>
        </div>
      </li>
    )
  }

  const ghost =
    draggingThoughtId && draggedThought && ghostSize.width > 0 ? (
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
          {draggedThought.text}
        </p>
      </div>
    ) : null

  return (
    <>
      <DashboardCard dense>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <DashboardSectionLabel>Thoughts to bear in mind</DashboardSectionLabel>
          <Button
            variant="dark"
            className="shrink-0 text-sm"
            type="button"
            onClick={openAddThought}
          >
            Add thought
          </Button>
        </div>

        <ul className="mt-4 space-y-3">
          {thoughts.length === 0 && !draggingThoughtId ? (
            <li className="rounded-xl border border-dashed border-neutral-200/90 bg-neutral-50/40 px-4 py-8 text-center text-sm text-neutral-500">
              No thoughts yet. Add reminders you want visible on this overview.
            </li>
          ) : draggingThoughtId ? (
            previewSlots.map((slot, slotIndex) => {
              if (slot.kind === 'placeholder') {
                return (
                  <li
                    key={`thought-ph-${slotIndex}`}
                    className="rounded-[1.25rem] border-2 border-dashed border-neutral-300/90 bg-neutral-50/50 shadow-none"
                    style={{ minHeight: ghostSize.height || undefined }}
                    aria-hidden
                  />
                )
              }
              return renderThoughtTile(slot.t)
            })
          ) : (
            thoughts.map((t) => renderThoughtTile(t))
          )}
        </ul>
      </DashboardCard>

      {typeof document !== 'undefined' && ghost
        ? createPortal(ghost, document.body)
        : null}

      <Dialog
        open={thoughtModalOpen}
        title={editingThoughtId ? 'Edit thought' : 'New thought'}
        onClose={() => {
          setThoughtModalOpen(false)
          setEditingThoughtId(null)
          setThoughtDraft('')
        }}
        footer={
          <div className="ml-auto flex flex-wrap gap-2">
            <Button
              variant="secondary"
              type="button"
              onClick={() => {
                setThoughtModalOpen(false)
                setEditingThoughtId(null)
                setThoughtDraft('')
              }}
            >
              Cancel
            </Button>
            <Button
              variant="dark"
              type="button"
              onClick={saveThoughtModal}
              disabled={!thoughtDraft.trim()}
            >
              Save
            </Button>
          </div>
        }
      >
        <div>
          <Label htmlFor="thought-text">Thought</Label>
          <Textarea
            id="thought-text"
            value={thoughtDraft}
            onChange={(e) => setThoughtDraft(e.target.value)}
            placeholder="Something to keep in mind before or during interviews…"
            rows={5}
            autoFocus
            onKeyDown={(e) => {
              if (e.key === 'Enter' && (e.metaKey || e.ctrlKey) && thoughtDraft.trim()) {
                e.preventDefault()
                saveThoughtModal()
              }
            }}
          />
        </div>
      </Dialog>
    </>
  )
}
