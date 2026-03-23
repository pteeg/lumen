import { Outlet } from 'react-router-dom'
import { InterviewPageTabs } from '../../components/interviewGuide'
import {
  InterviewGuideWorkspaceProvider,
  useInterviewGuideWorkspaceContext,
} from '../../context/InterviewGuideWorkspaceContext'

function InterviewGuideFirestoreStatus() {
  const { firestoreSyncStatus, firestoreError } =
    useInterviewGuideWorkspaceContext()

  if (firestoreError) {
    return (
      <p
        className="mb-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800"
        role="alert"
      >
        {firestoreError}
      </p>
    )
  }

  if (firestoreSyncStatus === 'loading') {
    return (
      <p className="mb-3 text-sm text-neutral-500">Loading interview guide…</p>
    )
  }

  return null
}

function InterviewsLayoutInner() {
  return (
    <div>
      <InterviewGuideFirestoreStatus />
      <InterviewPageTabs />
      <Outlet />
    </div>
  )
}

export function InterviewsLayout() {
  return (
    <InterviewGuideWorkspaceProvider>
      <InterviewsLayoutInner />
    </InterviewGuideWorkspaceProvider>
  )
}
