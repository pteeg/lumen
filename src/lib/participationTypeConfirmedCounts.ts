import type { InterviewParticipationRow } from '../types/interviewGuide'
import { PARTICIPATION_TYPE_OPTIONS } from '../types/interviewGuide'
import { participationProgressBucket } from './participationProgressCounts'

const CONFIRMED = 'Confirmed'

const OTHER_KEY = 'Other'

/** Rows with a type tag count once per type (multi-type rows count in each bucket). */
export function countParticipationByTypeConfirmed(
  rows: InterviewParticipationRow[],
): { typeLabel: string; total: number; confirmed: number }[] {
  const allowed = new Set<string>(PARTICIPATION_TYPE_OPTIONS)
  const byType = PARTICIPATION_TYPE_OPTIONS.map((typeLabel) => {
    let total = 0
    let confirmed = 0
    for (const row of rows) {
      const types = row.participantTypes.filter((t) => allowed.has(t))
      if (!types.includes(typeLabel)) continue
      total += 1
      if (participationProgressBucket(row.progress) === CONFIRMED) {
        confirmed += 1
      }
    }
    return { typeLabel, total, confirmed }
  })

  let otherTotal = 0
  let otherConfirmed = 0
  for (const row of rows) {
    const types = row.participantTypes.filter((t) => allowed.has(t))
    if (types.length > 0) continue
    otherTotal += 1
    if (participationProgressBucket(row.progress) === CONFIRMED) {
      otherConfirmed += 1
    }
  }

  return [...byType, { typeLabel: OTHER_KEY, total: otherTotal, confirmed: otherConfirmed }]
}
