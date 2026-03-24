import { useEffect, useMemo, useRef, useState } from 'react'
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

export function InterviewsParticipation() {
  const {
    participationRows,
    addParticipationRow,
    updateParticipationRow,
    deleteParticipationRow,
  } = useInterviewGuideWorkspaceContext()

  const [modalOpen, setModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<ParticipationFormState>(emptyForm)
  const [typeMenuOpen, setTypeMenuOpen] = useState(false)
  const typePickerRef = useRef<HTMLDivElement>(null)

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

        <div className="mt-4 overflow-x-auto rounded-xl border border-neutral-200/80">
          <table className="w-full min-w-[800px] text-left text-sm">
            <thead className="border-b border-neutral-200 bg-neutral-50/90 text-[11px] font-semibold uppercase tracking-[0.12em] text-neutral-500">
              <tr>
                <th className="px-4 py-3 font-semibold">Name</th>
                <th className="px-4 py-3 font-semibold">Type</th>
                <th className="px-4 py-3 font-semibold">Contact</th>
                <th className="px-4 py-3 font-semibold">Progress</th>
                <th className="px-4 py-3 font-semibold">Date &amp; time</th>
                <th className="px-4 py-3 font-semibold">Location</th>
                <th className="px-4 py-3 font-semibold"> </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {participationRows.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-4 py-10 text-center text-sm text-neutral-500"
                  >
                    No rows yet. Use Add row to track interviews.
                  </td>
                </tr>
              ) : (
                participationRows.map((row) => (
                  <tr key={row.id} className="bg-white">
                    <td className="max-w-[140px] px-4 py-3 align-top font-medium text-neutral-900">
                      {row.name}
                    </td>
                    <td className="max-w-[200px] px-4 py-3 align-top text-neutral-700">
                      <span className="line-clamp-3 break-words">
                        {formatTypes(sanitizeParticipantTypes(row.participantTypes))}
                      </span>
                    </td>
                    <td className="max-w-[220px] px-4 py-3 align-top text-neutral-700">
                      <span className="line-clamp-4 whitespace-pre-wrap break-words">
                        {row.notes || '—'}
                      </span>
                    </td>
                    <td className="min-w-[10rem] max-w-[220px] px-4 py-3 align-top text-neutral-700">
                      {displayProgress(row.progress)}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 align-top text-neutral-700">
                      {formatInterviewDateTime(row.interviewDateTime)}
                    </td>
                    <td className="max-w-[160px] px-4 py-3 align-top text-neutral-700">
                      <span className="line-clamp-3 break-words">
                        {row.location || '—'}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 align-top">
                      <Button
                        variant="ghost"
                        type="button"
                        className="px-2 py-1 text-xs font-medium text-neutral-600"
                        onClick={() => openEdit(row)}
                      >
                        Edit
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </DashboardCard>

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
