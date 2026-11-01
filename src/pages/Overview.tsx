import { ArrowRight, Bookmark, Code2, Sprout, TrendingUp } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { FilterChip } from '@/components/common/FilterChip'
import { PageHeader } from '@/components/common/PageHeader'
import { EmptyState } from '@/components/common/States'
import { goodFirstIssuesQuery } from '@/components/dashboard/sharedQueries'
import { StatTile } from '@/components/dashboard/StatTile'
import { IssueList } from '@/components/issues/IssueList'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { useBookmarks } from '@/context/BookmarksContext'
import { usePreferences } from '@/context/PreferencesContext'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { useIssueSearch, useRepoSearch } from '@/hooks/useGitHub'
import { formatCount } from '@/utils/format'
import { buildTrendingQuery, starVelocity } from '@/utils/queryBuilders'

export default function Overview() {
  useDocumentTitle('Overview')
  const { languages } = usePreferences().preferences
  const { bookmarks, collections } = useBookmarks()
  const [selected, setSelected] = useState<string | null>(null)
  const language = selected && languages.includes(selected) ? selected : (languages[0] ?? '')

  const issues = useIssueSearch({ query: goodFirstIssuesQuery(language), sort: 'updated', perPage: 6 }, language)
  const trending = useRepoSearch({ query: buildTrendingQuery('weekly', ''), sort: 'stars', perPage: 30 })
  const topTrending = trending.data?.items
    .slice()
    .sort((a, b) => starVelocity(b.stars, b.createdAt) - starVelocity(a.stars, a.createdAt))
    .slice(0, 5)

  return (
    <>
      <PageHeader title="Overview" description="Your starting point: fresh issues, rising projects and what you’ve saved." />

      <div className="mb-8 grid grid-cols-2 gap-3 xl:grid-cols-4">
        <StatTile
          icon={Sprout}
          label={language ? `Good first issues in ${language}` : 'Good first issues'}
          value={issues.data ? formatCount(issues.data.totalCount) : '—'}
          note="Live · open and unassigned"
          loading={issues.isLoading}
        />
        <StatTile
          icon={TrendingUp}
          label="Trending this week"
          value={trending.data ? formatCount(trending.data.totalCount) : '—'}
          note="Live · new repos with 20+ stars"
          loading={trending.isLoading}
        />
        <StatTile
          icon={Bookmark}
          label="Saved items"
          value={String(bookmarks.length)}
          note={`In ${collections.length} ${collections.length === 1 ? 'collection' : 'collections'} · this browser`}
        />
        <StatTile
          icon={Code2}
          label="Your languages"
          value={String(languages.length)}
          note={languages.length ? languages.slice(0, 3).join(', ') : 'None chosen yet'}
        />
      </div>

      <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_340px]">
        <section aria-labelledby="fresh-heading" className="min-w-0">
          <div className="mb-3 flex items-center justify-between gap-3">
            <h2 id="fresh-heading" className="text-base font-semibold tracking-tight">
              Fresh good first issues
            </h2>
            <Button variant="ghost" size="sm" asChild>
              <Link to={`/issues${language ? `?language=${encodeURIComponent(language)}` : ''}`}>
                All issues <ArrowRight />
              </Link>
            </Button>
          </div>
          {languages.length > 1 && (
            <div className="mb-3 flex flex-wrap gap-1.5" role="group" aria-label="Language">
              {languages.map((name) => (
                <FilterChip key={name} active={name === language} onClick={() => setSelected(name)}>
                  {name}
                </FilterChip>
              ))}
            </div>
          )}
          {languages.length === 0 && (
            <p className="mb-3 text-sm text-muted-foreground">
              <Link to="/settings#languages" className="font-medium text-foreground underline underline-offset-2">
                Choose your languages
              </Link>{' '}
              to tailor this list.
            </p>
          )}
          <IssueList
            issues={issues.data?.items}
            isLoading={issues.isLoading}
            error={issues.error}
            onRetry={() => issues.refetch()}
            dimmed={issues.isPlaceholderData}
            empty={<EmptyState title="No unassigned good first issues right now" />}
          />
        </section>

        <aside className="space-y-6">
          <section aria-labelledby="rising-heading">
            <div className="mb-3 flex items-center justify-between gap-3">
              <h2 id="rising-heading" className="text-base font-semibold tracking-tight">
                Rising this week
              </h2>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/trending">
                  Trending <ArrowRight />
                </Link>
              </Button>
            </div>
            <Card className="divide-y">
              {topTrending
                ? topTrending.map((repo) => (
                    <div key={repo.id} className="flex items-center gap-2.5 px-3.5 py-2.5 text-sm">
                      <img src={`${repo.owner.avatarUrl}&s=48`} alt="" loading="lazy" className="size-6 rounded-md border" />
                      <Link to={`/projects/${repo.fullName}`} className="min-w-0 flex-1 truncate font-medium hover:underline">
                        {repo.fullName}
                      </Link>
                      <span className="shrink-0 text-xs text-muted-foreground tabular-nums">
                        {formatCount(Math.round(starVelocity(repo.stars, repo.createdAt)))} ★/day
                      </span>
                    </div>
                  ))
                : trending.error
                  ? (
                    <p className="p-4 text-sm text-muted-foreground">Trending projects are unavailable right now.</p>
                  )
                  : Array.from({ length: 5 }, (_, index) => (
                      <div key={index} className="p-3.5">
                        <Skeleton className="h-4 w-full" />
                      </div>
                    ))}
            </Card>
          </section>

          <section aria-labelledby="saved-heading">
            <div className="mb-3 flex items-center justify-between gap-3">
              <h2 id="saved-heading" className="text-base font-semibold tracking-tight">
                Recently saved
              </h2>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/bookmarks">
                  Bookmarks <ArrowRight />
                </Link>
              </Button>
            </div>
            {bookmarks.length === 0 ? (
              <EmptyState
                icon={Bookmark}
                title="Nothing saved yet"
                description="Use the bookmark icon on any project or issue to keep it here."
              />
            ) : (
              <Card className="divide-y">
                {bookmarks.slice(0, 5).map((item) =>
                  item.kind === 'repo' ? (
                    <Link
                      key={item.key}
                      to={`/projects/${item.repo.fullName}`}
                      className="block truncate px-3.5 py-2.5 text-sm font-medium hover:bg-accent/50"
                    >
                      {item.repo.fullName}
                    </Link>
                  ) : (
                    <a
                      key={item.key}
                      href={item.issue.htmlUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="block truncate px-3.5 py-2.5 text-sm hover:bg-accent/50"
                    >
                      {item.issue.title}
                    </a>
                  ),
                )}
              </Card>
            )}
          </section>
        </aside>
      </div>
    </>
  )
}
