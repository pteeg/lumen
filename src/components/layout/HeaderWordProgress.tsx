import { useWriteUpBodyWordStats } from '../../context/WriteUpContext'

export function HeaderWordProgress() {
  const { totalWords, goal, percent } = useWriteUpBodyWordStats()
  const pctRounded = Math.round(percent * 10) / 10

  return (
    <div
      className="w-[9.25rem] shrink-0 sm:w-40 md:w-44"
      role="status"
      aria-live="polite"
    >
      <div className="flex items-baseline justify-between gap-1.5">
        <p className="min-w-0 truncate text-[11px] font-medium tabular-nums leading-tight text-neutral-700 sm:text-xs">
          {totalWords.toLocaleString()}/{goal.toLocaleString()} words
        </p>
        <p className="shrink-0 text-[11px] tabular-nums leading-tight text-neutral-500 sm:text-xs">
          {pctRounded}%
        </p>
      </div>
      <div
        className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-neutral-200/90"
        role="progressbar"
        aria-valuenow={Math.min(totalWords, goal)}
        aria-valuemin={0}
        aria-valuemax={goal}
        aria-label="Write-up word goal progress"
      >
        <div
          className="h-full rounded-full bg-neutral-900 transition-[width] duration-300 ease-out"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  )
}
