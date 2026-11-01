import { CloudOff, KeyRound, RefreshCw, SearchX, TimerReset, type LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { useNow } from '@/hooks/useNow'
import { GitHubError } from '@/services/github'
import { formatDuration } from '@/utils/format'

export function EmptyState({
  icon: Icon = SearchX,
  title,
  description,
  children,
}: {
  icon?: LucideIcon
  title: string
  description?: ReactNode
  children?: ReactNode
}) {
  return (
    <div className="flex flex-col items-center rounded-xl border border-dashed px-6 py-12 text-center">
      <span className="mb-4 flex size-10 items-center justify-center rounded-lg border bg-card">
        <Icon className="size-[18px] text-muted-foreground" aria-hidden />
      </span>
      <h3 className="text-sm font-semibold">{title}</h3>
      {description && <p className="mt-1 max-w-sm text-sm text-muted-foreground">{description}</p>}
      {children && <div className="mt-4 flex flex-wrap justify-center gap-2">{children}</div>}
    </div>
  )
}

export function ErrorState({ error, onRetry }: { error: unknown; onRetry?: () => void }) {
  const known = error instanceof GitHubError ? error : null
  const resetAt = known?.kind === 'rate-limit' ? (known.resetAt ?? 0) : 0
  const now = useNow(resetAt > 0)
  const waiting = resetAt > now

  if (known?.kind === 'rate-limit') {
    return (
      <EmptyState
        icon={TimerReset}
        title="GitHub rate limit reached"
        description={
          waiting
            ? `GitHub limits anonymous API use. You can retry in ${formatDuration(resetAt - now)}, or add a free access token for much higher limits.`
            : 'The limit has reset, so you can try again now.'
        }
      >
        {onRetry && (
          <Button variant="outline" size="sm" onClick={onRetry} disabled={waiting}>
            <RefreshCw /> Retry
          </Button>
        )}
        <Button variant="outline" size="sm" asChild>
          <Link to="/settings#api-access">
            <KeyRound /> Add token
          </Link>
        </Button>
      </EmptyState>
    )
  }

  const title =
    known?.kind === 'not-found'
      ? 'Not found on GitHub'
      : known?.kind === 'invalid-query'
        ? 'That search didn’t work'
        : known?.kind === 'auth'
          ? 'Access token rejected'
          : known?.kind === 'network'
            ? 'Can’t reach GitHub'
            : 'Something went wrong'

  return (
    <EmptyState
      icon={known?.kind === 'network' ? CloudOff : SearchX}
      title={title}
      description={error instanceof Error ? error.message : undefined}
    >
      {known?.kind === 'auth' ? (
        <Button variant="outline" size="sm" asChild>
          <Link to="/settings#api-access">
            <KeyRound /> Open settings
          </Link>
        </Button>
      ) : (
        onRetry &&
        known?.kind !== 'not-found' &&
        known?.kind !== 'invalid-query' && (
          <Button variant="outline" size="sm" onClick={onRetry}>
            <RefreshCw /> Try again
          </Button>
        )
      )}
    </EmptyState>
  )
}
