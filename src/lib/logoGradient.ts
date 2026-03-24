/** Approximates the Lumen mark gradient (public/Lumen-just-logo.png) for charts and accents. */
export const LUMEN_LOGO_GRADIENT_STOPS = [
  '#42a5f5',
  '#7c4dff',
  '#9c27b0',
  '#e91e63',
  '#ff9800',
  '#ffeb3b',
] as const

/** Left-to-right spectrum for horizontal progress bars (matches logo colours). */
export const LUMEN_LOGO_LINEAR_GRADIENT_TO_RIGHT = `linear-gradient(to right, ${LUMEN_LOGO_GRADIENT_STOPS.join(', ')})`

const CONIC_STOPS = [...LUMEN_LOGO_GRADIENT_STOPS]

/** Very light grey for donut “remaining” arc (confirmed-interviews chart). */
export const PIE_GOAL_TRACK_GREY = '#ececec'

function mixHex(a: string, b: string, t: number): string {
  const u = Math.min(1, Math.max(0, t))
  const pa = a.replace('#', '')
  const pb = b.replace('#', '')
  const c = (s: string, i: number) => parseInt(s.slice(i, i + 2), 16)
  const r = Math.round(c(pa, 0) + (c(pb, 0) - c(pa, 0)) * u)
  const g = Math.round(c(pa, 2) + (c(pb, 2) - c(pa, 2)) * u)
  const bl = Math.round(c(pa, 4) + (c(pb, 4) - c(pa, 4)) * u)
  const h = (x: number) => x.toString(16).padStart(2, '0')
  return `#${h(r)}${h(g)}${h(bl)}`
}

type ConicGoalOptions = {
  /** Fills the unfilled arc (default: transparent). */
  trackColor?: string
}

/**
 * Conic gradient for a donut “percent of goal” chart (0–100%).
 * Unfilled arc is transparent unless `trackColor` is set.
 * With a track colour, both ends of the filled arc feather into the track over a few degrees.
 */
export function lumenLogoConicGoalGradient(
  percent: number,
  options?: ConicGoalOptions,
): string {
  const track = options?.trackColor
  const p = Math.min(100, Math.max(0, percent))
  const sweep = (p / 100) * 360
  if (sweep <= 0) {
    if (track) {
      return `conic-gradient(from -90deg, ${track} 0turn 1turn)`
    }
    return 'conic-gradient(from -90deg, transparent 0turn 1turn)'
  }
  const n = CONIC_STOPS.length
  const parts: string[] = []

  if (sweep >= 359.99) {
    for (let i = 0; i < n; i++) {
      const t = n === 1 ? 0 : i / (n - 1)
      const angle = t * sweep
      parts.push(`${CONIC_STOPS[i]} ${angle}deg`)
    }
    return `conic-gradient(from -90deg, ${parts.join(', ')})`
  }

  const tail = track ?? 'transparent'

  // No track: hard edge into transparent (word-goal pie).
  if (track == null) {
    for (let i = 0; i < n; i++) {
      const t = n === 1 ? 0 : i / (n - 1)
      parts.push(`${CONIC_STOPS[i]} ${t * sweep}deg`)
    }
    parts.push(`${tail} ${sweep}deg`, `${tail} 360deg`)
    return `conic-gradient(from -90deg, ${parts.join(', ')})`
  }

  let feather = Math.min(6, Math.max(1.5, sweep * 0.16))
  let coreSpan = sweep - 2 * feather
  if (coreSpan < 0.35) {
    coreSpan = 0.35
    const leftover = Math.max(0, sweep - coreSpan)
    feather = leftover / 2
  }
  const coreStart = feather
  const coreEnd = coreStart + coreSpan

  if (coreSpan < 0.12) {
    parts.push(`${track} 0deg`)
    parts.push(
      `${mixHex(CONIC_STOPS[0], track, 0.45)} ${sweep * 0.33}deg`,
    )
    parts.push(
      `${mixHex(CONIC_STOPS[n - 1]!, track, 0.45)} ${sweep * 0.66}deg`,
    )
  } else {
    parts.push(`${track} 0deg`)
    const first = CONIC_STOPS[0]!
    if (feather > 0.08) {
      parts.push(
        `${mixHex(first, track, 0.75)} ${coreStart * 0.28}deg`,
        `${mixHex(first, track, 0.48)} ${coreStart * 0.52}deg`,
        `${mixHex(first, track, 0.22)} ${coreStart * 0.78}deg`,
      )
    }
    for (let i = 0; i < n; i++) {
      const t = n === 1 ? 0 : i / (n - 1)
      const angle = coreStart + t * coreSpan
      parts.push(`${CONIC_STOPS[i]} ${angle}deg`)
    }
    if (feather > 0.08) {
      const last = CONIC_STOPS[n - 1]!
      parts.push(
        `${mixHex(last, track, 0.75)} ${coreEnd + feather * 0.28}deg`,
        `${mixHex(last, track, 0.48)} ${coreEnd + feather * 0.52}deg`,
        `${mixHex(last, track, 0.22)} ${coreEnd + feather * 0.78}deg`,
      )
    }
  }

  parts.push(`${track} ${sweep}deg`, `${track} 360deg`)
  return `conic-gradient(from -90deg, ${parts.join(', ')})`
}
