import { useMemo } from 'react'
import { Outlet } from 'react-router-dom'
import { FindingsPageTabs } from '../../components/findings/FindingsPageTabs'
import { useInterviewGuideWorkspaceContext } from '../../context/InterviewGuideWorkspaceContext'
import { findEligibleParticipantsForFindings } from '../../lib/findingsEligibleParticipants'

export function FindingsLayout() {
  const { participationRows } = useInterviewGuideWorkspaceContext()
  const eligible = useMemo(
    () => findEligibleParticipantsForFindings(participationRows),
    [participationRows],
  )

  return (
    <div>
      {eligible.length > 0 ? <FindingsPageTabs participants={eligible} /> : null}
      <Outlet />
    </div>
  )
}
