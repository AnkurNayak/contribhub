import { useEffect, useRef, useState } from 'react'
import { getRepository } from '@/services/github'
import { rateLimitStore } from '@/services/rateLimit'
import { readJson, STORAGE_KEYS, writeJson } from '@/utils/storage'

type LanguageCache = Record<string, string | null>

const inFlight = new Map<string, Promise<string | null>>()

/** Budget to leave untouched, so language lookups never starve project pages. */
function hasBudget(): boolean {
  const core = rateLimitStore.getSnapshot().core
  if (!core) return true
  return core.remaining > Math.max(30, core.limit * 0.25)
}

function lookup(fullName: string): Promise<string | null> {
  const pending = inFlight.get(fullName)
  if (pending) return pending
  const [owner, repo] = fullName.split('/')
  const promise = getRepository(owner, repo)
    .then((result) => {
      const cache = readJson<LanguageCache>(STORAGE_KEYS.repoLanguages, {})
      cache[fullName] = result.language
      writeJson(STORAGE_KEYS.repoLanguages, cache)
      return result.language
    })
    .finally(() => inFlight.delete(fullName))
  inFlight.set(fullName, promise)
  return promise
}

/**
 * GitHub's issue search doesn't return the repository language, so it's looked up
 * per repository, only once a card is on screen, and cached across visits. Returns
 * null when unknown or when the API budget is too low to spend on it.
 */
export function useRepoLanguage(fullName: string, known?: string | null) {
  const ref = useRef<HTMLElement | null>(null)
  const [fetched, setFetched] = useState<{ name: string; language: string | null } | null>(null)
  const cached = known ?? readJson<LanguageCache>(STORAGE_KEYS.repoLanguages, {})[fullName]

  useEffect(() => {
    const element = ref.current
    if (cached !== undefined || !element) return
    let cancelled = false
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting || !hasBudget()) return
      observer.disconnect()
      lookup(fullName)
        .then((language) => {
          if (!cancelled) setFetched({ name: fullName, language })
        })
        .catch(() => {
          // The language chip is optional; a failed lookup just hides it.
        })
    })
    observer.observe(element)
    return () => {
      cancelled = true
      observer.disconnect()
    }
  }, [fullName, cached])

  const language = cached !== undefined ? cached : fetched?.name === fullName ? fetched.language : null
  return { ref, language }
}
