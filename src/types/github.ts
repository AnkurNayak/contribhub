/** App-level shapes. Raw API responses are narrowed to these in services/github.ts. */

export interface RepoOwner {
  login: string
  avatarUrl: string
  htmlUrl: string
  type: string
}

export interface Repo {
  id: number
  name: string
  fullName: string
  owner: RepoOwner
  description: string | null
  language: string | null
  stars: number
  forks: number
  /** GitHub's count includes open pull requests. */
  openIssues: number
  topics: string[]
  htmlUrl: string
  homepage: string | null
  license: string | null
  defaultBranch: string
  archived: boolean
  createdAt: string
  updatedAt: string
  pushedAt: string
}

export interface IssueLabel {
  id: number
  name: string
  /** Hex without the leading '#'. */
  color: string
}

export interface Issue {
  id: number
  number: number
  title: string
  htmlUrl: string
  repoFullName: string
  labels: IssueLabel[]
  comments: number
  createdAt: string
  updatedAt: string
  authorLogin: string | null
  assigned: boolean
  /** Issue search results carry no language; set when the query filtered by one. */
  language?: string | null
}

export interface Commit {
  sha: string
  message: string
  htmlUrl: string
  date: string
  authorName: string
  authorAvatar: string | null
}

export interface CommunityProfile {
  healthPercentage: number | null
  contributingUrl: string | null
  codeOfConductUrl: string | null
  licenseName: string | null
}

export interface Viewer {
  login: string
  avatarUrl: string
  htmlUrl: string
}

export interface SearchResult<T> {
  totalCount: number
  items: T[]
}

export type RateResource = 'core' | 'search'

export interface RateBucket {
  limit: number
  remaining: number
  /** Epoch milliseconds. */
  resetAt: number
}
