import type { ButtonHTMLAttributes, ReactNode } from 'react'

const variants: Record<string, string> = {
  primary:
    'border-transparent bg-blue-600 text-white hover:bg-blue-700 shadow-sm',
  dark: 'border-transparent bg-neutral-900 text-white hover:bg-neutral-800 shadow-md',
  secondary:
    'border border-neutral-200 bg-white text-neutral-800 hover:bg-neutral-50 shadow-sm',
  ghost: 'border-transparent bg-transparent text-neutral-600 hover:bg-neutral-100',
  danger:
    'border-transparent bg-red-600 text-white hover:bg-red-700 shadow-sm',
}

export function Button({
  variant = 'secondary',
  className = '',
  children,
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: keyof typeof variants
  children: ReactNode
}) {
  return (
    <button
      type="button"
      className={`inline-flex items-center justify-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 disabled:pointer-events-none disabled:opacity-50 ${variants[variant]} ${className}`}
      {...rest}
    >
      {children}
    </button>
  )
}
