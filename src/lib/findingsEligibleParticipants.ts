import type { InterviewParticipationRow } from '../types/interviewGuide'

/** Participants who may appear as Findings tabs (matches Participation progress options). */
export function findEligibleParticipantsForFindings(
  rows: InterviewParticipationRow[],
): InterviewParticipationRow[] {
  return rows.filter(
    (r) => r.progress === 'Confirmed' || r.progress === 'Interviewed',
  )
}
