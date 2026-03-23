import { useMemo } from 'react'
import { Navigate } from 'react-router-dom'
import { useInterviewGuideWorkspaceContext } from '../../context/InterviewGuideWorkspaceContext'
import { findEligibleParticipantsForFindings } from '../../lib/findingsEligibleParticipants'

export function FindingsIndexPage() {
  const { participationRows } = useInterviewGuideWorkspaceContext()
  const eligible = useMemo(
    () => findEligibleParticipantsForFindings(participationRows),
    [participationRows],
  )

  if (eligible.length > 0) {
    return <Navigate to={`/findings/${eligible[0].id}`} replace />
  }

  return null
}
