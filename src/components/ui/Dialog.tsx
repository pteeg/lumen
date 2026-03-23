import { useEffect, type ReactNode } from 'react'

export function Dialog({
  open,
  title,
  onClose,
  children,
  footer,
  panelClassName,
}: {
  open: boolean
  title: string
  onClose: () => void
  children: ReactNode
  footer?: ReactNode
  /** Replaces default max width when set (e.g. max-w-lg) */
  panelClassName?: string
}) {
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Close dialog"
        className="absolute inset-0 bg-neutral-900/40 backdrop-blur-[1px]"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="dialog-title"
        className={`relative w-full rounded-[1.25rem] border border-neutral-200/80 bg-white p-6 shadow-xl ${panelClassName?.trim() ? panelClassName : 'max-w-md'}`}
    >
        <h2
          id="dialog-title"
          className="text-lg font-semibold tracking-tight text-neutral-900"
        >
          {title}
        </h2>
        <div className="mt-4">{children}</div>
        {footer ? (
          <div className="mt-6 flex flex-wrap justify-end gap-2">{footer}</div>
        ) : null}
      </div>
    </div>
  )
}
