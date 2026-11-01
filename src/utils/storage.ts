/** LocalStorage helpers that survive private-mode failures and corrupted values. */

export const STORAGE_KEYS = {
  theme: 'contribhub:theme',
  preferences: 'contribhub:preferences',
  bookmarks: 'contribhub:bookmarks',
  repoLanguages: 'contribhub:repo-languages',
} as const

export function readJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch {
    return fallback
  }
}

export function writeJson(key: string, value: unknown): boolean {
  try {
    localStorage.setItem(key, JSON.stringify(value))
    return true
  } catch {
    return false
  }
}
