import type {
  Commit,
  CommunityProfile,
  Issue,
  RateResource,
  Repo,
  SearchResult,
  Viewer,
} from '@/types/github'
import { readJson, STORAGE_KEYS } from '@/utils/storage'
import { exhaustedUntil, rateLimitStore } from './rateLimit'

const API_ROOT = 'https://api.github.com'
const CACHE_PREFIX = 'contribhub:http:'
const DEFAULT_TTL = 10 * 60_000

export type GitHubErrorKind = 'rate-limit' | 'not-found' | 'invalid-query' | 'auth' | 'network' | 'unknown'

export class GitHubError extends Error {
  readonly kind: GitHubErrorKind
  readonly resetAt?: number

  constructor(kind: GitHubErrorKind, message: string, resetAt?: number) {
    super(message)
    this.name = 'GitHubError'
    this.kind = kind
    this.resetAt = resetAt
  }
}

interface RequestOptions {
  params?: Record<string, string | number>
  accept?: string
  signal?: AbortSignal
  ttl?: number
  text?: boolean
}

function getToken(): string {
  return readJson<{ token?: string }>(STORAGE_KEYS.preferences, {}).token?.trim() ?? ''
}

function readCache<T>(key: string): T | undefined {
  try {
    const raw = sessionStorage.getItem(CACHE_PREFIX + key)
    if (!raw) return undefined
    const entry = JSON.parse(raw) as { expires: number; data: T }
    if (entry.expires > Date.now()) return entry.data
    sessionStorage.removeItem(CACHE_PREFIX + key)
  } catch {
    // An unavailable or corrupt cache only costs us a network request.
  }
  return undefined
}

function writeCache(key: string, data: unknown, ttl: number) {
  const value = JSON.stringify({ expires: Date.now() + ttl, data })
  try {
    sessionStorage.setItem(CACHE_PREFIX + key, value)
  } catch {
    clearResponseCache()
    try {
      sessionStorage.setItem(CACHE_PREFIX + key, value)
    } catch {
      // Too large to cache; carry on without it.
    }
  }
}

export function clearResponseCache() {
  try {
    Object.keys(sessionStorage)
      .filter((key) => key.startsWith(CACHE_PREFIX))
      .forEach((key) => sessionStorage.removeItem(key))
  } catch {
    // Nothing to clear.
  }
}

function recordRateLimit(response: Response) {
  const resource = response.headers.get('x-ratelimit-resource')
  const remaining = response.headers.get('x-ratelimit-remaining')
  const limit = response.headers.get('x-ratelimit-limit')
  const reset = response.headers.get('x-ratelimit-reset')
  if ((resource === 'core' || resource === 'search') && remaining && limit && reset) {
    rateLimitStore.update(resource, {
      remaining: Number(remaining),
      limit: Number(limit),
      resetAt: Number(reset) * 1000,
    })
  }
}

async function toError(response: Response): Promise<GitHubError> {
  const body = (await response.json().catch(() => ({}))) as { message?: string }
  const message = body.message ?? ''
  const retryAfter = response.headers.get('retry-after')
  const reset = response.headers.get('x-ratelimit-reset')

  if (
    (response.status === 403 || response.status === 429) &&
    (retryAfter || response.headers.get('x-ratelimit-remaining') === '0' || /rate limit/i.test(message))
  ) {
    const resetAt = retryAfter
      ? Date.now() + Number(retryAfter) * 1000
      : reset
        ? Number(reset) * 1000
        : Date.now() + 60_000
    return new GitHubError('rate-limit', 'GitHub API rate limit reached.', resetAt)
  }
  if (response.status === 401) {
    return new GitHubError('auth', 'GitHub rejected your access token. Update or remove it in Settings.')
  }
  if (response.status === 404) return new GitHubError('not-found', 'Not found on GitHub.')
  if (response.status === 422) {
    return new GitHubError(
      'invalid-query',
      'GitHub could not run this search. Check that any repository or filter you entered exists.',
    )
  }
  return new GitHubError('unknown', message || `GitHub returned an error (${response.status}).`)
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { params, accept = 'application/vnd.github+json', signal, ttl = DEFAULT_TTL, text } = options
  const url = new URL(API_ROOT + path)
  Object.entries(params ?? {}).forEach(([key, value]) => url.searchParams.set(key, String(value)))

  const cached = readCache<T>(url.href)
  if (cached !== undefined) return cached

  const resource: RateResource = path.startsWith('/search') ? 'search' : 'core'
  const resetAt = exhaustedUntil(resource)
  if (resetAt) throw new GitHubError('rate-limit', 'GitHub API rate limit reached.', resetAt)

  const headers: Record<string, string> = { Accept: accept, 'X-GitHub-Api-Version': '2022-11-28' }
  const token = getToken()
  if (token) headers.Authorization = `Bearer ${token}`

  let response: Response
  try {
    response = await fetch(url, { headers, signal })
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') throw error
    throw new GitHubError('network', 'Could not reach GitHub. Check your connection and try again.')
  }

  recordRateLimit(response)
  if (!response.ok) throw await toError(response)

  const data = (text ? await response.text() : await response.json()) as T
  writeCache(url.href, data, ttl)
  return data
}

/* ---------- Raw API shapes (only the fields we read) ---------- */

interface RawRepo {
  id: number
  name: string
  full_name: string
  owner: { login: string; avatar_url: string; html_url: string; type: string }
  description: string | null
  language: string | null
  stargazers_count: number
  forks_count: number
  open_issues_count: number
  topics?: string[]
  html_url: string
  homepage: string | null
  license: { name: string; spdx_id: string | null } | null
  default_branch: string
  archived: boolean
  created_at: string
  updated_at: string
  pushed_at: string
}

interface RawIssue {
  id: number
  number: number
  title: string
  html_url: string
  repository_url: string
  labels: { id: number; name: string; color: string }[]
  comments: number
  created_at: string
  updated_at: string
  user: { login: string } | null
  assignee: { login: string } | null
  pull_request?: unknown
}

interface RawCommit {
  sha: string
  html_url: string
  commit: { message: string; author: { name: string; date: string } | null }
  author: { avatar_url: string; login: string } | null
}

interface RawSearch<T> {
  total_count: number
  items: T[]
}

function toRepo(raw: RawRepo): Repo {
  return {
    id: raw.id,
    name: raw.name,
    fullName: raw.full_name,
    owner: {
      login: raw.owner.login,
      avatarUrl: raw.owner.avatar_url,
      htmlUrl: raw.owner.html_url,
      type: raw.owner.type,
    },
    description: raw.description,
    language: raw.language,
    stars: raw.stargazers_count,
    forks: raw.forks_count,
    openIssues: raw.open_issues_count,
    topics: raw.topics ?? [],
    htmlUrl: raw.html_url,
    homepage: raw.homepage || null,
    license: raw.license?.spdx_id && raw.license.spdx_id !== 'NOASSERTION' ? raw.license.spdx_id : (raw.license?.name ?? null),
    defaultBranch: raw.default_branch,
    archived: raw.archived,
    createdAt: raw.created_at,
    updatedAt: raw.updated_at,
    pushedAt: raw.pushed_at,
  }
}

function toIssue(raw: RawIssue, language?: string): Issue {
  return {
    id: raw.id,
    number: raw.number,
    title: raw.title,
    htmlUrl: raw.html_url,
    repoFullName: raw.repository_url.replace(`${API_ROOT}/repos/`, ''),
    labels: raw.labels.map(({ id, name, color }) => ({ id, name, color })),
    comments: raw.comments,
    createdAt: raw.created_at,
    updatedAt: raw.updated_at,
    authorLogin: raw.user?.login ?? null,
    assigned: Boolean(raw.assignee),
    language: language || undefined,
  }
}

/* ---------- Endpoints ---------- */

export interface SearchParams {
  query: string
  sort?: string
  page?: number
  perPage?: number
  signal?: AbortSignal
}

export async function searchRepositories({ query, sort, page = 1, perPage = 12, signal }: SearchParams) {
  const raw = await request<RawSearch<RawRepo>>('/search/repositories', {
    params: { q: query, per_page: perPage, page, ...(sort ? { sort, order: 'desc' } : {}) },
    signal,
  })
  return { totalCount: raw.total_count, items: raw.items.map(toRepo) } satisfies SearchResult<Repo>
}

export async function searchIssues(
  { query, sort, page = 1, perPage = 12, signal }: SearchParams,
  language?: string,
) {
  const raw = await request<RawSearch<RawIssue>>('/search/issues', {
    params: { q: query, per_page: perPage, page, ...(sort ? { sort, order: 'desc' } : {}) },
    signal,
  })
  return {
    totalCount: raw.total_count,
    items: raw.items.map((item) => toIssue(item, language)),
  } satisfies SearchResult<Issue>
}

export async function getRepository(owner: string, repo: string, signal?: AbortSignal): Promise<Repo> {
  return toRepo(await request<RawRepo>(`/repos/${owner}/${repo}`, { signal }))
}

export async function getReadme(owner: string, repo: string, signal?: AbortSignal): Promise<string | null> {
  try {
    return await request<string>(`/repos/${owner}/${repo}/readme`, {
      accept: 'application/vnd.github.raw+json',
      text: true,
      signal,
      ttl: 30 * 60_000,
    })
  } catch (error) {
    if (error instanceof GitHubError && error.kind === 'not-found') return null
    throw error
  }
}

export async function getRepoIssues(
  owner: string,
  repo: string,
  options: { labels?: string; signal?: AbortSignal } = {},
): Promise<Issue[]> {
  const raw = await request<RawIssue[]>(`/repos/${owner}/${repo}/issues`, {
    params: {
      state: 'open',
      per_page: 20,
      sort: 'updated',
      ...(options.labels ? { labels: options.labels } : {}),
    },
    signal: options.signal,
  })
  // The issues endpoint also returns pull requests.
  return raw.filter((item) => !item.pull_request).map((item) => toIssue(item))
}

export async function getCommits(owner: string, repo: string, signal?: AbortSignal): Promise<Commit[]> {
  const raw = await request<RawCommit[]>(`/repos/${owner}/${repo}/commits`, {
    params: { per_page: 8 },
    signal,
  })
  return raw.map((item) => ({
    sha: item.sha,
    message: item.commit.message.split('\n')[0],
    htmlUrl: item.html_url,
    date: item.commit.author?.date ?? '',
    authorName: item.author?.login ?? item.commit.author?.name ?? 'Unknown',
    authorAvatar: item.author?.avatar_url ?? null,
  }))
}

export async function getCommunityProfile(
  owner: string,
  repo: string,
  signal?: AbortSignal,
): Promise<CommunityProfile> {
  const raw = await request<{
    health_percentage: number | null
    files: {
      contributing: { html_url: string } | null
      code_of_conduct: { html_url: string } | null
      license: { name: string } | null
    }
  }>(`/repos/${owner}/${repo}/community/profile`, { signal })
  return {
    healthPercentage: raw.health_percentage,
    contributingUrl: raw.files.contributing?.html_url ?? null,
    codeOfConductUrl: raw.files.code_of_conduct?.html_url ?? null,
    licenseName: raw.files.license?.name ?? null,
  }
}

export async function getViewer(signal?: AbortSignal): Promise<Viewer> {
  const raw = await request<{ login: string; avatar_url: string; html_url: string }>('/user', { signal })
  return { login: raw.login, avatarUrl: raw.avatar_url, htmlUrl: raw.html_url }
}

/** Doesn't count against the rate limit, so it's safe to call from Settings. */
export async function refreshRateLimit(signal?: AbortSignal): Promise<void> {
  const headers: Record<string, string> = { Accept: 'application/vnd.github+json' }
  const token = getToken()
  if (token) headers.Authorization = `Bearer ${token}`
  const response = await fetch(`${API_ROOT}/rate_limit`, { headers, signal })
  if (!response.ok) throw await toError(response)
  const { resources } = (await response.json()) as {
    resources: Record<RateResource, { limit: number; remaining: number; reset: number }>
  }
  for (const resource of ['core', 'search'] as const) {
    const { limit, remaining, reset } = resources[resource]
    rateLimitStore.update(resource, { limit, remaining, resetAt: reset * 1000 })
  }
}
