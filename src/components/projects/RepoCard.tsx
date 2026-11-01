import { CircleDot, ExternalLink, GitFork, Star } from 'lucide-react'
import { Link } from 'react-router-dom'
import { BookmarkButton } from '@/components/common/BookmarkButton'
import { LanguageTag } from '@/components/common/LanguageTag'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { repoKey, useBookmarks } from '@/context/BookmarksContext'
import type { Repo } from '@/types/github'
import { formatCount, formatRelative } from '@/utils/format'

export function RepoStat({
  icon: Icon,
  value,
  label,
}: {
  icon: typeof Star
  value: number
  label: string
}) {
  return (
    <span className="inline-flex items-center gap-1 tabular-nums" title={`${value.toLocaleString('en')} ${label}`}>
      <Icon className="size-3.5" aria-hidden />
      <span className="sr-only">{label}: </span>
      {formatCount(value)}
    </span>
  )
}

export function RepoCard({ repo, footnote }: { repo: Repo; footnote?: string }) {
  const { isSaved, toggleRepo } = useBookmarks()

  return (
    <Card className="group flex flex-col p-4 transition-[border-color,box-shadow] duration-150 hover:border-input hover:shadow-sm">
      <div className="flex items-start gap-3">
        <img
          src={`${repo.owner.avatarUrl}${repo.owner.avatarUrl.includes('?') ? '&' : '?'}s=64`}
          alt=""
          width={36}
          height={36}
          loading="lazy"
          className="size-9 shrink-0 rounded-lg border bg-muted"
        />
        <div className="min-w-0 flex-1">
          <p className="truncate text-xs text-muted-foreground">{repo.owner.login}</p>
          <h3 className="truncate text-[15px] leading-tight font-semibold tracking-tight">
            <Link to={`/projects/${repo.fullName}`} className="rounded-sm hover:underline hover:underline-offset-2">
              {repo.name}
            </Link>
          </h3>
        </div>
        <BookmarkButton saved={isSaved(repoKey(repo))} label={repo.fullName} onToggle={() => toggleRepo(repo)} />
      </div>

      <p className="mt-3 line-clamp-2 min-h-10 text-sm leading-5 text-muted-foreground">
        {repo.description ?? 'No description provided.'}
      </p>

      {repo.topics.length > 0 && (
        <ul className="mt-3 flex h-6 flex-wrap gap-1 overflow-hidden" aria-label="Topics">
          {repo.topics.slice(0, 5).map((topic) => (
            <li key={topic}>
              <Link to={`/explore?topic=${encodeURIComponent(topic)}`}>
                <Badge className="bg-transparent font-normal text-muted-foreground transition-colors hover:text-foreground">
                  {topic}
                </Badge>
              </Link>
            </li>
          ))}
        </ul>
      )}

      <div className="mt-auto pt-4">
        <div className="flex flex-wrap items-center gap-x-3.5 gap-y-1 text-[13px] text-muted-foreground">
          {repo.language && <LanguageTag language={repo.language} />}
          <RepoStat icon={Star} value={repo.stars} label="stars" />
          <RepoStat icon={GitFork} value={repo.forks} label="forks" />
          <RepoStat icon={CircleDot} value={repo.openIssues} label="open issues and pull requests" />
        </div>
        <div className="mt-3 flex items-center justify-between gap-2 border-t pt-3">
          <span className="truncate text-xs text-muted-foreground">
            {footnote ?? `Updated ${formatRelative(repo.pushedAt)}`}
          </span>
          <Button variant="ghost" size="sm" asChild className="-mr-1.5 h-7 shrink-0">
            <a href={repo.htmlUrl} target="_blank" rel="noreferrer">
              GitHub <ExternalLink className="!size-3.5" aria-hidden />
              <span className="sr-only">: open {repo.fullName} (new tab)</span>
            </a>
          </Button>
        </div>
      </div>
    </Card>
  )
}

export function RepoCardSkeleton() {
  return (
    <Card className="p-4">
      <div className="flex items-center gap-3">
        <Skeleton className="size-9 rounded-lg" />
        <div className="flex-1 space-y-1.5">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-4 w-36" />
        </div>
      </div>
      <Skeleton className="mt-4 h-3.5 w-full" />
      <Skeleton className="mt-2 h-3.5 w-3/4" />
      <div className="mt-4 flex gap-1.5">
        <Skeleton className="h-5 w-14 rounded-full" />
        <Skeleton className="h-5 w-20 rounded-full" />
      </div>
      <Skeleton className="mt-5 h-3.5 w-1/2" />
      <Skeleton className="mt-4 h-7 w-full" />
    </Card>
  )
}
