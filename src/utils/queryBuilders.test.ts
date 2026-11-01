import { describe, expect, it } from 'vitest'
import type { IssueFilters } from '@/types/app'
import {
  buildIssueQuery,
  buildRepoQuery,
  buildTrendingQuery,
  parseRepoName,
  starVelocity,
} from './queryBuilders'

const NOW = Date.UTC(2026, 10, 15)
const baseIssue: IssueFilters = {
  q: '',
  labels: [],
  language: '',
  repo: '',
  recentOnly: false,
  unassigned: false,
  sort: 'updated',
}

describe('buildRepoQuery', () => {
  it('stays valid with no filters', () => {
    expect(buildRepoQuery({ q: '', language: '', topic: '', minStars: 0 })).toBe(
      'stars:>=0 is:public archived:false',
    )
  })

  it('quotes values with spaces and strips quotes from input', () => {
    const query = buildRepoQuery({ q: ' router ', language: 'Jupyter "Notebook', topic: 'CLI', minStars: 100 })
    expect(query).toBe('router language:"Jupyter Notebook" topic:cli stars:>=100 is:public archived:false')
  })
})

describe('buildIssueQuery', () => {
  it('expands label ids into GitHub qualifiers', () => {
    const query = buildIssueQuery({ ...baseIssue, labels: ['good-first-issue', 'feature'] }, NOW)
    expect(query).toContain('label:"good first issue"')
    expect(query).toContain('label:enhancement,feature,"feature request"')
  })

  it('applies language, repo, recency and assignee filters', () => {
    const query = buildIssueQuery(
      { ...baseIssue, language: 'C++', repo: 'facebook/react', recentOnly: true, unassigned: true },
      NOW,
    )
    expect(query).toBe(
      'is:issue is:open archived:false language:C++ repo:facebook/react updated:>=2026-11-08 no:assignee',
    )
  })
})

describe('trending', () => {
  it('uses a window-specific creation date and star floor', () => {
    expect(buildTrendingQuery('weekly', 'Go', NOW)).toBe(
      'created:>=2026-11-08 stars:>=20 is:public archived:false language:Go',
    )
  })

  it('computes velocity without dividing by less than a day', () => {
    expect(starVelocity(70, '2026-11-08T00:00:00Z', NOW)).toBe(10)
    expect(starVelocity(50, '2026-11-14T23:00:00Z', NOW)).toBe(50)
  })
})

describe('parseRepoName', () => {
  it('accepts owner/repo only', () => {
    expect(parseRepoName(' vercel/next.js ')).toEqual({ owner: 'vercel', repo: 'next.js' })
    expect(parseRepoName('next.js')).toBeNull()
    expect(parseRepoName('a/b/c')).toBeNull()
  })
})
