import { TimerReset } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useRateLimits } from '@/hooks/useGitHub'
import { useNow } from '@/hooks/useNow'
import { formatDuration } from '@/utils/format'

export function RateLimitBanner() {
  const { core, search } = useRateLimits()
  const candidates = [
    search?.remaining === 0 ? { name: 'Search', resetAt: search.resetAt } : null,
    core?.remaining === 0 ? { name: 'Project data', resetAt: core.resetAt } : null,
  ].filter((item) => item !== null)
  const now = useNow(candidates.length > 0)
  const active = candidates.find((item) => item.resetAt > now)

  if (!active) return null

  return (
    <div
      role="status"
      className="flex flex-wrap items-center gap-x-2 gap-y-1 border-b bg-warning-soft px-4 py-2 text-[13px] text-warning-foreground lg:px-6"
    >
      <TimerReset className="size-4 shrink-0" aria-hidden />
      <span>
        {active.name} requests are paused by GitHub’s rate limit. Resets in {formatDuration(active.resetAt - now)}.
      </span>
      <Link to="/settings#api-access" className="font-medium underline underline-offset-2">
        Add a free token
      </Link>
    </div>
  )
}
