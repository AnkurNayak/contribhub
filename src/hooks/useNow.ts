import { useEffect, useState } from 'react'

/** Current time, ticking while `active`. Drives rate-limit countdowns. */
export function useNow(active: boolean, interval = 1000): number {
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    if (!active) return
    setNow(Date.now())
    const timer = setInterval(() => setNow(Date.now()), interval)
    return () => clearInterval(timer)
  }, [active, interval])

  return now
}
