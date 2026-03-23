import type { ReactNode } from 'react'

type Props = {
  children: ReactNode
  className?: string
}

export function DashboardSectionLabel({ children, className = '' }: Props) {
  return (
    <p
      className={`text-[11px] font-semibold uppercase tracking-[0.14em] text-neutral-500 ${className}`}
    >
      {children}
    </p>
  )
}
