type Props = {
  value: number | string
  label: string
}

/** Single calm stat cell — no chart chrome */
export function DashboardStatItem({ value, label }: Props) {
  return (
    <div className="min-w-0 text-center">
      <p className="text-2xl font-semibold tabular-nums tracking-tight text-neutral-900 md:text-[1.65rem]">
        {value}
      </p>
      <p className="mt-1.5 text-xs font-medium leading-snug text-neutral-500">{label}</p>
    </div>
  )
}
