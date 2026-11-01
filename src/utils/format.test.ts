import { describe, expect, it } from 'vitest'
import { formatDuration, formatRelative } from './format'

const NOW = Date.UTC(2026, 10, 15, 12)

describe('formatRelative', () => {
  it('describes past times', () => {
    expect(formatRelative('2026-11-15T10:00:00Z', NOW)).toBe('2 hours ago')
    expect(formatRelative('2026-11-14T12:00:00Z', NOW)).toBe('yesterday')
  })

  it('never reports a future time when the local clock is behind', () => {
    expect(formatRelative('2026-11-15T12:42:00Z', NOW)).toBe('just now')
  })
})

describe('formatDuration', () => {
  it('formats a countdown', () => {
    expect(formatDuration(45_000)).toBe('45s')
    expect(formatDuration(125_000)).toBe('2m 5s')
    expect(formatDuration(-1)).toBe('0s')
  })
})
