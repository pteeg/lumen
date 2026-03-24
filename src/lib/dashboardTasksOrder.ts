import type { DashboardTask } from '../types/dashboard'

export function sortTasksByOrder(tasks: DashboardTask[]): DashboardTask[] {
  return [...tasks].sort((a, b) => a.order - b.order)
}

/** Active and completed tasks each get contiguous orders 0…n−1. */
export function normalizeDashboardTaskOrders(tasks: DashboardTask[]): DashboardTask[] {
  const activeSorted = sortTasksByOrder(tasks.filter((t) => !t.completed))
  const doneSorted = sortTasksByOrder(tasks.filter((t) => t.completed))
  return [
    ...activeSorted.map((t, i) => ({ ...t, order: i })),
    ...doneSorted.map((t, i) => ({ ...t, order: i })),
  ]
}
