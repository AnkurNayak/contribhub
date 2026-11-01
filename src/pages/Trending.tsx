import { Info, TrendingUp } from 'lucide-react'
import { useMemo } from 'react'
import { LanguageSelect } from '@/components/common/LanguageSelect'
import { PageHeader } from '@/components/common/PageHeader'
import { EmptyState } from '@/components/common/States'
import { RepoGrid } from '@/components/projects/RepoGrid'
import { Card } from '@/components/ui/card'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { useRepoSearch } from '@/hooks/useGitHub'
import { useUrlParams } from '@/hooks/useUrlParams'
import type { TimeWindow } from '@/types/app'
import { cn } from '@/utils/cn'
import { formatCount, formatRelative } from '@/utils/format'
import { buildTrendingQuery, starVelocity, TRENDING_WINDOWS } from '@/utils/queryBuilders'

const WINDOWS = Object.keys(TRENDING_WINDOWS) as TimeWindow[]

export default function Trending() {
  useDocumentTitle('Trending Projects')
  const { params, setParam } = useUrlParams()
  const raw = params.get('window') as TimeWindow | null
  const window: TimeWindow = raw && raw in TRENDING_WINDOWS ? raw : 'weekly'
  const language = params.get('language') ?? ''
  const config = TRENDING_WINDOWS[window]

  const search = useRepoSearch({ query: buildTrendingQuery(window, language), sort: 'stars', perPage: 30 })

  const ranked = useMemo(
    () =>
      search.data?.items
        .slice()
        .sort((a, b) => starVelocity(b.stars, b.createdAt) - starVelocity(a.stars, a.createdAt)),
    [search.data],
  )

  return (
    <>
      <PageHeader
        title="Trending Projects"
        description="New repositories gaining stars fastest, ranked by stars per day."
      />

      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div role="group" aria-label="Time window" className="inline-flex w-fit rounded-lg border bg-muted p-0.5">
          {WINDOWS.map((id) => (
            <button
              key={id}
              type="button"
              aria-pressed={id === window}
              onClick={() => setParam({ window: id })}
              className={cn(
                'rounded-md px-3.5 py-1 text-sm transition-colors',
                id === window ? 'bg-card font-medium shadow-xs' : 'text-muted-foreground hover:text-foreground',
              )}
            >
              {TRENDING_WINDOWS[id].label}
            </button>
          ))}
        </div>
        <LanguageSelect value={language} onChange={(next) => setParam({ language: next || null })} />
      </div>

      <Card className="mb-5 bg-transparent p-3.5 shadow-none">
        <details>
          <summary className="flex cursor-pointer items-center gap-2 rounded-sm text-sm font-medium">
            <Info className="size-4 text-muted-foreground" aria-hidden />
            How trending is calculated
          </summary>
          <div className="mt-2 space-y-2 pl-6 text-sm text-muted-foreground">
            <p>
              GitHub has no public trending API and doesn’t expose star history through its REST search, so this is an
              estimate. We search for public, non-archived repositories <strong className="font-medium text-foreground">created</strong> in
              the selected window (last {config.days === 1 ? 'day' : `${config.days} days`}) with at least {config.minStars} stars,
              take the 30 most-starred, and rank them by stars ÷ days since creation.
            </p>
            <p>
              Established projects having a good week won’t appear, and this list can differ from
              github.com/trending, which uses GitHub’s private data.
            </p>
          </div>
        </details>
      </Card>

      <RepoGrid
        repos={ranked}
        isLoading={search.isLoading}
        error={search.error}
        onRetry={() => search.refetch()}
        dimmed={search.isPlaceholderData}
        footnote={(repo) =>
          `${formatCount(Math.round(starVelocity(repo.stars, repo.createdAt)))} ★/day · pushed ${formatRelative(repo.pushedAt)}`
        }
        empty={
          <EmptyState
            icon={TrendingUp}
            title="Nothing trending for this selection yet"
            description="Few new repositories clear the star threshold in short windows. Try a longer window or another language."
          />
        }
      />
    </>
  )
}
