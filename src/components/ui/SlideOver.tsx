import { useEffect, type ReactNode } from 'react'
import { Button } from './Button'

export function SlideOver({
  open,
  title,
  onClose,
  children,
  footer,
  wide,
}: {
  open: boolean
  title: string
  onClose: () => void
  children: ReactNode
  footer?: ReactNode
  wide?: boolean
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
    <div className="fixed inset-0 z-50 flex justify-end">
      <button
        type="button"
        aria-label="Close panel"
        className="absolute inset-0 bg-slate-900/20 backdrop-blur-[1px]"
        onClick={onClose}
      />
      <aside
        className={`relative flex h-full w-full flex-col border-l border-slate-200 bg-white shadow-2xl ${
          wide ? 'max-w-2xl' : 'max-w-lg'
        }`}
      >
        <header className="flex items-center justify-between gap-4 border-b border-slate-100 px-5 py-4">
          <h2 className="text-base font-semibold tracking-tight text-slate-900">
            {title}
          </h2>
          <Button variant="ghost" className="!px-2 !py-1 text-slate-500" onClick={onClose}>
            Close
          </Button>
        </header>
        <div className="flex-1 overflow-y-auto px-5 py-4">{children}</div>
        {footer ? (
          <footer className="border-t border-slate-100 px-5 py-4">{footer}</footer>
        ) : null}
      </aside>
    </div>
  )
}
