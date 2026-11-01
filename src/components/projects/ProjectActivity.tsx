import { GitCommitHorizontal } from 'lucide-react'
import { EmptyState, ErrorState } from '@/components/common/States'
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { useCommits } from '@/hooks/useGitHub'
import type { Repo } from '@/types/github'
import { formatRelative } from '@/utils/format'

export function ProjectActivity({ repo }: { repo: Repo }) {
  const commits = useCommits(repo.owner.login, repo.name, true)

  if (commits.error) return <ErrorState error={commits.error} onRetry={() => commits.refetch()} />
  if (!commits.data) {
    return (
      <Card className="divide-y" aria-busy aria-label="Loading commits">
        {Array.from({ length: 5 }, (_, index) => (
          <div key={index} className="p-3.5">
            <Skeleton className="h-4 w-3/4" />
          </div>
        ))}
      </Card>
    )
  }
  if (commits.data.length === 0) return <EmptyState icon={GitCommitHorizontal} title="No commits yet" />

  return (
    <Card>
      <ol className="divide-y">
        {commits.data.map((commit) => (
          <li key={commit.sha} className="flex items-center gap-3 px-3.5 py-2.5">
            {commit.authorAvatar ? (
              <img src={commit.authorAvatar} alt="" loading="lazy" className="size-6 shrink-0 rounded-full border" />
            ) : (
              <GitCommitHorizontal className="size-5 shrink-0 text-muted-foreground" aria-hidden />
            )}
            <div className="min-w-0 flex-1">
              <a
                href={commit.htmlUrl}
                target="_blank"
                rel="noreferrer"
                className="block truncate text-sm font-medium hover:underline"
              >
                {commit.message}
              </a>
              <p className="truncate text-xs text-muted-foreground">
                {commit.authorName}
                {commit.date && ` · ${formatRelative(commit.date)}`}
              </p>
            </div>
            <code className="hidden font-mono text-xs text-muted-foreground sm:block">{commit.sha.slice(0, 7)}</code>
          </li>
        ))}
      </ol>
    </Card>
  )
}
