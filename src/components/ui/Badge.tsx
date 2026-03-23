import type { HTMLAttributes, ReactNode } from 'react'

const tones: Record<string, string> = {
  default: 'border-slate-200 bg-slate-50 text-slate-600',
  accent: 'border-blue-200 bg-blue-50 text-blue-700',
  success: 'border-emerald-200 bg-emerald-50 text-emerald-800',
  warning: 'border-amber-200 bg-amber-50 text-amber-900',
  danger: 'border-red-200 bg-red-50 text-red-800',
}

export function Badge({
  children,
  tone = 'default',
  className = '',
  ...rest
}: HTMLAttributes<HTMLSpanElement> & {
  children: ReactNode
  tone?: keyof typeof tones
}) {
  return (
    <span
      className={`inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium ${tones[tone]} ${className}`}
      {...rest}
    >
      {children}
    </span>
  )
}
