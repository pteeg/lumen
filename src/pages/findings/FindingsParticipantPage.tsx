import { useMemo } from 'react'
import { Navigate, useParams } from 'react-router-dom'
import { useInterviewGuideWorkspaceContext } from '../../context/InterviewGuideWorkspaceContext'
import { findEligibleParticipantsForFindings } from '../../lib/findingsEligibleParticipants'

export function FindingsParticipantPage() {
  const { participantId } = useParams()
  const { participationRows } = useInterviewGuideWorkspaceContext()
  const eligible = useMemo(
    () => findEligibleParticipantsForFindings(participationRows),
    [participationRows],
  )

  if (eligible.length === 0) {
    return <Navigate to="/findings" replace />
  }

  const participant = eligible.find((p) => p.id === participantId)
  if (!participantId || !participant) {
    return <Navigate to={`/findings/${eligible[0].id}`} replace />
  }

  return null
}
