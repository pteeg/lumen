import { useState } from 'react'
import { Textarea } from '../components/ui/Field'

export function Thesis() {
  const [text, setText] = useState('')

  return (
    <Textarea
      value={text}
      onChange={(e) => setText(e.target.value)}
      aria-label="Thesis"
      placeholder="Start writing…"
      rows={20}
      className="min-h-[min(32rem,60vh)] w-full resize-y"
    />
  )
}
