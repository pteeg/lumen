import { createContext, useContext, type ReactNode } from 'react'
import {
  useInterviewGuideWorkspace,
  type InterviewGuideWorkspaceValue,
} from '../hooks/useInterviewGuideWorkspace'

const InterviewGuideWorkspaceContext =
  createContext<InterviewGuideWorkspaceValue | null>(null)

export function InterviewGuideWorkspaceProvider({
  children,
}: {
  children: ReactNode
}) {
  const value = useInterviewGuideWorkspace()
  return (
    <InterviewGuideWorkspaceContext.Provider value={value}>
      {children}
    </InterviewGuideWorkspaceContext.Provider>
  )
}

export function useInterviewGuideWorkspaceContext(): InterviewGuideWorkspaceValue {
  const ctx = useContext(InterviewGuideWorkspaceContext)
  if (!ctx) {
    throw new Error(
      'useInterviewGuideWorkspaceContext must be used within InterviewGuideWorkspaceProvider',
    )
  }
  return ctx
}
