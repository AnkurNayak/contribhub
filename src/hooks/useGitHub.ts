import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { useSyncExternalStore } from 'react'
import { usePreferences } from '@/context/PreferencesContext'
import {
  getCommits,
  getCommunityProfile,
  getReadme,
  getRepoIssues,
  getRepository,
  getViewer,
  searchIssues,
  searchRepositories,
} from '@/services/github'
import { rateLimitStore } from '@/services/rateLimit'

interface SearchOptions {
  query: string
  sort?: string
  page?: number
  perPage?: number
  enabled?: boolean
}

export function useRepoSearch({ query, sort, page = 1, perPage = 12, enabled = true }: SearchOptions) {
  return useQuery({
    queryKey: ['repos', query, sort, page, perPage],
    queryFn: ({ signal }) => searchRepositories({ query, sort, page, perPage, signal }),
    placeholderData: keepPreviousData,
    enabled,
  })
}

export function useIssueSearch(
  { query, sort, page = 1, perPage = 12, enabled = true }: SearchOptions,
  language?: string,
) {
  return useQuery({
    queryKey: ['issues', query, sort, page, perPage],
    queryFn: ({ signal }) => searchIssues({ query, sort, page, perPage, signal }, language),
    placeholderData: keepPreviousData,
    enabled,
  })
}

export function useRepository(owner: string, repo: string, enabled = true) {
  return useQuery({
    queryKey: ['repo', owner, repo],
    queryFn: ({ signal }) => getRepository(owner, repo, signal),
    enabled,
  })
}

export function useReadme(owner: string, repo: string) {
  return useQuery({
    queryKey: ['readme', owner, repo],
    queryFn: ({ signal }) => getReadme(owner, repo, signal),
  })
}

export function useRepoIssues(owner: string, repo: string, labels: string | undefined, enabled: boolean) {
  return useQuery({
    queryKey: ['repo-issues', owner, repo, labels],
    queryFn: ({ signal }) => getRepoIssues(owner, repo, { labels, signal }),
    enabled,
  })
}

export function useCommits(owner: string, repo: string, enabled: boolean) {
  return useQuery({
    queryKey: ['commits', owner, repo],
    queryFn: ({ signal }) => getCommits(owner, repo, signal),
    enabled,
  })
}

export function useCommunityProfile(owner: string, repo: string, enabled: boolean) {
  return useQuery({
    queryKey: ['community', owner, repo],
    queryFn: ({ signal }) => getCommunityProfile(owner, repo, signal),
    enabled,
  })
}

export function useViewer() {
  const { token } = usePreferences().preferences
  return useQuery({
    queryKey: ['viewer', token],
    queryFn: ({ signal }) => getViewer(signal),
    enabled: Boolean(token),
    staleTime: 60 * 60_000,
  })
}

export function useRateLimits() {
  return useSyncExternalStore(rateLimitStore.subscribe, rateLimitStore.getSnapshot)
}
