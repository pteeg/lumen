import { useEffect, useMemo, useState } from 'react'
import { FindingsThemeEditor } from '../components/findings/FindingsThemeEditor'
import { Card, CardBody } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { SlideOver } from '../components/ui/SlideOver'
import { useResearch } from '../context/ResearchContext'

export function Findings() {
  const {
    findingsThemes,
    interviewQuestions,
    addFindingsTheme,
    updateFindingsTheme,
    deleteFindingsTheme,
  } = useResearch()

  const [selectedId, setSelectedId] = useState<string | null>(null)

  const selected = useMemo(
    () => findingsThemes.find((t) => t.id === selectedId) ?? null,
    [findingsThemes, selectedId],
  )

  useEffect(() => {
    if (selectedId && !selected) setSelectedId(null)
  }, [selectedId, selected])

  function handleAdd() {
    const t = addFindingsTheme()
    setSelectedId(t.id)
  }

  return (
    <div>
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <p className="max-w-xl text-sm leading-relaxed text-neutral-600">
          Sketch how interview themes might later organise your essay—without
          full analysis yet.
        </p>
        <Button variant="dark" onClick={handleAdd}>
          Add theme
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {findingsThemes.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setSelectedId(t.id)}
            className="text-left"
          >
            <Card className="h-full rounded-[1.25rem] border-0 shadow-[0_16px_40px_-16px_rgba(0,0,0,0.1)] transition hover:shadow-[0_20px_50px_-12px_rgba(0,0,0,0.12)]">
              <CardBody className="!py-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h2 className="text-base font-semibold tracking-tight text-neutral-900">
                      {t.title}
                    </h2>
                    {t.description ? (
                      <p className="mt-2 text-sm leading-relaxed text-neutral-600 line-clamp-3">
                        {t.description}
                      </p>
                    ) : (
                      <p className="mt-2 text-sm italic text-neutral-400">
                        No description yet
                      </p>
                    )}
                  </div>
                </div>
                <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-neutral-500">
                  <span className="rounded-md bg-neutral-100 px-2 py-1 ring-1 ring-neutral-200/80">
                    {t.linkedInterviewQuestionIds.length} linked question
                    {t.linkedInterviewQuestionIds.length === 1 ? '' : 's'}
                  </span>
                  {t.essayStructure ? (
                    <span className="rounded-md bg-amber-100/80 px-2 py-1 text-amber-900 ring-1 ring-amber-200/80">
                      Essay sketch
                    </span>
                  ) : null}
                </div>
              </CardBody>
            </Card>
          </button>
        ))}
      </div>

      {findingsThemes.length === 0 ? (
        <div className="mt-8 rounded-[1.25rem] border border-dashed border-neutral-300/80 bg-white/50 px-6 py-10 text-center shadow-inner">
          <p className="text-sm font-medium text-neutral-900">
            No findings themes yet.
          </p>
          <p className="mt-2 text-sm text-neutral-600">
            Create a theme to capture how a cluster of evidence might show up in
            your final argument.
          </p>
          <div className="mt-5 flex justify-center">
            <Button variant="dark" onClick={handleAdd}>
              Add theme
            </Button>
          </div>
        </div>
      ) : null}

      <SlideOver
        open={!!selected}
        title="Findings theme"
        wide
        onClose={() => setSelectedId(null)}
      >
        {selected ? (
          <FindingsThemeEditor
            theme={selected}
            interviewQuestions={interviewQuestions}
            onChange={(patch) => updateFindingsTheme(selected.id, patch)}
            onDelete={() => {
              deleteFindingsTheme(selected.id)
              setSelectedId(null)
            }}
          />
        ) : null}
      </SlideOver>
    </div>
  )
}
