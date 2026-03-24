import { Navigate, useParams } from 'react-router-dom'
import { WordGoalPieTile } from '../../components/dashboard'
import { Label, Textarea } from '../../components/ui/Field'
import { useWriteUp } from '../../context/WriteUpContext'
import {
  WRITE_UP_SECTIONS,
  isWriteUpSectionId,
  type WriteUpSectionId,
} from '../../lib/writeUpSections'

export function WriteUpSectionPage() {
  const { section } = useParams()
  const { content, setSectionContent } = useWriteUp()

  if (!section || !isWriteUpSectionId(section)) {
    return <Navigate to="/write-up/overview" replace />
  }

  const id: WriteUpSectionId = section

  const meta = WRITE_UP_SECTIONS.find((s) => s.id === id)

  if (id === 'overview') {
    return <WordGoalPieTile showOpenWriteUpLink={false} />
  }

  return (
    <div>
      <Label htmlFor={`write-up-${id}`}>{meta?.label ?? 'Section'}</Label>
      <Textarea
        id={`write-up-${id}`}
        value={content[id]}
        onChange={(e) => setSectionContent(id, e.target.value)}
        placeholder="Start writing…"
        rows={16}
        className="mt-2 min-h-[min(28rem,55vh)] resize-y"
      />
    </div>
  )
}
