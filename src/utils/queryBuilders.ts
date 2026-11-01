import type { IssueFilters, RepoFilters, TimeWindow } from '@/types/app'
import { ISSUE_LABELS } from './constants'

const DAY_MS = 86_400_000

function clean(value: string): string {
  return value.replace(/"/g, '').trim()
}

function qualifier(name: string, value: string): string {
  const safe = clean(value)
  return /\s/.test(safe) ? `${name}:"${safe}"` : `${name}:${safe}`
}

/** A UTC date string, so query (and cache) keys stay stable throughout a day. */
export function daysAgo(days: number, now = Date.now()): string {
  return new Date(now - days * DAY_MS).toISOString().slice(0, 10)
}

export function buildRepoQuery(f: Pick<RepoFilters, 'q' | 'language' | 'topic' | 'minStars'>): string {
  const parts: string[] = []
  const text = f.q.trim()
  if (text) parts.push(text)
  if (f.language) parts.push(qualifier('language', f.language))
  if (f.topic) parts.push(qualifier('topic', f.topic.toLowerCase()))
  // GitHub requires at least one term, and this also keeps queries valid with no filters.
  parts.push(`stars:>=${f.minStars}`, 'is:public', 'archived:false')
  return parts.join(' ')
}

export function buildIssueQuery(f: IssueFilters, now = Date.now()): string {
  const parts = ['is:issue', 'is:open', 'archived:false']
  const text = f.q.trim()
  if (text) parts.push(text)
  for (const id of f.labels) {
    const label = ISSUE_LABELS.find((l) => l.id === id)
    if (label) parts.push(`label:${label.query}`)
  }
  if (f.language) parts.push(qualifier('language', f.language))
  if (f.repo.trim()) parts.push(qualifier('repo', f.repo))
  if (f.recentOnly) parts.push(`updated:>=${daysAgo(7, now)}`)
  if (f.unassigned) parts.push('no:assignee')
  return parts.join(' ')
}

export function buildIssueTextQuery(term: string): string {
  return buildIssueQuery({
    q: term,
    labels: [],
    language: '',
    repo: '',
    recentOnly: false,
    unassigned: false,
    sort: 'updated',
  })
}

export const TRENDING_WINDOWS: Record<TimeWindow, { days: number; minStars: number; label: string }> = {
  daily: { days: 1, minStars: 5, label: 'Daily' },
  weekly: { days: 7, minStars: 20, label: 'Weekly' },
  monthly: { days: 30, minStars: 50, label: 'Monthly' },
}

export function buildTrendingQuery(window: TimeWindow, language: string, now = Date.now()): string {
  const { days, minStars } = TRENDING_WINDOWS[window]
  const parts = [`created:>=${daysAgo(days, now)}`, `stars:>=${minStars}`, 'is:public', 'archived:false']
  if (language) parts.push(qualifier('language', language))
  return parts.join(' ')
}

/** Stars earned per day since creation; ages under a day count as a full day. */
export function starVelocity(stars: number, createdAt: string, now = Date.now()): number {
  const ageDays = (now - new Date(createdAt).getTime()) / DAY_MS
  return stars / Math.max(ageDays, 1)
}

export function parseRepoName(value: string): { owner: string; repo: string } | null {
  const match = /^([\w.-]+)\/([\w.-]+)$/.exec(value.trim())
  return match ? { owner: match[1], repo: match[2] } : null
}
