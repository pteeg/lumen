import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import {
  seedFindingsThemes,
  seedInterviewQuestions,
  seedProject,
} from '../data/seed'
import type {
  FindingsTheme,
  InterviewQuestion,
  InterviewSection,
  ResearchProject,
} from '../types/research'
import { INTERVIEW_SECTIONS } from '../types/research'

interface ResearchContextValue {
  project: ResearchProject
  setProject: (p: ResearchProject) => void
  updateProject: (patch: Partial<ResearchProject>) => void

  interviewQuestions: InterviewQuestion[]
  addInterviewQuestion: (section?: InterviewSection) => InterviewQuestion
  updateInterviewQuestion: (
    id: string,
    patch: Partial<InterviewQuestion>,
  ) => void
  deleteInterviewQuestion: (id: string) => void
  moveQuestionInSection: (
    id: string,
    direction: 'up' | 'down',
  ) => void

  findingsThemes: FindingsTheme[]
  addFindingsTheme: () => FindingsTheme
  updateFindingsTheme: (id: string, patch: Partial<FindingsTheme>) => void
  deleteFindingsTheme: (id: string) => void
}

const ResearchContext = createContext<ResearchContextValue | null>(null)

function sortQuestions(list: InterviewQuestion[]): InterviewQuestion[] {
  const sectionOrder = new Map(
    INTERVIEW_SECTIONS.map((s, i) => [s, i] as const),
  )
  return [...list].sort((a, b) => {
    const sa = sectionOrder.get(a.section) ?? 99
    const sb = sectionOrder.get(b.section) ?? 99
    if (sa !== sb) return sa - sb
    return a.orderIndex - b.orderIndex
  })
}

export function ResearchProvider({ children }: { children: ReactNode }) {
  const [project, setProject] = useState<ResearchProject>(seedProject)
  const [interviewQuestions, setInterviewQuestions] = useState<
    InterviewQuestion[]
  >(() => sortQuestions(seedInterviewQuestions))
  const [findingsThemes, setFindingsThemes] = useState<FindingsTheme[]>(
    seedFindingsThemes,
  )

  const updateProject = useCallback((patch: Partial<ResearchProject>) => {
    setProject((prev) => ({ ...prev, ...patch }))
  }, [])

  const addInterviewQuestion = useCallback(
    (section: InterviewSection = INTERVIEW_SECTIONS[0]) => {
      const id = crypto.randomUUID()
      let created!: InterviewQuestion
      setInterviewQuestions((prev) => {
        const inSection = prev.filter((q) => q.section === section)
        const nextOrder =
          inSection.length === 0
            ? 0
            : Math.max(...inSection.map((q) => q.orderIndex)) + 1
        created = {
          id,
          section,
          orderIndex: nextOrder,
          questionText: 'New interview question',
          rationale: '',
          learningGoal: '',
          notes: '',
          theme: '',
          audienceType: 'all',
          priority: 'medium',
          status: 'draft',
        }
        return sortQuestions([...prev, created])
      })
      return created
    },
    [],
  )

  const updateInterviewQuestion = useCallback(
    (id: string, patch: Partial<InterviewQuestion>) => {
      setInterviewQuestions((prev) => {
        const merged = prev.map((q) => (q.id === id ? { ...q, ...patch } : q))
        if (patch.section !== undefined) {
          const updated = merged.find((q) => q.id === id)
          if (updated) {
            const others = merged.filter(
              (q) => q.section === updated.section && q.id !== id,
            )
            const maxOrder =
              others.length === 0
                ? -1
                : Math.max(...others.map((q) => q.orderIndex))
            return sortQuestions(
              merged.map((q) =>
                q.id === id ? { ...q, orderIndex: maxOrder + 1 } : q,
              ),
            )
          }
        }
        return sortQuestions(merged)
      })
    },
    [],
  )

  const deleteInterviewQuestion = useCallback((id: string) => {
    setInterviewQuestions((prev) => prev.filter((q) => q.id !== id))
  }, [])

  const moveQuestionInSection = useCallback(
    (id: string, direction: 'up' | 'down') => {
      setInterviewQuestions((prev) => {
        const q = prev.find((x) => x.id === id)
        if (!q) return prev
        const same = prev
          .filter((x) => x.section === q.section)
          .sort((a, b) => a.orderIndex - b.orderIndex)
        const idx = same.findIndex((x) => x.id === id)
        const swapWith = direction === 'up' ? idx - 1 : idx + 1
        if (swapWith < 0 || swapWith >= same.length) return prev
        const a = same[idx]
        const b = same[swapWith]
        const next = prev.map((row) => {
          if (row.id === a.id) return { ...row, orderIndex: b.orderIndex }
          if (row.id === b.id) return { ...row, orderIndex: a.orderIndex }
          return row
        })
        return sortQuestions(next)
      })
    },
    [],
  )

  const addFindingsTheme = useCallback(() => {
    const t: FindingsTheme = {
      id: crypto.randomUUID(),
      title: 'New theme',
      description: '',
      possibleEvidence: '',
      linkedInterviewQuestionIds: [],
      notes: '',
      essayStructure: '',
    }
    setFindingsThemes((prev) => [...prev, t])
    return t
  }, [])

  const updateFindingsTheme = useCallback(
    (id: string, patch: Partial<FindingsTheme>) => {
      setFindingsThemes((prev) =>
        prev.map((t) => (t.id === id ? { ...t, ...patch } : t)),
      )
    },
    [],
  )

  const deleteFindingsTheme = useCallback((id: string) => {
    setFindingsThemes((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const value = useMemo<ResearchContextValue>(
    () => ({
      project,
      setProject,
      updateProject,
      interviewQuestions,
      addInterviewQuestion,
      updateInterviewQuestion,
      deleteInterviewQuestion,
      moveQuestionInSection,
      findingsThemes,
      addFindingsTheme,
      updateFindingsTheme,
      deleteFindingsTheme,
    }),
    [
      project,
      updateProject,
      interviewQuestions,
      addInterviewQuestion,
      updateInterviewQuestion,
      deleteInterviewQuestion,
      moveQuestionInSection,
      findingsThemes,
      addFindingsTheme,
      updateFindingsTheme,
      deleteFindingsTheme,
    ],
  )

  return (
    <ResearchContext.Provider value={value}>{children}</ResearchContext.Provider>
  )
}

export function useResearch() {
  const ctx = useContext(ResearchContext)
  if (!ctx) {
    throw new Error('useResearch must be used within ResearchProvider')
  }
  return ctx
}
