import type { Issue, Repo } from './github'

export type Theme = 'light' | 'dark' | 'system'

export interface Preferences {
  token: string
  languages: string[]
  perPage: number
}

export interface Collection {
  id: string
  name: string
}

interface BookmarkBase {
  /** `repo:<id>` or `issue:<id>`. */
  key: string
  savedAt: string
  collectionId: string | null
}

export interface RepoBookmark extends BookmarkBase {
  kind: 'repo'
  repo: Repo
}

export interface IssueBookmark extends BookmarkBase {
  kind: 'issue'
  issue: Issue
}

export type Bookmark = RepoBookmark | IssueBookmark

export interface BookmarkStore {
  bookmarks: Bookmark[]
  collections: Collection[]
}

export interface RepoFilters {
  q: string
  language: string
  topic: string
  minStars: number
  sort: 'stars' | 'updated'
}

export type TimeWindow = 'daily' | 'weekly' | 'monthly'

export interface IssueFilters {
  q: string
  labels: string[]
  language: string
  repo: string
  recentOnly: boolean
  unassigned: boolean
  sort: 'updated' | 'created' | 'comments'
}
