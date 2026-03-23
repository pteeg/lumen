import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { onAuthStateChanged, signInAnonymously } from 'firebase/auth'
import { onSnapshot, serverTimestamp, setDoc } from 'firebase/firestore'
import { auth } from '../lib/firebase'
import {
  getInterviewGuideDocRef,
  parseInterviewGuideFromFirestore,
  serializeInterviewGuideState,
} from '../lib/interviewGuideFirestore'
import type {
  InterviewGuideQuestion,
  InterviewGuideSection,
} from '../types/interviewGuide'

const FIRESTORE_SYNC_ENABLED =
  import.meta.env.VITE_DISABLE_INTERVIEW_GUIDE_FIRESTORE !== 'true'

const INTERVIEW_GUIDE_DOC_ID =
  import.meta.env.VITE_FIRESTORE_INTERVIEW_GUIDE_DOC_ID ?? 'main'

const SAVE_DEBOUNCE_MS = 600

function newId(prefix: string) {
  return `${prefix}-${crypto.randomUUID().slice(0, 8)}`
}

function sortSections(s: InterviewGuideSection[]) {
  return [...s].sort((a, b) => a.order - b.order)
}

function sortQuestions(q: InterviewGuideQuestion[]) {
  return [...q].sort((a, b) => a.order - b.order)
}

export function useInterviewGuideWorkspace() {
  const [guideTitle, setGuideTitle] = useState('Venue Interview Guide')
  const [sections, setSections] = useState<InterviewGuideSection[]>([])
  const [questions, setQuestions] = useState<InterviewGuideQuestion[]>([])

  const [firestoreSyncStatus, setFirestoreSyncStatus] = useState<
    'loading' | 'ready' | 'error'
  >(() => (FIRESTORE_SYNC_ENABLED ? 'loading' : 'ready'))
  const [firestoreError, setFirestoreError] = useState<string | null>(null)
  /** Anonymous (or failed attempt) finished — safe to attach Firestore listeners. */
  const [firebaseAuthGateReady, setFirebaseAuthGateReady] = useState(
    () => !FIRESTORE_SYNC_ENABLED,
  )
  const lastSavedSerialized = useRef<string | null>(null)

  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(null)
  const [selectedQuestionId, setSelectedQuestionId] = useState<string | null>(
    null,
  )

  useEffect(() => {
    if (selectedQuestionId && !questions.some((q) => q.id === selectedQuestionId)) {
      setSelectedQuestionId(null)
    }
  }, [questions, selectedQuestionId])

  useEffect(() => {
    if (selectedSectionId && !sections.some((s) => s.id === selectedSectionId)) {
      setSelectedSectionId(sections[0]?.id ?? null)
    }
  }, [sections, selectedSectionId])

  /**
   * Sign in anonymously so Firestore rules can use `request.auth != null`.
   * We only attach Firestore after `onAuthStateChanged` reports a user — otherwise
   * the first `onSnapshot` can run before the auth token is wired to Firestore.
   */
  useEffect(() => {
    if (!FIRESTORE_SYNC_ENABLED) return

    const unsubAuth = onAuthStateChanged(auth, (user) => {
      setFirebaseAuthGateReady(user !== null)
    })

    signInAnonymously(auth).catch((err: Error & { code?: string }) => {
      console.error('[Lumen] Anonymous sign-in failed:', err)
      setFirestoreSyncStatus('error')
      if (err.code === 'auth/operation-not-allowed') {
        setFirestoreError(
          'Anonymous sign-in is turned off. In Firebase Console open Authentication → Sign-in method → Anonymous → Enable, then reload.',
        )
      } else if (err.code === 'auth/admin-restricted-operation') {
        setFirestoreError(
          'Sign-in blocked for this project (e.g. App Check or policy). Check Firebase Console → Authentication and App Check settings.',
        )
      } else {
        setFirestoreError(
          err.message ??
            'Could not sign in anonymously. Firestore rules require a signed-in user.',
        )
      }
    })

    return () => unsubAuth()
  }, [])

  /** Load interview guide from Firestore and keep it subscribed for multi-tab sync. */
  useEffect(() => {
    if (!FIRESTORE_SYNC_ENABLED || !firebaseAuthGateReady) return

    const docRef = getInterviewGuideDocRef(INTERVIEW_GUIDE_DOC_ID)
    const unsub = onSnapshot(
      docRef,
      (snap) => {
        const parsed = snap.exists()
          ? parseInterviewGuideFromFirestore(snap.data())
          : {
              guideTitle: 'Venue Interview Guide',
              sections: [] as InterviewGuideSection[],
              questions: [] as InterviewGuideQuestion[],
            }
        setGuideTitle(parsed.guideTitle)
        setSections(parsed.sections)
        setQuestions(parsed.questions)
        lastSavedSerialized.current = serializeInterviewGuideState(
          parsed.guideTitle,
          parsed.sections,
          parsed.questions,
        )
        setFirestoreSyncStatus('ready')
        setFirestoreError(null)
      },
      (err) => {
        console.error(err)
        setFirestoreSyncStatus('error')
        setFirestoreError(
          `${err.message ?? 'Firestore sync failed'} — In Firebase Console: enable Firestore, publish rules for \`interviewGuides/{docId}\`, and under Authentication enable the Anonymous provider if your rules require sign-in.`,
        )
      },
    )
    return () => unsub()
  }, [firebaseAuthGateReady])

  /** Debounced save — skips when payload matches last snapshot or last successful write. */
  useEffect(() => {
    if (!FIRESTORE_SYNC_ENABLED) return
    if (firestoreSyncStatus !== 'ready') return

    const serialized = serializeInterviewGuideState(
      guideTitle,
      sections,
      questions,
    )
    if (serialized === lastSavedSerialized.current) return

    const t = window.setTimeout(() => {
      const docRef = getInterviewGuideDocRef(INTERVIEW_GUIDE_DOC_ID)
      setDoc(docRef, {
        guideTitle,
        sections,
        questions,
        updatedAt: serverTimestamp(),
      })
        .then(() => {
          lastSavedSerialized.current = serialized
          setFirestoreError(null)
          setFirestoreSyncStatus('ready')
        })
        .catch((err: Error) => {
          console.error(err)
          setFirestoreSyncStatus('error')
          setFirestoreError(err.message ?? 'Failed to save to Firestore')
        })
    }, SAVE_DEBOUNCE_MS)

    return () => window.clearTimeout(t)
  }, [
    FIRESTORE_SYNC_ENABLED,
    firestoreSyncStatus,
    guideTitle,
    sections,
    questions,
  ])

  const sectionsSorted = useMemo(() => sortSections(sections), [sections])

  const questionsInSelectedSection = useMemo(() => {
    if (!selectedSectionId) return []
    return sortQuestions(
      questions.filter((q) => q.sectionId === selectedSectionId),
    )
  }, [questions, selectedSectionId])

  const selectedQuestion = useMemo(
    () => questions.find((q) => q.id === selectedQuestionId) ?? null,
    [questions, selectedQuestionId],
  )

  const questionCountBySection = useMemo(() => {
    const map = new Map<string, number>()
    for (const s of sections) map.set(s.id, 0)
    for (const q of questions) {
      map.set(q.sectionId, (map.get(q.sectionId) ?? 0) + 1)
    }
    return map
  }, [sections, questions])

  const addSection = useCallback(
    (title: string) => {
      const trimmed = title.trim()
      if (!trimmed) return
      const maxOrder = sections.reduce((m, s) => Math.max(m, s.order), -1)
      const sec: InterviewGuideSection = {
        id: newId('sec'),
        title: trimmed,
        order: maxOrder + 1,
      }
      setSections((prev) => sortSections([...prev, sec]))
      setSelectedSectionId(sec.id)
      setSelectedQuestionId(null)
    },
    [sections],
  )

  const updateSection = useCallback(
    (id: string, patch: Partial<Pick<InterviewGuideSection, 'title' | 'order'>>) => {
      setSections((prev) =>
        prev.map((s) => (s.id === id ? { ...s, ...patch } : s)),
      )
    },
    [],
  )

  const deleteSection = useCallback((id: string) => {
    if (!window.confirm('Delete this section and all questions inside it?')) return
    setSections((prev) =>
      sortSections(
        prev
          .filter((s) => s.id !== id)
          .map((s, i) => ({ ...s, order: i })),
      ),
    )
    setQuestions((prev) => prev.filter((q) => q.sectionId !== id))
    setSelectedSectionId((sel) => (sel === id ? null : sel))
    setSelectedQuestionId((qid) => {
      if (!qid) return null
      const q = questions.find((x) => x.id === qid)
      if (q?.sectionId === id) return null
      return qid
    })
  }, [questions])

  const addQuestionToSection = useCallback(
    (sectionId: string, questionText: string) => {
      const trimmed = questionText.trim()
      if (!trimmed) return
      const inSec = questions.filter((q) => q.sectionId === sectionId)
      const maxOrder = inSec.reduce((m, q) => Math.max(m, q.order), -1)
      const q: InterviewGuideQuestion = {
        id: newId('q'),
        sectionId,
        questionText: trimmed,
        rationale: '',
        learningGoal: '',
        followUpProbes: '',
        theme: '',
        priority: 'medium',
        status: 'draft',
        wordingNotes: '',
        possibleFindingsLink: '',
        order: maxOrder + 1,
      }
      setQuestions((prev) => [...prev, q])
      setSelectedSectionId(sectionId)
    },
    [questions],
  )

  /** Reassign `order` from 0..n-1 following `orderedQuestionIds` (same section). */
  const reorderQuestionsInSection = useCallback(
    (sectionId: string, orderedQuestionIds: string[]) => {
      setQuestions((prev) => {
        const orderMap = new Map(
          orderedQuestionIds.map((id, index) => [id, index]),
        )
        return prev.map((q) => {
          if (q.sectionId !== sectionId) return q
          const ord = orderMap.get(q.id)
          if (ord === undefined) return q
          return { ...q, order: ord }
        })
      })
    },
    [],
  )

  const updateQuestion = useCallback(
    (id: string, patch: Partial<InterviewGuideQuestion>) => {
      setQuestions((prev) =>
        prev.map((q) => (q.id === id ? { ...q, ...patch } : q)),
      )
    },
    [],
  )

  const deleteQuestion = useCallback((id: string) => {
    if (!window.confirm('Delete this question?')) return
    setQuestions((prev) => {
      const target = prev.find((q) => q.id === id)
      if (!target) return prev
      const sectionId = target.sectionId
      const next = prev.filter((q) => q.id !== id)
      const same = sortQuestions(next.filter((q) => q.sectionId === sectionId))
      return next.map((q) => {
        if (q.sectionId !== sectionId) return q
        const idx = same.findIndex((x) => x.id === q.id)
        return { ...q, order: idx }
      })
    })
    setSelectedQuestionId((cur) => (cur === id ? null : cur))
  }, [])

  const duplicateQuestion = useCallback((id: string) => {
    let newQuestionId: string | null = null
    setQuestions((prev) => {
      const source = prev.find((q) => q.id === id)
      if (!source) return prev
      const sectionId = source.sectionId
      const inSec = sortQuestions(prev.filter((q) => q.sectionId === sectionId))
      const maxOrder = inSec.reduce((m, q) => Math.max(m, q.order), -1)
      const copy: InterviewGuideQuestion = {
        ...source,
        id: newId('q'),
        questionText: source.questionText
          ? `${source.questionText} (copy)`
          : '',
        order: maxOrder + 1,
        status: 'draft',
      }
      newQuestionId = copy.id
      return [...prev, copy]
    })
    if (newQuestionId) setSelectedQuestionId(newQuestionId)
  }, [])

  const selectSection = useCallback((id: string) => {
    setSelectedSectionId(id)
    setSelectedQuestionId(null)
  }, [])

  const selectQuestion = useCallback((id: string | null) => {
    setSelectedQuestionId(id)
  }, [])

  return {
    guideTitle,
    setGuideTitle,
    sections: sectionsSorted,
    questions,
    questionsInSelectedSection,
    selectedSectionId,
    selectedQuestion,
    selectedQuestionId,
    questionCountBySection,
    firestoreSyncStatus,
    firestoreError,
    addSection,
    updateSection,
    deleteSection,
    addQuestionToSection,
    reorderQuestionsInSection,
    updateQuestion,
    deleteQuestion,
    duplicateQuestion,
    selectSection,
    selectQuestion,
  }
}

export type InterviewGuideWorkspaceValue = ReturnType<
  typeof useInterviewGuideWorkspace
>
