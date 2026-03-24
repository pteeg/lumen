import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import {
  DashboardCard,
  DashboardSectionLabel,
  InterviewProgressSection,
  ParticipationTypeConfirmedSection,
} from '../../components/dashboard'
import { Button } from '../../components/ui/Button'
import { Dialog } from '../../components/ui/Dialog'
import { Input, Label, Select, Textarea } from '../../components/ui/Field'
import { useInterviewGuideWorkspaceContext } from '../../context/InterviewGuideWorkspaceContext'
import { countParticipationRowsByProgress } from '../../lib/participationProgressCounts'
import { countParticipationByTypeConfirmed } from '../../lib/participationTypeConfirmedCounts'
import {
  PARTICIPATION_PROGRESS_OPTIONS,
  PARTICIPATION_TYPE_OPTIONS,
  type InterviewParticipationRow,
} from '../../types/interviewGuide'

const ALLOWED_TYPES = new Set<string>(PARTICIPATION_TYPE_OPTIONS)
const ALLOWED_PROGRESS = new Set<string>(PARTICIPATION_PROGRESS_OPTIONS)
const DEFAULT_PROGRESS = PARTICIPATION_PROGRESS_OPTIONS[0]

function sanitizeParticipantTypes(types: string[]): string[] {
  return types.filter((t) => ALLOWED_TYPES.has(t))
}

function normalizeProgressForForm(stored: string): string {
  const t = stored.trim()
  return ALLOWED_PROGRESS.has(t) ? t : DEFAULT_PROGRESS
}

function displayProgress(stored: string): string {
  const t = stored.trim()
  if (!t) return '—'
  return t
}

function progressPillClass(progress: string): string {
  const p = progress.trim().toLowerCase()
  if (p === 'confirmed' || p === 'interviewed') {
    return 'bg-green-100 text-green-700'
  }
  if (p === 'i need to respond' || p === 'awaiting their response') {
    return 'bg-amber-100 text-amber-700'
  }
  return 'bg-neutral-100 text-neutral-700'
}

function isoToDatetimeLocalValue(iso: string): string {
  if (!iso.trim()) return ''
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

function datetimeLocalValueToIso(value: string): string {
  if (!value.trim()) return ''
  const d = new Date(value)
  return Number.isNaN(d.getTime()) ? '' : d.toISOString()
}

function formatInterviewDateTime(iso: string): string {
  if (!iso.trim()) return '—'
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return '—'
  return d.toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  })
}

function formatTypes(types: string[]): string {
  if (types.length === 0) return '—'
  return types.join(', ')
}

type ParticipationFormState = {
  name: string
  participantTypes: string[]
  notes: string
  progress: string
  interviewDateTimeLocal: string
  location: string
}

const emptyForm: ParticipationFormState = {
  name: '',
  participantTypes: [],
  notes: '',
  progress: DEFAULT_PROGRESS,
  interviewDateTimeLocal: '',
  location: '',
}

function computeParticipationInsertIndex(
  clientY: number,
  without: InterviewParticipationRow[],
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

export function InterviewsParticipation() {
  const {
    participationRows,
    addParticipationRow,
    updateParticipationRow,
    deleteParticipationRow,
    reorderParticipationRows,
  } = useInterviewGuideWorkspaceContext()

  const [modalOpen, setModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [detailsRow, setDetailsRow] = useState<InterviewParticipationRow | null>(null)
  const [form, setForm] = useState<ParticipationFormState>(emptyForm)
  const [typeMenuOpen, setTypeMenuOpen] = useState(false)
  const [typeFilter, setTypeFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const typePickerRef = useRef<HTMLDivElement>(null)
  const [draggingRowId, setDraggingRowId] = useState<string | null>(null)
  const [insertIndex, setInsertIndex] = useState(0)
  const [ghostPos, setGhostPos] = useState({ x: 0, y: 0 })
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const [ghostSize, setGhostSize] = useState({ width: 0, height: 0 })
  const rowRefs = useRef<Map<string, HTMLElement>>(new Map())
  const rowsRef = useRef(participationRows)
  rowsRef.current = participationRows
  const insertIndexRef = useRef(0)
  insertIndexRef.current = insertIndex
  const reorderRowsRef = useRef(reorderParticipationRows)
  reorderRowsRef.current = reorderParticipationRows

  useEffect(() => {
    if (!typeMenuOpen) return
    function onDocDown(e: MouseEvent) {
      if (
        typePickerRef.current &&
        !typePickerRef.current.contains(e.target as Node)
      ) {
        setTypeMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', onDocDown)
    return () => document.removeEventListener('mousedown', onDocDown)
  }, [typeMenuOpen])

  const setRowRef = useCallback((id: string, el: HTMLElement | null) => {
    const m = rowRefs.current
    if (el) m.set(id, el)
    else m.delete(id)
  }, [])

  function openAdd() {
    setEditingId(null)
    setForm(emptyForm)
    setTypeMenuOpen(false)
    setModalOpen(true)
  }

  function openEdit(row: InterviewParticipationRow) {
    setEditingId(row.id)
    setForm({
      name: row.name,
      participantTypes: sanitizeParticipantTypes(row.participantTypes),
      notes: row.notes,
      progress: normalizeProgressForForm(row.progress),
      interviewDateTimeLocal: isoToDatetimeLocalValue(row.interviewDateTime),
      location: row.location,
    })
    setTypeMenuOpen(false)
    setModalOpen(true)
  }

  function closeModal() {
    setModalOpen(false)
    setEditingId(null)
    setForm(emptyForm)
    setTypeMenuOpen(false)
  }

  function toggleParticipantType(opt: string) {
    setForm((f) => {
      const next = new Set(f.participantTypes)
      if (next.has(opt)) next.delete(opt)
      else next.add(opt)
      return { ...f, participantTypes: [...next] }
    })
  }

  function saveRow() {
    const trimmedName = form.name.trim()
    if (!trimmedName) return
    const interviewDateTime = datetimeLocalValueToIso(form.interviewDateTimeLocal)
    const participantTypes = sanitizeParticipantTypes(form.participantTypes)
    const progress = ALLOWED_PROGRESS.has(form.progress.trim())
      ? form.progress.trim()
      : DEFAULT_PROGRESS
    if (editingId) {
      updateParticipationRow(editingId, {
        name: trimmedName,
        participantTypes,
        notes: form.notes,
        progress,
        interviewDateTime,
        location: form.location,
      })
    } else {
      addParticipationRow({
        name: trimmedName,
        participantTypes,
        notes: form.notes,
        progress,
        interviewDateTime,
        location: form.location,
      })
    }
    closeModal()
  }

  function deleteFromModal() {
    if (!editingId) return
    if (deleteParticipationRow(editingId)) closeModal()
  }

  function handleRowPointerDown(
    e: React.PointerEvent<HTMLButtonElement>,
    row: InterviewParticipationRow,
  ) {
    if (e.button !== 0) return
    e.preventDefault()
    e.stopPropagation()
    const el = rowRefs.current.get(row.id)
    if (!el) return
    const rect = el.getBoundingClientRect()
    const list = rowsRef.current
    const startIdx = list.findIndex((x) => x.id === row.id)
    if (startIdx < 0) return

    setDragOffset({ x: e.clientX - rect.left, y: e.clientY - rect.top })
    setGhostSize({ width: rect.width, height: rect.height })
    setGhostPos({ x: e.clientX, y: e.clientY })
    setInsertIndex(startIdx)
    insertIndexRef.current = startIdx
    setDraggingRowId(row.id)

    const draggedId = row.id

    function onMove(ev: PointerEvent) {
      setGhostPos({ x: ev.clientX, y: ev.clientY })
      const current = rowsRef.current
      const without = current.filter((x) => x.id !== draggedId)
      const next = computeParticipationInsertIndex(
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
      const without = rowsRef.current.filter((x) => x.id !== draggedId)
      const idx = insertIndexRef.current
      const orderedIds = [
        ...without.slice(0, idx).map((x) => x.id),
        draggedId,
        ...without.slice(idx).map((x) => x.id),
      ]
      reorderRowsRef.current(orderedIds)
      setDraggingRowId(null)
    }

    function onCancel() {
      cleanupListeners()
      setDraggingRowId(null)
    }

    document.body.style.cursor = 'grabbing'
    document.body.style.userSelect = 'none'
    window.addEventListener('pointermove', onMove, { capture: true })
    window.addEventListener('pointerup', onUp, { capture: true })
    window.addEventListener('pointercancel', onCancel, { capture: true })
  }

  const typeSummary =
    form.participantTypes.length === 0
      ? 'Select types…'
      : form.participantTypes.join(', ')

  const interviewProgressCounts = useMemo(
    () => countParticipationRowsByProgress(participationRows),
    [participationRows],
  )

  const typeConfirmedStats = useMemo(
    () => countParticipationByTypeConfirmed(participationRows),
    [participationRows],
  )

  const filteredRows = useMemo(() => {
    return participationRows.filter((row) => {
      const rowTypes = sanitizeParticipantTypes(row.participantTypes)
      const typeMatches =
        typeFilter === 'all' ? true : rowTypes.includes(typeFilter)
      const statusMatches =
        statusFilter === 'all'
          ? true
          : normalizeProgressForForm(row.progress) === statusFilter
      return typeMatches && statusMatches
    })
  }, [participationRows, statusFilter, typeFilter])
  const filtersActive = typeFilter !== 'all' || statusFilter !== 'all'

  const draggedRow = draggingRowId
    ? participationRows.find((r) => r.id === draggingRowId) ?? null
    : null
  const rowsWithoutDragged = draggingRowId
    ? participationRows.filter((r) => r.id !== draggingRowId)
    : participationRows
  const previewSlots: Array<
    { kind: 'placeholder' } | { kind: 'row'; row: InterviewParticipationRow }
  > = []
  if (draggingRowId) {
    for (let i = 0; i < rowsWithoutDragged.length; i++) {
      if (i === insertIndex) previewSlots.push({ kind: 'placeholder' })
      previewSlots.push({ kind: 'row', row: rowsWithoutDragged[i] })
    }
    if (insertIndex === rowsWithoutDragged.length) {
      previewSlots.push({ kind: 'placeholder' })
    }
  }

  useEffect(() => {
    if (filtersActive && draggingRowId) setDraggingRowId(null)
  }, [filtersActive, draggingRowId])

  const dragGhost =
    draggingRowId && draggedRow && ghostSize.width > 0 ? (
      <div
        className="pointer-events-none fixed z-[9999] rounded-xl border border-neutral-200/80 bg-white px-4 py-3 shadow-lg ring-2 ring-neutral-300/40"
        style={{
          left: ghostPos.x - dragOffset.x,
          top: ghostPos.y - dragOffset.y,
          width: ghostSize.width,
          minHeight: ghostSize.height,
        }}
        aria-hidden
      >
        <p className="truncate text-sm font-medium text-neutral-900">
          {draggedRow.name || '—'}
        </p>
      </div>
    ) : null

  return (
    <div className="space-y-6">
      <InterviewProgressSection
        progressCounts={interviewProgressCounts}
        showSeeAllLink={false}
      />

      <ParticipationTypeConfirmedSection typeStats={typeConfirmedStats} />

      <DashboardCard dense>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <DashboardSectionLabel>Participation</DashboardSectionLabel>
          <Button variant="dark" type="button" className="shrink-0" onClick={openAdd}>
            Add row
          </Button>
        </div>

        <div className="mt-4 overflow-x-auto">
          <div className="mb-3 flex flex-wrap items-end gap-3">
            <div className="min-w-[180px]">
              <Label htmlFor="part-filter-type">Filter by type</Label>
              <Select
                id="part-filter-type"
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
              >
                <option value="all">All types</option>
                {PARTICIPATION_TYPE_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </Select>
            </div>
            <div className="min-w-[180px]">
              <Label htmlFor="part-filter-status">Filter by status</Label>
              <Select
                id="part-filter-status"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All statuses</option>
                {PARTICIPATION_PROGRESS_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </Select>
            </div>
            {(typeFilter !== 'all' || statusFilter !== 'all') && (
              <Button
                type="button"
                variant="ghost"
                className="mb-0.5 text-sm"
                onClick={() => {
                  setTypeFilter('all')
                  setStatusFilter('all')
                }}
              >
                Clear filters
              </Button>
            )}
          </div>

          <div className="w-[980px] max-w-full space-y-2">
            {filteredRows.length === 0 ? (
              <div className="rounded-xl border border-dashed border-neutral-200/90 bg-neutral-50/40 px-4 py-10 text-center text-sm text-neutral-500">
                {participationRows.length === 0
                  ? 'No rows yet. Use Add row to track interviews.'
                  : 'No participants match the selected filters.'}
              </div>
            ) : (
              <>
                {(draggingRowId
                  ? previewSlots
                  : filtersActive
                    ? filteredRows
                    : participationRows
                ).map((slot, idx) => {
                  if ('kind' in slot && slot.kind === 'placeholder') {
                    return (
                      <div
                        key={`part-ph-${idx}`}
                        className="rounded-xl border-2 border-dashed border-neutral-300/90 bg-neutral-50/50"
                        style={{ minHeight: ghostSize.height || 74 }}
                        aria-hidden
                      />
                    )
                  }
                  const row = 'kind' in slot ? slot.row : slot
                  return (
                    <div
                      key={row.id}
                      ref={(el) => setRowRef(row.id, el)}
                      className="group grid grid-cols-[32px_minmax(0,2fr)_minmax(0,1.5fr)_minmax(0,1.5fr)_minmax(0,1.4fr)] items-start gap-x-4 rounded-xl border border-neutral-200/80 bg-white px-4 py-3 shadow-[0_1px_2px_rgba(15,23,42,0.04)]"
                    >
                      <button
                        type="button"
                        aria-label="Drag to reorder participant"
                        onPointerDown={(e) => handleRowPointerDown(e, row)}
                        onClick={(e) => e.stopPropagation()}
                        disabled={filtersActive}
                        className="inline-flex h-8 w-8 items-center justify-center justify-self-center touch-none cursor-grab rounded-md text-neutral-400 hover:bg-neutral-100 hover:text-neutral-600 active:cursor-grabbing"
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
                        onClick={() => setDetailsRow(row)}
                        className="col-start-2 col-end-[-1] grid min-w-0 grid-cols-[minmax(0,2fr)_minmax(0,1.5fr)_minmax(0,1.5fr)_minmax(0,1.4fr)] items-center gap-x-4 text-left"
                      >
                        <div className="min-w-0 flex flex-col">
                          <span className="min-w-0 truncate text-[10px] font-semibold uppercase tracking-[0.12em] text-neutral-400">
                            Name
                          </span>
                          <span className="min-w-0 truncate text-sm font-medium text-neutral-900">
                            {row.name || '—'}
                          </span>
                        </div>

                        <div className="min-w-0 flex flex-col">
                          <span className="min-w-0 truncate text-[10px] font-semibold uppercase tracking-[0.12em] text-neutral-400">
                            Type
                          </span>
                          <span className="min-w-0 truncate text-sm text-neutral-800">
                            {formatTypes(sanitizeParticipantTypes(row.participantTypes))}
                          </span>
                        </div>

                        <div className="min-w-0 flex flex-col items-start">
                          <span className="min-w-0 truncate text-[10px] font-semibold uppercase tracking-[0.12em] text-neutral-400">
                            Status
                          </span>
                          <span
                            className={`inline-flex w-fit min-w-0 max-w-full items-center overflow-hidden text-ellipsis whitespace-nowrap rounded-full px-2.5 py-0.5 text-sm font-medium ${progressPillClass(row.progress)}`}
                          >
                            {displayProgress(row.progress)}
                          </span>
                        </div>

                        <div className="min-w-0">
                          <div className="min-w-0 flex flex-col">
                            <span className="min-w-0 truncate text-[10px] font-semibold uppercase tracking-[0.12em] text-neutral-400">
                              Interview date
                            </span>
                            <span className="min-w-0 truncate text-sm text-neutral-800">
                              {formatInterviewDateTime(row.interviewDateTime)}
                            </span>
                          </div>
                        </div>
                      </button>
                    </div>
                  )
                })}
              </>
            )}
          </div>
        </div>
      </DashboardCard>

      {typeof document !== 'undefined' && dragGhost
        ? createPortal(dragGhost, document.body)
        : null}

      <Dialog
        open={detailsRow != null}
        title="Participant details"
        onClose={() => setDetailsRow(null)}
        panelClassName="max-w-xl"
        footer={
          <div className="ml-auto flex flex-wrap gap-2">
            {detailsRow ? (
              <Button
                variant="secondary"
                type="button"
                onClick={() => {
                  setDetailsRow(null)
                  openEdit(detailsRow)
                }}
              >
                Edit
              </Button>
            ) : null}
            <Button variant="dark" type="button" onClick={() => setDetailsRow(null)}>
              Close
            </Button>
          </div>
        }
      >
        {detailsRow ? (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="min-w-0">
              <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-neutral-500">
                Name
              </p>
              <p className="mt-1 text-sm text-neutral-900">{detailsRow.name || '—'}</p>
            </div>
            <div className="min-w-0">
              <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-neutral-500">
                Type
              </p>
              <p className="mt-1 text-sm text-neutral-900">
                {formatTypes(sanitizeParticipantTypes(detailsRow.participantTypes))}
              </p>
            </div>
            <div className="min-w-0">
              <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-neutral-500">
                Contact
              </p>
              <p className="mt-1 whitespace-pre-wrap text-sm text-neutral-900">
                {detailsRow.notes || '—'}
              </p>
            </div>
            <div className="min-w-0">
              <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-neutral-500">
                Status
              </p>
              <span
                className={`mt-1 inline-flex rounded-full px-2.5 py-0.5 text-sm font-medium ${progressPillClass(detailsRow.progress)}`}
              >
                {displayProgress(detailsRow.progress)}
              </span>
            </div>
            <div className="min-w-0">
              <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-neutral-500">
                Interview date
              </p>
              <p className="mt-1 text-sm text-neutral-900">
                {formatInterviewDateTime(detailsRow.interviewDateTime)}
              </p>
            </div>
            <div className="min-w-0">
              <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-neutral-500">
                Location
              </p>
              <p className="mt-1 text-sm text-neutral-900">
                {detailsRow.location || '—'}
              </p>
            </div>
          </div>
        ) : null}
      </Dialog>

      <Dialog
        open={modalOpen}
        title={editingId ? 'Edit row' : 'New row'}
        onClose={closeModal}
        panelClassName="max-w-lg"
        footer={
          <div className="flex w-full flex-wrap items-center gap-3">
            {editingId ? (
              <Button variant="danger" type="button" onClick={deleteFromModal}>
                Delete row
              </Button>
            ) : null}
            <div className="ml-auto flex flex-wrap gap-2">
              <Button variant="secondary" type="button" onClick={closeModal}>
                Cancel
              </Button>
              <Button
                variant="dark"
                type="button"
                onClick={saveRow}
                disabled={!form.name.trim()}
              >
                Save
              </Button>
            </div>
          </div>
        }
      >
        <div className="space-y-4">
          <div>
            <Label htmlFor="part-name">Name</Label>
            <Input
              id="part-name"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="Participant or interview label"
              autoFocus
            />
          </div>
          <div ref={typePickerRef} className="relative">
            <span className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-slate-500">
              Type
            </span>
            <button
              type="button"
              id="part-type-trigger"
              aria-expanded={typeMenuOpen}
              aria-haspopup="listbox"
              className="flex w-full items-center justify-between gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-left text-sm text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              onClick={() => setTypeMenuOpen((o) => !o)}
            >
              <span
                className={
                  form.participantTypes.length === 0
                    ? 'text-slate-400'
                    : 'text-slate-900'
                }
              >
                {typeSummary}
              </span>
              <span className="shrink-0 text-slate-400" aria-hidden>
                ▾
              </span>
            </button>
            {typeMenuOpen ? (
              <div
                className="absolute left-0 right-0 top-full z-20 mt-1 max-h-60 overflow-y-auto rounded-lg border border-neutral-200 bg-white py-1 shadow-lg"
                role="listbox"
                aria-multiselectable="true"
                aria-label="Participant types"
              >
                {PARTICIPATION_TYPE_OPTIONS.map((opt) => {
                  const checked = form.participantTypes.includes(opt)
                  return (
                    <label
                      key={opt}
                      className="flex cursor-pointer items-start gap-2 px-3 py-2.5 hover:bg-neutral-50"
                    >
                      <input
                        type="checkbox"
                        className="mt-0.5 h-4 w-4 shrink-0 rounded border-slate-300 text-neutral-900 focus:ring-blue-500/30"
                        checked={checked}
                        onChange={() => toggleParticipantType(opt)}
                      />
                      <span className="text-sm leading-snug text-neutral-800">
                        {opt}
                      </span>
                    </label>
                  )
                })}
              </div>
            ) : null}
          </div>
          <div>
            <Label htmlFor="part-notes">Contact</Label>
            <Textarea
              id="part-notes"
              value={form.notes}
              onChange={(e) =>
                setForm((f) => ({ ...f, notes: e.target.value }))
              }
              placeholder="Email, phone, how to reach them…"
              rows={3}
            />
          </div>
          <div>
            <Label htmlFor="part-progress">Progress</Label>
            <Select
              id="part-progress"
              value={form.progress}
              onChange={(e) =>
                setForm((f) => ({ ...f, progress: e.target.value }))
              }
            >
              {PARTICIPATION_PROGRESS_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <Label htmlFor="part-when">Date and time of interview</Label>
            <Input
              id="part-when"
              type="datetime-local"
              value={form.interviewDateTimeLocal}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  interviewDateTimeLocal: e.target.value,
                }))
              }
            />
          </div>
          <div>
            <Label htmlFor="part-loc">Location of interview</Label>
            <Input
              id="part-loc"
              value={form.location}
              onChange={(e) =>
                setForm((f) => ({ ...f, location: e.target.value }))
              }
              placeholder="Address, room, video link…"
            />
          </div>
        </div>
      </Dialog>
    </div>
  )
}
