import type { RateBucket, RateResource } from '@/types/github'

type RateState = Partial<Record<RateResource, RateBucket>>

let state: RateState = {}
const listeners = new Set<() => void>()

function emit() {
  listeners.forEach((listener) => listener())
}

export const rateLimitStore = {
  subscribe(listener: () => void) {
    listeners.add(listener)
    return () => listeners.delete(listener)
  },
  getSnapshot: () => state,
  update(resource: RateResource, bucket: RateBucket) {
    state = { ...state, [resource]: bucket }
    emit()
  },
  reset() {
    state = {}
    emit()
  },
}

/** Reset time if the bucket is known to be empty, so we fail without spending a request. */
export function exhaustedUntil(resource: RateResource, now = Date.now()): number | null {
  const bucket = state[resource]
  return bucket && bucket.remaining <= 0 && bucket.resetAt > now ? bucket.resetAt : null
}
