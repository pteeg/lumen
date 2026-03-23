import type { InterviewParticipationRow } from '../types/interviewGuide'

/** Earliest participation row whose interview is at or after `nowMs`. */
export function pickNextUpcomingParticipationRow(
  rows: InterviewParticipationRow[],
  nowMs: number = Date.now(),
): InterviewParticipationRow | null {
  let best: { row: InterviewParticipationRow; t: number } | null = null
  for (const row of rows) {
    const raw = row.interviewDateTime?.trim()
    if (!raw) continue
    const t = new Date(raw).getTime()
    if (Number.isNaN(t) || t < nowMs) continue
    if (!best || t < best.t) best = { row, t }
  }
  return best?.row ?? null
}

export function formatParticipationInterviewWhen(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  return d.toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  })
}
