import { doc, type DocumentReference } from 'firebase/firestore'
import { db } from './firebase'
import type {
  InterviewGuideQuestion,
  InterviewGuideSection,
  InterviewGuideThought,
  InterviewParticipationRow,
} from '../types/interviewGuide'
import {
  WRITE_UP_SECTIONS,
  type WriteUpSectionId,
  emptyWriteUpContent,
} from './writeUpSections'

function parseWriteUpContent(raw: unknown): Record<WriteUpSectionId, string> {
  const base = emptyWriteUpContent()
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return base
  const m = raw as Record<string, unknown>
  const next = { ...base }
  for (const { id } of WRITE_UP_SECTIONS) {
    const v = m[id]
    if (typeof v === 'string') next[id] = v
  }
  return next
}

export const INTERVIEW_GUIDES_COLLECTION = 'interviewGuides'

export function getInterviewGuideDocRef(docId: string): DocumentReference {
  return doc(db, INTERVIEW_GUIDES_COLLECTION, docId)
}

export type InterviewGuideFirestorePayload = {
  guideTitle: string
  sections: InterviewGuideSection[]
  questions: InterviewGuideQuestion[]
  thoughts: InterviewGuideThought[]
  participationRows: InterviewParticipationRow[]
  /** Dashboard main research question (same meaning as `ResearchProject.researchQuestion`) */
  researchQuestion: string
  subQuestions: string[]
  researchAim?: string
  /** Write-up tab bodies keyed by section id */
  writeUpContent: Record<WriteUpSectionId, string>
}

export function serializeInterviewGuideState(
  guideTitle: string,
  sections: InterviewGuideSection[],
  questions: InterviewGuideQuestion[],
  thoughts: InterviewGuideThought[],
  participationRows: InterviewParticipationRow[],
  researchQuestion: string,
  subQuestions: string[],
  researchAim: string | undefined,
  writeUpContent: Record<WriteUpSectionId, string>,
): string {
  return JSON.stringify({
    guideTitle,
    sections,
    questions,
    thoughts,
    participationRows,
    researchQuestion,
    subQuestions,
    researchAim,
    writeUpContent,
  })
}

/** Map Firestore document data into workspace state (ignores server-only fields). */
export function parseInterviewGuideFromFirestore(
  data: unknown,
): InterviewGuideFirestorePayload {
  if (!data || typeof data !== 'object') {
    return {
      guideTitle: 'Venue Interview Guide',
      sections: [],
      questions: [],
      thoughts: [],
      participationRows: [],
      researchQuestion: '',
      subQuestions: [],
      researchAim: undefined,
      writeUpContent: emptyWriteUpContent(),
    }
  }
  const d = data as Record<string, unknown>
  const subQ = Array.isArray(d.subQuestions)
    ? (d.subQuestions as unknown[]).filter((s): s is string => typeof s === 'string')
    : []
  return {
    guideTitle:
      typeof d.guideTitle === 'string' ? d.guideTitle : 'Venue Interview Guide',
    sections: Array.isArray(d.sections)
      ? (d.sections as InterviewGuideSection[])
      : [],
    questions: Array.isArray(d.questions)
      ? (d.questions as InterviewGuideQuestion[])
      : [],
    thoughts: Array.isArray(d.thoughts)
      ? (d.thoughts as InterviewGuideThought[])
      : [],
    participationRows: Array.isArray(d.participationRows)
      ? (d.participationRows as InterviewParticipationRow[])
      : [],
    researchQuestion:
      typeof d.researchQuestion === 'string' ? d.researchQuestion : '',
    subQuestions: subQ,
    researchAim:
      typeof d.researchAim === 'string' && d.researchAim.trim()
        ? d.researchAim
        : undefined,
    writeUpContent: parseWriteUpContent(d.writeUpContent),
  }
}
