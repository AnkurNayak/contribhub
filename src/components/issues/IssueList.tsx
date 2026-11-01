import type { ReactNode } from 'react'
import { ErrorState } from '@/components/common/States'
import type { Issue } from '@/types/github'
import { cn } from '@/utils/cn'
import { IssueCard, IssueCardSkeleton } from './IssueCard'

export function IssueList({
  issues,
  isLoading,
  error,
  onRetry,
  empty,
  skeletons = 6,
  dimmed,
}: {
  issues?: Issue[]
  isLoading: boolean
  error: unknown
  onRetry: () => void
  empty: ReactNode
  skeletons?: number
  dimmed?: boolean
}) {
  if (error && !issues) return <ErrorState error={error} onRetry={onRetry} />
  if (isLoading || !issues) {
    return (
      <div className="space-y-2.5" aria-busy aria-label="Loading issues">
        {Array.from({ length: skeletons }, (_, index) => (
          <IssueCardSkeleton key={index} />
        ))}
      </div>
    )
  }
  if (issues.length === 0) return <>{empty}</>
  return (
    <div className={cn('space-y-2.5 transition-opacity', dimmed && 'opacity-60')}>
      {issues.map((issue) => (
        <IssueCard key={issue.id} issue={issue} />
      ))}
    </div>
  )
}
