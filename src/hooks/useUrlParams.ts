import { useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'

/** Filter state lives in the URL, so results are shareable and survive back/forward. */
export function useUrlParams() {
  const [params, setParams] = useSearchParams()

  const setParam = useCallback(
    (updates: Record<string, string | null>, options: { keepPage?: boolean; replace?: boolean } = {}) => {
      setParams(
        (current) => {
          const next = new URLSearchParams(current)
          Object.entries(updates).forEach(([key, value]) => {
            if (value === null) next.delete(key)
            else next.set(key, value)
          })
          if (!options.keepPage) next.delete('page')
          return next
        },
        { replace: options.replace },
      )
    },
    [setParams],
  )

  const page = Math.max(1, Number(params.get('page')) || 1)
  return { params, setParam, page }
}
