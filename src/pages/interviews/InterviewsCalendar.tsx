import { useMemo, useState } from 'react'
import { DashboardCard } from '../../components/dashboard/DashboardCard'
import { DashboardSectionLabel } from '../../components/dashboard/DashboardSectionLabel'
import { useInterviewGuideWorkspaceContext } from '../../context/InterviewGuideWorkspaceContext'
import { LUMEN_LOGO_LINEAR_GRADIENT_TO_RIGHT } from '../../lib/logoGradient'

type InterviewEvent = {
  id: string
  name: string
  progress: string
  location: string
  when: Date
}

type CalendarCell = {
  key: string
  date: Date
  inCurrentMonth: boolean
}

function dayKey(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

function parseInterviewDate(iso: string): Date | null {
  const t = iso.trim()
  if (!t) return null
  const d = new Date(t)
  return Number.isNaN(d.getTime()) ? null : d
}

function monthStart(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1)
}

function addMonths(base: Date, delta: number): Date {
  return new Date(base.getFullYear(), base.getMonth() + delta, 1)
}

function monthLabel(date: Date): string {
  return date.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })
}

function buildMonthGrid(month: Date): CalendarCell[] {
  const year = month.getFullYear()
  const monthIndex = month.getMonth()
  const first = new Date(year, monthIndex, 1)
  const firstWeekdayMon0 = (first.getDay() + 6) % 7
  const start = new Date(year, monthIndex, 1 - firstWeekdayMon0)
  const cells: CalendarCell[] = []
  for (let i = 0; i < 42; i++) {
    const d = new Date(start.getFullYear(), start.getMonth(), start.getDate() + i)
    cells.push({
      key: dayKey(d),
      date: d,
      inCurrentMonth: d.getMonth() === monthIndex,
    })
  }
  return cells
}

function eventCardClass(progress: string): string {
  const p = progress.trim().toLowerCase()
  if (p === 'confirmed' || p === 'interviewed') {
    return 'border-transparent bg-green-100 text-green-700'
  }
  if (p === 'i need to respond' || p === 'awaiting their response') {
    return 'border-transparent bg-amber-100 text-amber-700'
  }
  return 'border-transparent bg-neutral-100 text-neutral-700'
}

export function InterviewsCalendar() {
  const { participationRows } = useInterviewGuideWorkspaceContext()
  const [visibleMonth, setVisibleMonth] = useState(() => monthStart(new Date()))
  const [selectedEvent, setSelectedEvent] = useState<InterviewEvent | null>(null)
  const todayKey = dayKey(new Date())

  const interviewsByDay = useMemo(() => {
    const map = new Map<string, InterviewEvent[]>()
    for (const row of participationRows) {
      const when = parseInterviewDate(row.interviewDateTime)
      if (!when) continue
      const event: InterviewEvent = {
        id: row.id,
        name: row.name.trim() || 'Untitled interview',
        progress: row.progress.trim(),
        location: row.location.trim(),
        when,
      }
      const key = dayKey(when)
      const list = map.get(key) ?? []
      list.push(event)
      map.set(key, list)
    }
    for (const list of map.values()) {
      list.sort((a, b) => a.when.getTime() - b.when.getTime())
    }
    return map
  }, [participationRows])

  const datedCount = Array.from(interviewsByDay.values()).reduce(
    (sum, list) => sum + list.length,
    0,
  )
  const cells = useMemo(() => buildMonthGrid(visibleMonth), [visibleMonth])
  const weekdayLabels = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN']
  const selectedEventDateTime = selectedEvent?.when.toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })

  function renderTileInterviewSummary(cell: CalendarCell) {
    const events = interviewsByDay.get(cell.key)
    if (!events || events.length === 0) return null
    return (
      <div className="mt-2 space-y-1.5">
        {events.map((event) => (
          <button
            key={event.id}
            type="button"
            onClick={() => setSelectedEvent(event)}
            className={`rounded-md border px-2.5 py-2 ${eventCardClass(event.progress)}`}
          >
            <p className="line-clamp-1 text-left text-[12px] font-semibold leading-tight">
              {event.name}
            </p>
          </button>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <DashboardCard dense>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <DashboardSectionLabel>Calendar</DashboardSectionLabel>
          <p className="text-sm text-neutral-500">
            {datedCount} interview{datedCount === 1 ? '' : 's'} with dates
          </p>
        </div>

        <div className="mt-5">
          <div className="w-full">
            <div className="mb-4 flex items-center justify-center gap-4">
              <button
                type="button"
                onClick={() => setVisibleMonth((d) => addMonths(d, -1))}
                className="rounded-md px-2 py-1 text-3xl leading-none text-neutral-700"
                aria-label="Previous month"
              >
                ‹
              </button>
              <h3 className="text-[2.1rem] font-semibold tracking-tight text-neutral-900">
                {monthLabel(visibleMonth)}
              </h3>
              <button
                type="button"
                onClick={() => setVisibleMonth((d) => addMonths(d, 1))}
                className="rounded-md px-2 py-1 text-3xl leading-none text-neutral-700"
                aria-label="Next month"
              >
                ›
              </button>
            </div>

            <div className="grid grid-cols-7 border-b border-neutral-300 text-[12px] font-semibold uppercase tracking-[0.08em] text-neutral-500">
              {weekdayLabels.map((label) => (
                <div key={label} className="py-2 text-center">
                  {label}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 border-l border-t border-neutral-300">
              {cells.map((cell) => {
                const isToday = cell.key === todayKey
                return (
                  <div
                    key={cell.key}
                    className={`min-h-32 border-b border-r border-neutral-300 p-3 ${
                      cell.inCurrentMonth ? 'bg-neutral-50' : 'bg-neutral-50/70 text-neutral-400'
                    }`}
                  >
                    {isToday ? (
                      <span
                        className="inline-flex rounded-full p-[2px]"
                        style={{ backgroundImage: LUMEN_LOGO_LINEAR_GRADIENT_TO_RIGHT }}
                        aria-label="Today"
                      >
                        <span className="inline-flex h-7 min-w-7 items-center justify-center rounded-full bg-white px-1 text-[15px] font-semibold leading-none text-neutral-900">
                          {cell.date.getDate()}
                        </span>
                      </span>
                    ) : (
                      <p
                        className={`text-[15px] font-medium ${
                          cell.inCurrentMonth ? 'text-neutral-700' : 'text-neutral-400'
                        }`}
                      >
                        {cell.date.getDate()}
                      </p>
                    )}
                    {renderTileInterviewSummary(cell)}
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </DashboardCard>

      {selectedEvent ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4"
          role="presentation"
          onClick={() => setSelectedEvent(null)}
        >
          <div
            className={`w-full max-w-md rounded-2xl border bg-white p-5 shadow-xl ${eventCardClass(selectedEvent.progress)}`}
            role="dialog"
            aria-modal="true"
            aria-label="Interview details"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="text-base font-semibold leading-tight text-black">{selectedEvent.name}</p>
            <p className="mt-2 text-sm leading-tight text-black">
              {selectedEventDateTime}
            </p>
            <p className="mt-1 text-sm leading-tight text-black">
              {selectedEvent.location || 'No location'}
            </p>
            <div className="mt-4 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedEvent(null)}
                className="rounded-md border border-neutral-400 px-3 py-1.5 text-sm font-medium text-black"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
