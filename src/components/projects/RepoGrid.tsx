import type { ReactNode } from 'react'
import { ErrorState } from '@/components/common/States'
import type { Repo } from '@/types/github'
import { cn } from '@/utils/cn'
import { RepoCard, RepoCardSkeleton } from './RepoCard'

interface RepoGridProps {
  repos?: Repo[]
  isLoading: boolean
  error: unknown
  onRetry: () => void
  empty: ReactNode
  skeletons?: number
  dimmed?: boolean
  footnote?: (repo: Repo) => string
}

const GRID = 'grid gap-3 md:grid-cols-2 2xl:grid-cols-3'

export function RepoGrid({ repos, isLoading, error, onRetry, empty, skeletons = 6, dimmed, footnote }: RepoGridProps) {
  if (error && !repos) return <ErrorState error={error} onRetry={onRetry} />
  if (isLoading || !repos) {
    return (
      <div className={GRID} aria-busy aria-label="Loading projects">
        {Array.from({ length: skeletons }, (_, index) => (
          <RepoCardSkeleton key={index} />
        ))}
      </div>
    )
  }
  if (repos.length === 0) return <>{empty}</>
  return (
    <div className={cn(GRID, 'transition-opacity', dimmed && 'opacity-60')}>
      {repos.map((repo) => (
        <RepoCard key={repo.id} repo={repo} footnote={footnote?.(repo)} />
      ))}
    </div>
  )
}
