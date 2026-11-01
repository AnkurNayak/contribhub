const compact = new Intl.NumberFormat('en', { notation: 'compact', maximumFractionDigits: 1 })
const relative = new Intl.RelativeTimeFormat('en', { numeric: 'auto' })

export function formatCount(value: number): string {
  return compact.format(value)
}

const UNITS: [Intl.RelativeTimeFormatUnit, number][] = [
  ['year', 31_536_000],
  ['month', 2_592_000],
  ['week', 604_800],
  ['day', 86_400],
  ['hour', 3_600],
  ['minute', 60],
]

export function formatRelative(iso: string, now = Date.now()): string {
  const seconds = (new Date(iso).getTime() - now) / 1000
  // A local clock running behind GitHub's must not produce "in 42 minutes".
  if (seconds >= 0) return 'just now'
  for (const [unit, size] of UNITS) {
    if (Math.abs(seconds) >= size) return relative.format(Math.trunc(seconds / size), unit)
  }
  return 'just now'
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en', { year: 'numeric', month: 'short', day: 'numeric' })
}

export function formatDuration(ms: number): string {
  const total = Math.max(0, Math.ceil(ms / 1000))
  const minutes = Math.floor(total / 60)
  return minutes > 0 ? `${minutes}m ${total % 60}s` : `${total}s`
}

/** Readable text color for a GitHub label's hex background. */
export function labelStyle(hex: string, dark: boolean) {
  const color = /^[0-9a-f]{6}$/i.test(hex) ? `#${hex}` : '#8b8b8b'
  return {
    backgroundColor: `color-mix(in oklab, ${color} ${dark ? 22 : 16}%, transparent)`,
    borderColor: `color-mix(in oklab, ${color} ${dark ? 45 : 40}%, transparent)`,
    color: `color-mix(in oklab, ${color} ${dark ? 35 : 45}%, ${dark ? 'white' : 'black'})`,
  }
}
