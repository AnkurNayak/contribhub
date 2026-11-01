import { CircleDot, MessageSquare, Star } from 'lucide-react'
import { Link } from 'react-router-dom'
import { ContributionGrid } from '@/components/common/ContributionGrid'
import { LogoMark } from '@/components/common/Logo'
import { NAV_ITEMS } from '@/components/layout/navigation'
import { Skeleton } from '@/components/ui/skeleton'
import type { Issue, Repo } from '@/types/github'
import { formatCount, formatRelative } from '@/utils/format'

/** Landing-page window onto the real app, filled with the same live data it fetches. */
export function AppPreview({ issues, repos }: { issues?: Issue[]; repos?: Repo[] }) {
  return (
    <div className="overflow-hidden rounded-xl border bg-card shadow-[0_24px_60px_-30px_rgb(0_0_0/0.25)]">
      <div className="flex h-9 items-center gap-2 border-b px-3.5 text-xs text-muted-foreground">
        <LogoMark className="size-3.5" />
        ContribHub
        <span className="ml-auto inline-flex items-center gap-1.5">
          <span className="size-1.5 rounded-full bg-brand" aria-hidden />
          Live from GitHub
        </span>
      </div>
      <div className="flex">
        <div aria-hidden className="hidden w-44 shrink-0 space-y-0.5 border-r p-2 md:block">
          {NAV_ITEMS.slice(0, 6).map(({ label, icon: Icon, to }) => (
            <div
              key={to}
              className={`flex items-center gap-2 rounded-md px-2 py-1.5 text-xs ${
                to === '/issues' ? 'bg-accent font-medium' : 'text-muted-foreground'
              }`}
            >
              <Icon className="size-3.5 shrink-0" />
              <span className="truncate">{label}</span>
            </div>
          ))}
        </div>

        <div className="min-w-0 flex-1 p-4">
          <p className="text-sm font-semibold">Good first issues</p>
          <ul className="mt-3 divide-y rounded-lg border">
            {issues
              ? issues.slice(0, 4).map((issue) => (
                  <li key={issue.id} className="flex gap-2.5 px-3 py-2.5">
                    <CircleDot className="mt-0.5 size-3.5 shrink-0 text-brand" aria-hidden />
                    <div className="min-w-0 flex-1">
                      <a
                        href={issue.htmlUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="block truncate text-[13px] font-medium hover:underline"
                      >
                        {issue.title}
                      </a>
                      <p className="truncate text-xs text-muted-foreground">
                        {issue.repoFullName} · {formatRelative(issue.createdAt)}
                      </p>
                    </div>
                    <span className="hidden shrink-0 items-center gap-1 text-xs text-muted-foreground tabular-nums sm:inline-flex">
                      <MessageSquare className="size-3" aria-hidden /> {issue.comments}
                    </span>
                  </li>
                ))
              : Array.from({ length: 4 }, (_, index) => (
                  <li key={index} className="px-3 py-3">
                    <Skeleton className="h-3 w-3/4" />
                    <Skeleton className="mt-2 h-2.5 w-1/3" />
                  </li>
                ))}
          </ul>
        </div>

        <div className="hidden w-72 shrink-0 border-l p-4 xl:block">
          <p className="text-sm font-semibold">Most starred</p>
          <ul className="mt-3 space-y-2.5">
            {repos
              ? repos.slice(0, 4).map((repo) => (
                  <li key={repo.id} className="flex items-center gap-2 text-[13px]">
                    <img src={`${repo.owner.avatarUrl}&s=40`} alt="" className="size-5 rounded border" loading="lazy" />
                    <Link to={`/projects/${repo.fullName}`} className="min-w-0 flex-1 truncate hover:underline">
                      {repo.fullName}
                    </Link>
                    <span className="inline-flex items-center gap-1 text-xs text-muted-foreground tabular-nums">
                      <Star className="size-3" aria-hidden /> {formatCount(repo.stars)}
                    </span>
                  </li>
                ))
              : Array.from({ length: 4 }, (_, index) => <Skeleton key={index} className="h-4 w-full" />)}
          </ul>
          <ContributionGrid weeks={22} className="mt-5 opacity-80" />
        </div>
      </div>
    </div>
  )
}
