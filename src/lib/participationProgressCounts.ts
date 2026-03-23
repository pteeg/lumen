import type { InterviewParticipationRow } from '../types/interviewGuide'
import { PARTICIPATION_PROGRESS_OPTIONS } from '../types/interviewGuide'

const ALLOWED = new Set<string>(PARTICIPATION_PROGRESS_OPTIONS)

/** Map stored progress to a known bucket (legacy text → Not contacted). */
export function participationProgressBucket(progress: string): string {
  const t = progress.trim()
  if (ALLOWED.has(t)) return t
  return PARTICIPATION_PROGRESS_OPTIONS[0]
}

/** Counts per progress stage, in PARTICIPATION_PROGRESS_OPTIONS order. */
export function countParticipationRowsByProgress(
  rows: InterviewParticipationRow[],
): { label: string; count: number }[] {
  const counts = new Map<string, number>()
  for (const label of PARTICIPATION_PROGRESS_OPTIONS) {
    counts.set(label, 0)
  }
  for (const row of rows) {
    const key = participationProgressBucket(row.progress)
    counts.set(key, (counts.get(key) ?? 0) + 1)
  }
  return PARTICIPATION_PROGRESS_OPTIONS.map((label) => ({
    label,
    count: counts.get(label) ?? 0,
  }))
}
