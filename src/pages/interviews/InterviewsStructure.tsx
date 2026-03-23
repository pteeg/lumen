import { useCallback, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Button } from '../../components/ui/Button'
import { Dialog } from '../../components/ui/Dialog'
import { Input, Label, Textarea } from '../../components/ui/Field'
import { useInterviewGuideWorkspaceContext } from '../../context/InterviewGuideWorkspaceContext'
import type {
  InterviewGuideQuestion,
  InterviewGuideSection,
} from '../../types/interviewGuide'

/** Index in [0, without.length] where the dragged item would insert. */
function computeInsertIndex(
  clientY: number,
  without: InterviewGuideQuestion[],
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

function parseProbes(raw: string): string[] {
  return raw
    .split('\n')
    .map((s) => s.trim())
    .filter(Boolean)
}

function computeProbeInsertIndex(
  clientY: number,
  without: string[],
  dragFromIndex: number,
  questionId: string,
  rowRefs: Map<string, HTMLElement>,
): number {
  for (let j = 0; j < without.length; j++) {
    const origIdx = j < dragFromIndex ? j : j + 1
    const el = rowRefs.get(`${questionId}:${origIdx}`)
    if (!el) continue
    const rect = el.getBoundingClientRect()
    const mid = rect.top + rect.height / 2
    if (clientY < mid) return j
  }
  return without.length
}

/** Interview guide — Structure: sections sidebar, questions list, modals. */
export function InterviewsStructure() {
  const {
    sections,
    questionsInSelectedSection,
    selectedSectionId,
    selectSection,
    addSection,
    updateSection,
    deleteSection,
    addQuestionToSection,
    updateQuestion,
    deleteQuestion,
    reorderQuestionsInSection,
  } = useInterviewGuideWorkspaceContext()

  const [draggingQuestionId, setDraggingQuestionId] = useState<string | null>(
    null,
  )
  /** Insert position in the list *without* the dragged item (0…without.length). */
  const [insertIndex, setInsertIndex] = useState(0)
  const [ghostPos, setGhostPos] = useState({ x: 0, y: 0 })
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const [ghostSize, setGhostSize] = useState({ width: 0, height: 0 })

  const rowRefs = useRef<Map<string, HTMLElement>>(new Map())
  const questionsInSelectedSectionRef = useRef(questionsInSelectedSection)
  questionsInSelectedSectionRef.current = questionsInSelectedSection

  const reorderRef = useRef(reorderQuestionsInSection)
  reorderRef.current = reorderQuestionsInSection
  const selectedSectionIdRef = useRef(selectedSectionId)
  selectedSectionIdRef.current = selectedSectionId

  const insertIndexRef = useRef(0)
  insertIndexRef.current = insertIndex

  const sectionNotesRef = useRef<HTMLTextAreaElement>(null)

  const setRowRef = useCallback((id: string, el: HTMLElement | null) => {
    const m = rowRefs.current
    if (el) m.set(id, el)
    else m.delete(id)
  }, [])

  const [sectionModalOpen, setSectionModalOpen] = useState(false)
  const [editingSectionId, setEditingSectionId] = useState<string | null>(null)
  const [sectionName, setSectionName] = useState('')

  const [questionModalSectionId, setQuestionModalSectionId] = useState<
    string | null
  >(null)
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(
    null,
  )
  const [questionText, setQuestionText] = useState('')

  const [expandedQuestionIds, setExpandedQuestionIds] = useState<Set<string>>(
    () => new Set(),
  )
  const [probeDraftByQuestionId, setProbeDraftByQuestionId] = useState<
    Record<string, string>
  >({})

  const [draggingProbe, setDraggingProbe] = useState<{
    questionId: string
    index: number
  } | null>(null)
  const [probeInsertIndex, setProbeInsertIndex] = useState(0)
  const [probeGhostPos, setProbeGhostPos] = useState({ x: 0, y: 0 })
  const [probeDragOffset, setProbeDragOffset] = useState({ x: 0, y: 0 })
  const [probeGhostSize, setProbeGhostSize] = useState({ width: 0, height: 0 })

  const probeRowRefs = useRef<Map<string, HTMLElement>>(new Map())
  const probeInsertIndexRef = useRef(0)

  const [editingProbe, setEditingProbe] = useState<{
    questionId: string
    index: number
  } | null>(null)
  const [probeEditDraft, setProbeEditDraft] = useState('')

  const setProbeRowRef = useCallback(
    (questionId: string, probeIndex: number, el: HTMLElement | null) => {
      const key = `${questionId}:${probeIndex}`
      const m = probeRowRefs.current
      if (el) m.set(key, el)
      else m.delete(key)
    },
    [],
  )

  function openAddSection() {
    setEditingSectionId(null)
    setSectionName('')
    setSectionModalOpen(true)
  }

  function openEditSection(s: Pick<InterviewGuideSection, 'id' | 'title'>) {
    setEditingSectionId(s.id)
    setSectionName(s.title)
    setSectionModalOpen(true)
  }

  function saveSection() {
    const trimmed = sectionName.trim()
    if (!trimmed) return
    if (editingSectionId) {
      updateSection(editingSectionId, { title: trimmed })
    } else {
      addSection(trimmed)
    }
    setSectionModalOpen(false)
    setEditingSectionId(null)
    setSectionName('')
  }

  function handleDeleteSection() {
    if (!editingSectionId) return
    deleteSection(editingSectionId)
    setSectionModalOpen(false)
    setEditingSectionId(null)
    setSectionName('')
  }

  function handleDeleteQuestion() {
    if (!editingQuestionId) return
    const removedId = editingQuestionId
    deleteQuestion(removedId)
    setExpandedQuestionIds((prev) => {
      const next = new Set(prev)
      next.delete(removedId)
      return next
    })
    setProbeDraftByQuestionId((d) => {
      const { [removedId]: _, ...rest } = d
      return rest
    })
    setDraggingProbe((dp) => (dp?.questionId === removedId ? null : dp))
    if (editingProbe?.questionId === removedId) {
      setEditingProbe(null)
      setProbeEditDraft('')
    }
    setQuestionModalSectionId(null)
    setEditingQuestionId(null)
    setQuestionText('')
  }

  function openAddQuestionModal() {
    if (!selectedSectionId) return
    setEditingQuestionId(null)
    setQuestionModalSectionId(selectedSectionId)
    setQuestionText('')
  }

  function openEditQuestion(q: InterviewGuideQuestion) {
    setEditingQuestionId(q.id)
    setQuestionModalSectionId(q.sectionId)
    setQuestionText(q.questionText)
  }

  function saveQuestion() {
    const trimmed = questionText.trim()
    if (!trimmed) return
    if (editingQuestionId) {
      updateQuestion(editingQuestionId, { questionText: trimmed })
    } else if (questionModalSectionId) {
      addQuestionToSection(questionModalSectionId, trimmed)
    }
    setQuestionModalSectionId(null)
    setEditingQuestionId(null)
    setQuestionText('')
  }

  function handleQuestionPointerDown(
    e: React.PointerEvent<HTMLElement>,
    q: InterviewGuideQuestion,
  ) {
    if (e.button !== 0) return
    e.preventDefault()
    e.stopPropagation()
    const el = e.currentTarget.closest('li')
    if (!el) return
    const rect = el.getBoundingClientRect()
    setExpandedQuestionIds(new Set())
    const list = questionsInSelectedSection
    const startIdx = list.findIndex((x) => x.id === q.id)
    if (startIdx < 0) return

    setDragOffset({ x: e.clientX - rect.left, y: e.clientY - rect.top })
    setGhostSize({ width: rect.width, height: rect.height })
    setGhostPos({ x: e.clientX, y: e.clientY })
    setInsertIndex(startIdx)
    insertIndexRef.current = startIdx
    setDraggingQuestionId(q.id)

    const draggedId = q.id

    function onMove(ev: PointerEvent) {
      setGhostPos({ x: ev.clientX, y: ev.clientY })
      const currentList = questionsInSelectedSectionRef.current
      const without = currentList.filter((x) => x.id !== draggedId)
      const next = computeInsertIndex(ev.clientY, without, rowRefs.current)
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
      const sid = selectedSectionIdRef.current
      const without = questionsInSelectedSectionRef.current.filter(
        (x) => x.id !== draggedId,
      )
      const idx = insertIndexRef.current
      const orderedIds = [
        ...without.slice(0, idx).map((x) => x.id),
        draggedId,
        ...without.slice(idx).map((x) => x.id),
      ]
      if (sid) reorderRef.current(sid, orderedIds)
      setDraggingQuestionId(null)
    }

    function onCancel() {
      cleanupListeners()
      setDraggingQuestionId(null)
    }

    document.body.style.cursor = 'grabbing'
    document.body.style.userSelect = 'none'
    window.addEventListener('pointermove', onMove, { capture: true })
    window.addEventListener('pointerup', onUp, { capture: true })
    window.addEventListener('pointercancel', onCancel, { capture: true })
  }

  function addProbeForQuestion(q: InterviewGuideQuestion) {
    const t = (probeDraftByQuestionId[q.id] ?? '').trim()
    if (!t) return
    const existing = parseProbes(q.followUpProbes)
    updateQuestion(q.id, { followUpProbes: [...existing, t].join('\n') })
    setProbeDraftByQuestionId((prev) => ({ ...prev, [q.id]: '' }))
  }

  function cancelProbeEdit() {
    setEditingProbe(null)
    setProbeEditDraft('')
  }

  function commitProbeEdit(q: InterviewGuideQuestion) {
    if (!editingProbe || editingProbe.questionId !== q.id) return
    const idx = editingProbe.index
    const t = probeEditDraft.trim()
    const list = parseProbes(q.followUpProbes)
    if (idx < 0 || idx >= list.length) {
      cancelProbeEdit()
      return
    }
    if (t === '') {
      list.splice(idx, 1)
    } else {
      list[idx] = t
    }
    updateQuestion(q.id, { followUpProbes: list.join('\n') })
    cancelProbeEdit()
  }

  function beginEditProbe(q: InterviewGuideQuestion, origIdx: number) {
    const list = parseProbes(q.followUpProbes)
    if (origIdx < 0 || origIdx >= list.length) return
    setEditingProbe({ questionId: q.id, index: origIdx })
    setProbeEditDraft(list[origIdx])
  }

  function handleProbePointerDown(
    e: React.PointerEvent<HTMLElement>,
    q: InterviewGuideQuestion,
    probeIndex: number,
  ) {
    if (e.button !== 0) return
    e.preventDefault()
    e.stopPropagation()
    cancelProbeEdit()
    const el = e.currentTarget.closest('li')
    if (!el) return
    const probes = parseProbes(q.followUpProbes)
    if (probeIndex < 0 || probeIndex >= probes.length) return
    const rect = el.getBoundingClientRect()
    setProbeDragOffset({ x: e.clientX - rect.left, y: e.clientY - rect.top })
    setProbeGhostSize({ width: rect.width, height: rect.height })
    setProbeGhostPos({ x: e.clientX, y: e.clientY })
    setProbeInsertIndex(probeIndex)
    probeInsertIndexRef.current = probeIndex
    setDraggingProbe({ questionId: q.id, index: probeIndex })

    const draggedQid = q.id
    const dragIdx = probeIndex

    function onMove(ev: PointerEvent) {
      setProbeGhostPos({ x: ev.clientX, y: ev.clientY })
      const currentList = questionsInSelectedSectionRef.current
      const qNow = currentList.find((x) => x.id === draggedQid)
      if (!qNow) return
      const allProbes = parseProbes(qNow.followUpProbes)
      if (dragIdx >= allProbes.length) return
      const without = allProbes.filter((_, i) => i !== dragIdx)
      const next = computeProbeInsertIndex(
        ev.clientY,
        without,
        dragIdx,
        draggedQid,
        probeRowRefs.current,
      )
      setProbeInsertIndex(next)
      probeInsertIndexRef.current = next
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
      const qNow = questionsInSelectedSectionRef.current.find(
        (x) => x.id === draggedQid,
      )
      if (!qNow) {
        setDraggingProbe(null)
        return
      }
      const allProbes = parseProbes(qNow.followUpProbes)
      if (dragIdx >= allProbes.length) {
        setDraggingProbe(null)
        return
      }
      const item = allProbes[dragIdx]
      const without = allProbes.filter((_, i) => i !== dragIdx)
      const idx = probeInsertIndexRef.current
      const ordered = [...without.slice(0, idx), item, ...without.slice(idx)]
      updateQuestion(draggedQid, { followUpProbes: ordered.join('\n') })
      setDraggingProbe(null)
    }

    function onCancel() {
      cleanupListeners()
      setDraggingProbe(null)
    }

    document.body.style.cursor = 'grabbing'
    document.body.style.userSelect = 'none'
    window.addEventListener('pointermove', onMove, { capture: true })
    window.addEventListener('pointerup', onUp, { capture: true })
    window.addEventListener('pointercancel', onCancel, { capture: true })
  }

  function renderProbeRow(
    q: InterviewGuideQuestion,
    fullProbes: string[],
    origIdx: number,
    probeText: string,
  ) {
    const isEditing =
      editingProbe?.questionId === q.id && editingProbe.index === origIdx
    return (
      <li
        key={`${q.id}-probe-${origIdx}`}
        ref={(el) => setProbeRowRef(q.id, origIdx, el)}
        className="rounded-lg border border-neutral-200/60 bg-neutral-50/80 px-3 py-2 shadow-[0_1px_2px_rgba(15,23,42,0.03)]"
      >
        <div className="flex items-center gap-2">
          <button
            type="button"
            aria-label="Drag to reorder probing question"
            onPointerDown={(e) => handleProbePointerDown(e, q, origIdx)}
            className="touch-none shrink-0 cursor-grab rounded-md px-1 py-1 text-neutral-400 hover:bg-neutral-200/60 hover:text-neutral-600 active:cursor-grabbing"
          >
            <span
              aria-hidden
              className="inline-block select-none text-lg leading-none tracking-tighter"
            >
              ⋮⋮
            </span>
          </button>
          {isEditing ? (
            <Input
              value={probeEditDraft}
              onChange={(e) => setProbeEditDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  commitProbeEdit(q)
                }
                if (e.key === 'Escape') {
                  e.preventDefault()
                  cancelProbeEdit()
                }
              }}
              placeholder="Probing question…"
              aria-label="Edit probing question"
              className="min-w-0 flex-1 text-sm"
              autoFocus
            />
          ) : (
            <span className="min-w-0 flex-1 text-sm leading-relaxed text-neutral-800">
              {probeText}
            </span>
          )}
          {isEditing ? (
            <>
              <Button
                type="button"
                variant="secondary"
                className="shrink-0 px-2 py-1 text-xs"
                onPointerDown={(e) => e.preventDefault()}
                onClick={() => commitProbeEdit(q)}
              >
                Save
              </Button>
              <Button
                type="button"
                variant="ghost"
                className="shrink-0 px-2 py-1 text-xs text-neutral-600"
                onPointerDown={(e) => e.preventDefault()}
                onClick={cancelProbeEdit}
              >
                Cancel
              </Button>
            </>
          ) : (
            <Button
              type="button"
              variant="ghost"
              className="shrink-0 px-2 py-1 text-xs font-medium text-neutral-600 hover:text-neutral-900"
              aria-label="Edit probing question"
              onPointerDown={(e) => e.preventDefault()}
              onClick={() => beginEditProbe(q, origIdx)}
            >
              Edit
            </Button>
          )}
          <Button
            type="button"
            variant="ghost"
            className="shrink-0 px-2 py-1 text-xs text-neutral-500 hover:text-red-700"
            aria-label="Remove probing question"
            onPointerDown={(e) => e.preventDefault()}
            onClick={() => {
              const next = [...fullProbes]
              next.splice(origIdx, 1)
              updateQuestion(q.id, { followUpProbes: next.join('\n') })
              if (
                editingProbe?.questionId === q.id &&
                editingProbe.index === origIdx
              ) {
                cancelProbeEdit()
              }
            }}
          >
            Remove
          </Button>
        </div>
      </li>
    )
  }

  function renderQuestionTile(q: InterviewGuideQuestion) {
    const probes = parseProbes(q.followUpProbes)
    const expanded = expandedQuestionIds.has(q.id)
    const probeDragForQ =
      draggingProbe?.questionId === q.id ? draggingProbe : null

    const probePreviewSlots: Array<
      { kind: 'placeholder' } | { kind: 'probe'; origIdx: number; text: string }
    > = []
    if (probeDragForQ) {
      const dragIdx = probeDragForQ.index
      const withoutDraggedProbe = probes.filter((_, i) => i !== dragIdx)
      for (let i = 0; i < withoutDraggedProbe.length; i++) {
        if (i === probeInsertIndex) {
          probePreviewSlots.push({ kind: 'placeholder' })
        }
        const origIdx = i < dragIdx ? i : i + 1
        probePreviewSlots.push({
          kind: 'probe',
          origIdx,
          text: probes[origIdx],
        })
      }
      if (probeInsertIndex === withoutDraggedProbe.length) {
        probePreviewSlots.push({ kind: 'placeholder' })
      }
    }

    return (
      <li
        key={q.id}
        ref={(el) => setRowRef(q.id, el)}
        className="rounded-[1.25rem] border border-neutral-200/80 bg-white p-4 shadow-[0_1px_2px_rgba(15,23,42,0.04)] transition-[transform,opacity] duration-150 ease-out"
      >
        <div className="flex items-center gap-2">
          <button
            type="button"
            aria-label="Drag to reorder"
            onPointerDown={(e) => handleQuestionPointerDown(e, q)}
            className="touch-none shrink-0 cursor-grab rounded-md px-1 py-1 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-600 active:cursor-grabbing"
          >
            <span
              aria-hidden
              className="inline-block select-none text-lg leading-none tracking-tighter"
            >
              ⋮⋮
            </span>
          </button>
          <button
            type="button"
            className="min-w-0 flex-1 rounded-lg text-left outline-none focus-visible:ring-2 focus-visible:ring-blue-500/30"
            onClick={() =>
              setExpandedQuestionIds((prev) => {
                const next = new Set(prev)
                if (next.has(q.id)) next.delete(q.id)
                else next.add(q.id)
                return next
              })
            }
            aria-expanded={expanded}
          >
            <span className="text-base font-semibold leading-snug text-neutral-900">
              {q.questionText}
            </span>
          </button>
          <Button
            variant="ghost"
            className="-mr-1 shrink-0 px-2 py-1 text-xs font-medium text-neutral-600 hover:text-neutral-900"
            aria-label="Edit question"
            onPointerDown={(e) => e.stopPropagation()}
            onClick={() => openEditQuestion(q)}
          >
            Edit
          </Button>
        </div>
        {expanded ? (
          <div className="mt-4 border-t border-neutral-100 pt-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-neutral-500">
              Probing questions
            </p>
            {probes.length > 0 ? (
              <ul className="mt-3 space-y-2">
                {probeDragForQ
                  ? probePreviewSlots.map((slot, slotIndex) => {
                      if (slot.kind === 'placeholder') {
                        return (
                          <li
                            key={`${q.id}-probe-ph-${slotIndex}`}
                            className="rounded-lg border-2 border-dashed border-neutral-300/90 bg-neutral-50/50 shadow-none"
                            style={{
                              minHeight: probeGhostSize.height || undefined,
                            }}
                            aria-hidden
                          />
                        )
                      }
                      return renderProbeRow(
                        q,
                        probes,
                        slot.origIdx,
                        slot.text,
                      )
                    })
                  : probes.map((probe, idx) =>
                      renderProbeRow(q, probes, idx, probe),
                    )}
              </ul>
            ) : null}
            <div className="mt-3 flex flex-wrap items-end gap-2">
              <Input
                id={`probe-${q.id}`}
                value={probeDraftByQuestionId[q.id] ?? ''}
                onChange={(e) =>
                  setProbeDraftByQuestionId((prev) => ({
                    ...prev,
                    [q.id]: e.target.value,
                  }))
                }
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    addProbeForQuestion(q)
                  }
                }}
                placeholder="Add a probing question…"
                aria-label="Add probing question"
                className="min-w-0 flex-1 text-sm"
              />
              <Button
                type="button"
                variant="secondary"
                className="shrink-0"
                onClick={() => addProbeForQuestion(q)}
              >
                Add
              </Button>
            </div>
          </div>
        ) : null}
      </li>
    )
  }

  const draggedQuestion = draggingQuestionId
    ? questionsInSelectedSection.find((q) => q.id === draggingQuestionId)
    : null

  const withoutDragged = draggingQuestionId
    ? questionsInSelectedSection.filter((q) => q.id !== draggingQuestionId)
    : questionsInSelectedSection

  const previewSlots: Array<
    { kind: 'placeholder' } | { kind: 'q'; q: InterviewGuideQuestion }
  > = []
  if (draggingQuestionId) {
    for (let i = 0; i < withoutDragged.length; i++) {
      if (i === insertIndex) {
        previewSlots.push({ kind: 'placeholder' })
      }
      previewSlots.push({ kind: 'q', q: withoutDragged[i] })
    }
    if (insertIndex === withoutDragged.length) {
      previewSlots.push({ kind: 'placeholder' })
    }
  }

  const selectedSection = useMemo(
    () => sections.find((s) => s.id === selectedSectionId) ?? null,
    [sections, selectedSectionId],
  )

  useLayoutEffect(() => {
    const el = sectionNotesRef.current
    if (!el) return
    el.style.height = '0px'
    el.style.height = `${el.scrollHeight}px`
  }, [selectedSectionId, selectedSection?.notes])

  const ghost =
    draggingQuestionId && draggedQuestion && ghostSize.width > 0 ? (
      <div
        className="pointer-events-none fixed z-[9999] rounded-[1.25rem] border border-neutral-200/80 bg-white p-4 shadow-lg ring-2 ring-neutral-300/40"
        style={{
          left: ghostPos.x - dragOffset.x,
          top: ghostPos.y - dragOffset.y,
          width: ghostSize.width,
          minHeight: ghostSize.height,
        }}
        aria-hidden
      >
        <p className="text-base font-semibold leading-snug text-neutral-900">
          {draggedQuestion.questionText}
        </p>
      </div>
    ) : null

  const draggedProbeSource =
    draggingProbe != null
      ? questionsInSelectedSection.find((x) => x.id === draggingProbe.questionId)
      : null
  const draggedProbeLine =
    draggingProbe && draggedProbeSource
      ? parseProbes(draggedProbeSource.followUpProbes)[draggingProbe.index] ??
        ''
      : ''

  const probeGhost =
    draggingProbe && draggedProbeSource && probeGhostSize.width > 0 ? (
      <div
        className="pointer-events-none fixed z-[9999] rounded-lg border border-neutral-200/80 bg-neutral-50/80 px-3 py-2 shadow-lg ring-2 ring-neutral-300/40"
        style={{
          left: probeGhostPos.x - probeDragOffset.x,
          top: probeGhostPos.y - probeDragOffset.y,
          width: probeGhostSize.width,
          minHeight: probeGhostSize.height,
        }}
        aria-hidden
      >
        <p className="text-sm leading-relaxed text-neutral-800">
          {draggedProbeLine}
        </p>
      </div>
    ) : null

  return (
    <div className="flex min-h-[min(70vh,720px)] flex-col gap-6 lg:flex-row lg:gap-0">
      <aside
        className="w-full shrink-0 border-neutral-200/80 lg:w-64 lg:border-r lg:pr-6 xl:w-72"
        aria-label="Section list"
      >
        <Button
          variant="dark"
          className="mb-4 w-full sm:w-auto"
          onClick={openAddSection}
        >
          Add section
        </Button>

        <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-neutral-500">
          Sections
        </p>

        <nav className="space-y-1" aria-label="Sections — names only">
          {sections.length === 0 ? (
            <p className="rounded-xl border border-dashed border-neutral-200/90 bg-neutral-50/40 px-3 py-5 text-center text-sm text-neutral-500">
              No sections yet. Use Add section above.
            </p>
          ) : (
            sections.map((s) => {
              const selected = selectedSectionId === s.id
              return (
                <div
                  key={s.id}
                  className={`flex items-stretch gap-0.5 rounded-xl transition ${
                    selected
                      ? 'bg-neutral-100 text-neutral-900 ring-1 ring-neutral-200/80'
                      : 'text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => selectSection(s.id)}
                    className="min-w-0 flex-1 rounded-l-xl px-3 py-2.5 text-left text-sm font-medium"
                  >
                    {s.title}
                  </button>
                  <Button
                    variant="ghost"
                    className="shrink-0 rounded-r-xl px-2.5 py-2.5 text-xs font-medium text-neutral-600 hover:text-neutral-900"
                    aria-label={`Edit section: ${s.title}`}
                    onClick={() => openEditSection(s)}
                  >
                    Edit
                  </Button>
                </div>
              )
            })
          )}
        </nav>
      </aside>

      <main className="min-w-0 flex-1 lg:pl-6">
        {selectedSectionId ? (
          <div className="w-full min-w-0 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="min-w-0 flex-1 text-2xl font-semibold leading-snug tracking-tight text-neutral-900 md:text-3xl">
                {selectedSection?.title ?? ''}
              </h2>
              <Button
                variant="dark"
                className="shrink-0"
                onClick={openAddQuestionModal}
              >
                Add question
              </Button>
            </div>
            {selectedSection ? (
              <div className="w-full min-w-0 rounded-[1.25rem] border border-neutral-200/80 bg-white p-4 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
                <Label htmlFor="section-notes">Section notes</Label>
                <Textarea
                  ref={sectionNotesRef}
                  id="section-notes"
                  value={selectedSection.notes ?? ''}
                  onChange={(e) =>
                    updateSection(selectedSection.id, {
                      notes: e.target.value,
                    })
                  }
                  placeholder="Notes for this section…"
                  rows={1}
                  className="mt-2 !min-h-10 w-full min-w-0 max-w-none !resize-none overflow-hidden text-sm text-neutral-800"
                />
              </div>
            ) : null}
            <ul className="space-y-3">
              {draggingQuestionId
                ? previewSlots.map((slot, slotIndex) => {
                    if (slot.kind === 'placeholder') {
                      return (
                        <li
                          key={`slot-ph-${slotIndex}`}
                          className="rounded-[1.25rem] border-2 border-dashed border-neutral-300/90 bg-neutral-50/50 shadow-none"
                          style={{ minHeight: ghostSize.height || undefined }}
                          aria-hidden
                        />
                      )
                    }
                    return renderQuestionTile(slot.q)
                  })
                : questionsInSelectedSection.map((q) => renderQuestionTile(q))}
            </ul>
          </div>
        ) : null}
      </main>

      {typeof document !== 'undefined' && ghost
        ? createPortal(ghost, document.body)
        : null}
      {typeof document !== 'undefined' && probeGhost
        ? createPortal(probeGhost, document.body)
        : null}

      <Dialog
        open={sectionModalOpen}
        title={editingSectionId ? 'Edit section' : 'New section'}
        onClose={() => {
          setSectionModalOpen(false)
          setEditingSectionId(null)
          setSectionName('')
        }}
        footer={
          <div className="flex w-full flex-wrap items-center gap-2">
            {editingSectionId ? (
              <Button variant="danger" onClick={handleDeleteSection}>
                Delete section
              </Button>
            ) : null}
            <div className="ml-auto flex flex-wrap gap-2">
              <Button
                variant="secondary"
                onClick={() => {
                  setSectionModalOpen(false)
                  setEditingSectionId(null)
                  setSectionName('')
                }}
              >
                Cancel
              </Button>
              <Button
                variant="dark"
                onClick={saveSection}
                disabled={!sectionName.trim()}
              >
                Save
              </Button>
            </div>
          </div>
        }
      >
        <div>
          <Label htmlFor="section-name">Section name</Label>
          <Input
            id="section-name"
            value={sectionName}
            onChange={(e) => setSectionName(e.target.value)}
            placeholder="e.g. Opening / background"
            autoFocus
            onKeyDown={(e) => {
              if (e.key === 'Enter' && sectionName.trim()) saveSection()
            }}
          />
        </div>
      </Dialog>

      <Dialog
        open={questionModalSectionId !== null}
        title={editingQuestionId ? 'Edit question' : 'New question'}
        onClose={() => {
          setQuestionModalSectionId(null)
          setEditingQuestionId(null)
          setQuestionText('')
        }}
        footer={
          <div className="flex w-full flex-wrap items-center gap-2">
            {editingQuestionId ? (
              <Button variant="danger" onClick={handleDeleteQuestion}>
                Delete question
              </Button>
            ) : null}
            <div className="ml-auto flex flex-wrap gap-2">
              <Button
                variant="secondary"
                onClick={() => {
                  setQuestionModalSectionId(null)
                  setEditingQuestionId(null)
                  setQuestionText('')
                }}
              >
                Cancel
              </Button>
              <Button
                variant="dark"
                onClick={saveQuestion}
                disabled={!questionText.trim()}
              >
                Save
              </Button>
            </div>
          </div>
        }
      >
        <div>
          <Label htmlFor="question-text">Question</Label>
          <Textarea
            id="question-text"
            value={questionText}
            onChange={(e) => setQuestionText(e.target.value)}
            placeholder="Type your interview question…"
            rows={4}
            autoFocus
          />
        </div>
      </Dialog>
    </div>
  )
}
