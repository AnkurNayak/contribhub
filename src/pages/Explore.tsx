import { SearchX } from 'lucide-react'
import { PageHeader } from '@/components/common/PageHeader'
import { Pagination } from '@/components/common/Pagination'
import { EmptyState } from '@/components/common/States'
import { ProjectFilters } from '@/components/projects/ProjectFilters'
import { RepoGrid } from '@/components/projects/RepoGrid'
import { usePreferences } from '@/context/PreferencesContext'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { useRepoSearch } from '@/hooks/useGitHub'
import { useUrlParams } from '@/hooks/useUrlParams'
import type { RepoFilters } from '@/types/app'
import { buildRepoQuery } from '@/utils/queryBuilders'

const PARAM_NAMES = ['q', 'language', 'topic', 'stars', 'sort']

export default function Explore() {
  useDocumentTitle('Explore Projects')
  const { params, setParam, page } = useUrlParams()
  const { perPage } = usePreferences().preferences

  const q = params.get('q') ?? ''
  const filters: RepoFilters = {
    q,
    language: params.get('language') ?? '',
    topic: params.get('topic') ?? '',
    // Text searches should reach small projects; browsing starts with established ones.
    minStars: Number(params.get('stars') ?? (q ? 0 : 100)) || 0,
    sort: params.get('sort') === 'updated' ? 'updated' : 'stars',
  }
  const search = useRepoSearch({ query: buildRepoQuery(filters), sort: filters.sort, page, perPage })
  const canClear = PARAM_NAMES.some((name) => params.has(name))
  const clear = () => setParam(Object.fromEntries(PARAM_NAMES.map((name) => [name, null])))

  return (
    <>
      <PageHeader
        title="Explore Projects"
        description="Search public GitHub repositories and narrow them down by language, popularity and topic."
      />
      <ProjectFilters filters={filters} onChange={setParam} onClear={clear} canClear={canClear} />

      {search.data && (
        <p className="mb-3 text-[13px] text-muted-foreground" aria-live="polite">
          {search.data.totalCount.toLocaleString('en')} repositories
        </p>
      )}
      <RepoGrid
        repos={search.data?.items}
        isLoading={search.isLoading}
        error={search.error}
        onRetry={() => search.refetch()}
        dimmed={search.isPlaceholderData}
        empty={
          <EmptyState
            icon={SearchX}
            title="No repositories match these filters"
            description="Try a broader search term or remove a filter."
          />
        }
      />
      {search.error && search.data ? (
        <p role="alert" className="mt-3 text-sm text-destructive">
          Showing earlier results. {(search.error as Error).message}
        </p>
      ) : null}
      {search.data && (
        <Pagination
          page={page}
          perPage={perPage}
          totalCount={search.data.totalCount}
          onPageChange={(next) => {
            setParam({ page: String(next) }, { keepPage: true })
            window.scrollTo({ top: 0 })
          }}
        />
      )}
    </>
  )
}
