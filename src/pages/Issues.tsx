import { CircleDashed } from 'lucide-react'
import { IssueFiltersBar } from '@/components/issues/IssueFiltersBar'
import { IssueList } from '@/components/issues/IssueList'
import { PageHeader } from '@/components/common/PageHeader'
import { Pagination } from '@/components/common/Pagination'
import { EmptyState } from '@/components/common/States'
import { usePreferences } from '@/context/PreferencesContext'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { useIssueSearch } from '@/hooks/useGitHub'
import { useUrlParams } from '@/hooks/useUrlParams'
import type { IssueFilters } from '@/types/app'
import { buildIssueQuery } from '@/utils/queryBuilders'

const PARAM_NAMES = ['q', 'labels', 'language', 'repo', 'recent', 'unassigned', 'sort']

function parseSort(value: string | null): IssueFilters['sort'] {
  return value === 'created' || value === 'comments' ? value : 'updated'
}

export default function Issues() {
  useDocumentTitle('Find Good First Issues on GitHub', {
    description:
      'Browse open good first issues and help wanted issues from public GitHub repositories. Filter by language, label and repository.',
  })
  const { params, setParam, page } = useUrlParams()
  const { perPage } = usePreferences().preferences

  // Absent means the beginner-friendly default; an empty value means "no label filter".
  const labels = params.get('labels')
  const filters: IssueFilters = {
    q: params.get('q') ?? '',
    labels: labels === null ? ['good-first-issue'] : labels.split(',').filter(Boolean),
    language: params.get('language') ?? '',
    repo: params.get('repo') ?? '',
    recentOnly: params.has('recent'),
    unassigned: params.has('unassigned'),
    sort: parseSort(params.get('sort')),
  }

  const search = useIssueSearch(
    { query: buildIssueQuery(filters), sort: filters.sort, page, perPage },
    filters.language,
  )
  const canClear = PARAM_NAMES.some((name) => params.has(name))
  const clear = () => setParam(Object.fromEntries(PARAM_NAMES.map((name) => [name, null])))

  return (
    <>
      <PageHeader
        title="Find Issues"
        description="Open issues from public repositories. Starts with good first issues; combine labels to narrow further."
      />
      <IssueFiltersBar filters={filters} onChange={setParam} onClear={clear} canClear={canClear} />

      {search.data && (
        <p className="mb-3 text-[13px] text-muted-foreground" aria-live="polite">
          {search.data.totalCount.toLocaleString('en')} open issues
        </p>
      )}
      <IssueList
        issues={search.data?.items}
        isLoading={search.isLoading}
        error={search.error}
        onRetry={() => search.refetch()}
        dimmed={search.isPlaceholderData}
        empty={
          <EmptyState
            icon={CircleDashed}
            title="No open issues match these filters"
            description="Labels combine, so every selected label must be on the issue. Try removing one."
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
