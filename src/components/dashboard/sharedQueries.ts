import { buildIssueQuery, buildRepoQuery } from '@/utils/queryBuilders'
import type { IssueFilters } from '@/types/app'

/** Pages share these exact queries, so a single API call can feed several widgets. */
export const POPULAR_REPOS_QUERY = buildRepoQuery({ q: '', language: '', topic: '', minStars: 100 })

const noFilters: IssueFilters = {
  q: '',
  labels: [],
  language: '',
  repo: '',
  recentOnly: false,
  unassigned: false,
  sort: 'updated',
}

export const OPEN_ISSUES_QUERY = buildIssueQuery(noFilters)

export function goodFirstIssuesQuery(language = '') {
  return buildIssueQuery({ ...noFilters, labels: ['good-first-issue'], language, unassigned: true })
}
