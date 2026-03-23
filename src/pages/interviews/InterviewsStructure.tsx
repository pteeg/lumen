import { useCallback, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Button } from '../../components/ui/Button'
import { Dialog } from '../../components/ui/Dialog'
import { Input, Label, Textarea } from '../../components/ui/Field'
import { useInterviewGuideWorkspaceContext } from '../../context/InterviewGuideWorkspaceContext'
import type { InterviewGuideQuestion } from '../../types/interviewGuide'

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

/** Interview guide — Structure: sections sidebar, questions list, modals. */
export function InterviewsStructure() {
  const {
    sections,
    questionsInSelectedSection,
    selectedSectionId,
    selectSection,
    addSection,
    updateSection,
    addQuestionToSection,
    updateQuestion,
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

  function openAddSection() {
    setEditingSectionId(null)
    setSectionName('')
    setSectionModalOpen(true)
  }

  function openEditSection(s: { id: string; title: string }) {
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
    e: React.PointerEvent<HTMLLIElement>,
    q: InterviewGuideQuestion,
  ) {
    if (e.button !== 0) return
    e.preventDefault()
    const el = e.currentTarget
    const rect = el.getBoundingClientRect()
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
          <div className="space-y-4">
            <div className="flex justify-end">
              <Button variant="dark" onClick={openAddQuestionModal}>
                Add question
              </Button>
            </div>
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
                    const q = slot.q
                    return (
                      <li
                        key={q.id}
                        ref={(el) => setRowRef(q.id, el)}
                        onPointerDown={(e) => handleQuestionPointerDown(e, q)}
                        className="touch-none rounded-[1.25rem] border border-neutral-200/80 bg-white p-4 shadow-[0_1px_2px_rgba(15,23,42,0.04)] transition-[transform,opacity] duration-150 ease-out"
                        style={{ cursor: 'grab' }}
                      >
                        <div className="flex items-start gap-2">
                          <p className="min-w-0 flex-1 text-base font-semibold leading-snug text-neutral-900">
                            {q.questionText}
                          </p>
                          <Button
                            variant="ghost"
                            className="-mr-1 -mt-1 shrink-0 px-2 py-1 text-xs font-medium text-neutral-600 hover:text-neutral-900"
                            aria-label="Edit question"
                            onPointerDown={(e) => e.stopPropagation()}
                            onClick={() => openEditQuestion(q)}
                          >
                            Edit
                          </Button>
                        </div>
                      </li>
                    )
                  })
                : questionsInSelectedSection.map((q) => (
                    <li
                      key={q.id}
                      ref={(el) => setRowRef(q.id, el)}
                      onPointerDown={(e) => handleQuestionPointerDown(e, q)}
                      className="touch-none rounded-[1.25rem] border border-neutral-200/80 bg-white p-4 shadow-[0_1px_2px_rgba(15,23,42,0.04)] transition-[transform,opacity] duration-150 ease-out"
                      style={{ cursor: 'grab' }}
                    >
                      <div className="flex items-start gap-2">
                        <p className="min-w-0 flex-1 text-base font-semibold leading-snug text-neutral-900">
                          {q.questionText}
                        </p>
                        <Button
                          variant="ghost"
                          className="-mr-1 -mt-1 shrink-0 px-2 py-1 text-xs font-medium text-neutral-600 hover:text-neutral-900"
                          aria-label="Edit question"
                          onPointerDown={(e) => e.stopPropagation()}
                          onClick={() => openEditQuestion(q)}
                        >
                          Edit
                        </Button>
                      </div>
                    </li>
                  ))}
            </ul>
          </div>
        ) : null}
      </main>

      {typeof document !== 'undefined' && ghost
        ? createPortal(ghost, document.body)
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
          <>
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
          </>
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
          <>
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
          </>
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
