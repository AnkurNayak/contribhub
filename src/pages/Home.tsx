import { ArrowRight, CircleDot, Code2, FolderGit2, Sprout } from 'lucide-react'
import { Link } from 'react-router-dom'
import { RateLimitBanner } from '@/components/common/RateLimitBanner'
import { ErrorState } from '@/components/common/States'
import { AppPreview } from '@/components/dashboard/AppPreview'
import {
  goodFirstIssuesQuery,
  OPEN_ISSUES_QUERY,
  POPULAR_REPOS_QUERY,
} from '@/components/dashboard/sharedQueries'
import { StatTile } from '@/components/dashboard/StatTile'
import { TopBar } from '@/components/layout/TopBar'
import { RepoGrid } from '@/components/projects/RepoGrid'
import { Button } from '@/components/ui/button'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { useIssueSearch, useRepoSearch } from '@/hooks/useGitHub'
import { LANGUAGES, PROJECT_REPO_URL } from '@/utils/constants'
import { formatCount } from '@/utils/format'

function liveValue(count: number | undefined) {
  return count === undefined ? '—' : formatCount(count)
}

export default function Home() {
  useDocumentTitle('')
  const repos = useRepoSearch({ query: POPULAR_REPOS_QUERY, sort: 'stars', perPage: 6 })
  const goodFirst = useIssueSearch({ query: goodFirstIssuesQuery(), sort: 'updated', perPage: 6 })
  const openIssues = useIssueSearch({ query: OPEN_ISSUES_QUERY, perPage: 1 })

  return (
    <div className="min-h-dvh">
      <TopBar
        logoClassName="mr-1 hidden shrink-0 pl-1 min-[375px]:flex lg:mr-3"
        start={
          <nav aria-label="Primary" className="mr-2 hidden items-center gap-0.5 lg:flex">
            {[
              ['/explore', 'Explore'],
              ['/issues', 'Issues'],
              ['/trending', 'Trending'],
              ['/guide', 'Guide'],
            ].map(([to, label]) => (
              <Button key={to} variant="ghost" size="sm" asChild className="text-muted-foreground">
                <Link to={to}>{label}</Link>
              </Button>
            ))}
          </nav>
        }
      />
      <RateLimitBanner />

      <main className="mx-auto max-w-6xl px-4 sm:px-6">
        <section className="pt-14 pb-12 sm:pt-20">
          <h1 className="max-w-3xl text-4xl leading-[1.08] font-semibold tracking-[-0.03em] text-balance sm:text-[3.5rem]">
            Your next open-source contribution starts here.
          </h1>
          <p className="mt-5 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            Discover amazing open-source projects, find issues that match your skills, and become part of the developer
            community.
          </p>
          <div className="mt-7 flex flex-wrap gap-2.5">
            <Button size="lg" asChild>
              <Link to="/explore">
                Explore Projects <ArrowRight />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link to="/issues">Find Good First Issues</Link>
            </Button>
          </div>
          <div className="mt-12">
            <AppPreview issues={goodFirst.data?.items} repos={repos.data?.items} />
          </div>
        </section>

        <section aria-labelledby="stats-heading" className="pb-14">
          <h2 id="stats-heading" className="sr-only">
            Statistics
          </h2>
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <StatTile
              icon={FolderGit2}
              label="Repositories to discover"
              value={liveValue(repos.data?.totalCount)}
              note="Live · public, 100+ stars"
              loading={repos.isLoading}
            />
            <StatTile
              icon={CircleDot}
              label="Open issues"
              value={liveValue(openIssues.data?.totalCount)}
              note="Live · non-archived repos"
              loading={openIssues.isLoading}
            />
            <StatTile
              icon={Sprout}
              label="Good first issues"
              value={liveValue(goodFirst.data?.totalCount)}
              note="Live · open and unassigned"
              loading={goodFirst.isLoading}
            />
            <StatTile
              icon={Code2}
              label="Programming languages"
              value={String(LANGUAGES.length)}
              note="Built-in filters, not a live count"
            />
          </div>
        </section>

        <section aria-labelledby="featured-heading" className="pb-20">
          <div className="mb-5 flex items-end justify-between gap-4">
            <div>
              <h2 id="featured-heading" className="text-xl font-semibold tracking-tight">
                Featured projects
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">The most-starred active repositories on GitHub right now.</p>
            </div>
            <Button variant="ghost" size="sm" asChild className="shrink-0">
              <Link to="/explore">
                View all <ArrowRight />
              </Link>
            </Button>
          </div>
          {repos.error && !repos.data ? (
            <ErrorState error={repos.error} onRetry={() => repos.refetch()} />
          ) : (
            <RepoGrid
              repos={repos.data?.items}
              isLoading={repos.isLoading}
              error={null}
              onRetry={() => repos.refetch()}
              empty={null}
            />
          )}
        </section>
      </main>

      <footer className="border-t">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-6 text-[13px] text-muted-foreground sm:px-6">
          <p>Open source under the MIT license. Data from the GitHub public API; not affiliated with GitHub.</p>
          <nav aria-label="Footer" className="flex gap-4">
            <Link to="/guide" className="hover:text-foreground">
              Contribution guide
            </Link>
            <a href={PROJECT_REPO_URL} target="_blank" rel="noreferrer" className="hover:text-foreground">
              GitHub
            </a>
          </nav>
        </div>
      </footer>
    </div>
  )
}
