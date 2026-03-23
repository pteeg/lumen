import { doc, type DocumentReference } from 'firebase/firestore'
import { db } from './firebase'
import type {
  InterviewGuideQuestion,
  InterviewGuideSection,
} from '../types/interviewGuide'

export const INTERVIEW_GUIDES_COLLECTION = 'interviewGuides'

export function getInterviewGuideDocRef(docId: string): DocumentReference {
  return doc(db, INTERVIEW_GUIDES_COLLECTION, docId)
}

export type InterviewGuideFirestorePayload = {
  guideTitle: string
  sections: InterviewGuideSection[]
  questions: InterviewGuideQuestion[]
}

export function serializeInterviewGuideState(
  guideTitle: string,
  sections: InterviewGuideSection[],
  questions: InterviewGuideQuestion[],
): string {
  return JSON.stringify({ guideTitle, sections, questions })
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
    }
  }
  const d = data as Record<string, unknown>
  return {
    guideTitle:
      typeof d.guideTitle === 'string' ? d.guideTitle : 'Venue Interview Guide',
    sections: Array.isArray(d.sections)
      ? (d.sections as InterviewGuideSection[])
      : [],
    questions: Array.isArray(d.questions)
      ? (d.questions as InterviewGuideQuestion[])
      : [],
  }
}
