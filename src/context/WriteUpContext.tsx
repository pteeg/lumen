import { useMemo } from 'react'
import { countWords } from '../lib/wordCount'
import {
  WRITE_UP_WORD_COUNT_SECTION_IDS,
  WRITE_UP_WORD_GOAL,
} from '../lib/writeUpWordGoal'
import type { WriteUpSectionId } from '../lib/writeUpSections'
import { useInterviewGuideWorkspaceContext } from './InterviewGuideWorkspaceContext'

/** Write-up tab text lives on the interview guide Firestore doc; use interview workspace. */
export function useWriteUp() {
  const { writeUpContent, setWriteUpSectionContent } =
    useInterviewGuideWorkspaceContext()
  return {
    content: writeUpContent,
    setSectionContent: (id: WriteUpSectionId, value: string) =>
      setWriteUpSectionContent(id, value),
  }
}

export function useWriteUpBodyWordStats() {
  const { writeUpContent } = useInterviewGuideWorkspaceContext()
  return useMemo(() => {
    const totalWords = WRITE_UP_WORD_COUNT_SECTION_IDS.reduce(
      (sum, id) => sum + countWords(writeUpContent[id] ?? ''),
      0,
    )
    const percent = Math.min(
      100,
      WRITE_UP_WORD_GOAL > 0 ? (totalWords / WRITE_UP_WORD_GOAL) * 100 : 0,
    )
    return {
      totalWords,
      goal: WRITE_UP_WORD_GOAL,
      percent,
    }
  }, [writeUpContent])
}
