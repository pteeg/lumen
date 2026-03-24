import type { HTMLAttributes, ReactNode } from 'react'

type DashboardCardProps = {
  children: ReactNode
  className?: string
  /** Slightly tighter padding for dense rows */
  dense?: boolean
  /** `transparent` drops border, fill, and shadow so the page background shows through. */
  surface?: 'raised' | 'transparent'
} & Omit<HTMLAttributes<HTMLDivElement>, 'children'>

const raisedSurface =
  'border border-neutral-200/80 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04),0_18px_48px_-20px_rgba(15,23,42,0.08)]'

/**
 * Primary surface for dashboard panels — calm border, soft lift, generous padding.
 */
export function DashboardCard({
  children,
  className = '',
  dense = false,
  surface = 'raised',
  ...rest
}: DashboardCardProps) {
  const surfaceClass = surface === 'transparent' ? '' : raisedSurface
  return (
    <div
      className={`rounded-[1.25rem] ${surfaceClass} ${dense ? 'p-6 md:p-7' : 'p-8 md:p-9'} ${className}`}
      {...rest}
    >
      {children}
    </div>
  )
}
