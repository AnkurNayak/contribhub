import { Code2, Search } from 'lucide-react'
import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { IssueList } from '@/components/issues/IssueList'
import { LanguageTag } from '@/components/common/LanguageTag'
import { PageHeader } from '@/components/common/PageHeader'
import { Pagination } from '@/components/common/Pagination'
import { SearchInput } from '@/components/common/SearchInput'
import { EmptyState } from '@/components/common/States'
import { RepoGrid } from '@/components/projects/RepoGrid'
import { Card } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { usePreferences } from '@/context/PreferencesContext'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { useIssueSearch, useRepoSearch } from '@/hooks/useGitHub'
import { useUrlParams } from '@/hooks/useUrlParams'
import { LANGUAGES } from '@/utils/constants'
import { formatCount } from '@/utils/format'
import { buildIssueTextQuery, buildRepoQuery } from '@/utils/queryBuilders'

export default function SearchResults() {
  const { params, setParam, page } = useUrlParams()
  const { perPage } = usePreferences().preferences
  const q = params.get('q')?.trim() ?? ''
  const requested = params.get('tab')
  const tab = requested === 'issues' || requested === 'languages' ? requested : 'projects'
  useDocumentTitle(q ? `“${q}”` : 'Search')

  const enabled = q.length > 0
  const repos = useRepoSearch({
    query: buildRepoQuery({ q, language: '', topic: '', minStars: 0 }),
    page: tab === 'projects' ? page : 1,
    perPage,
    enabled,
  })
  const issues = useIssueSearch({
    query: buildIssueTextQuery(q),
    page: tab === 'issues' ? page : 1,
    perPage,
    enabled,
  })
  const languages = useMemo(
    () => (q ? LANGUAGES.filter((language) => language.toLowerCase().includes(q.toLowerCase())) : []),
    [q],
  )

  const changePage = (next: number) => {
    setParam({ page: String(next) }, { keepPage: true })
    window.scrollTo({ top: 0 })
  }

  return (
    <>
      <PageHeader title="Search" description="Projects, issues and programming languages across public GitHub." />
      <div className="mb-5 flex">
        <SearchInput
          label="Search GitHub"
          placeholder="Search projects, issues and languages"
          value={q}
          onChange={(value) => setParam({ q: value || null })}
        />
      </div>

      {!enabled ? (
        <EmptyState icon={Search} title="What are you looking for?" description="Type a project name, keyword or language above." />
      ) : (
        <Tabs value={tab} onValueChange={(next) => setParam({ tab: next === 'projects' ? null : next })}>
          <TabsList>
            <TabsTrigger value="projects">
              Projects {repos.data && <span className="text-xs text-muted-foreground">{formatCount(repos.data.totalCount)}</span>}
            </TabsTrigger>
            <TabsTrigger value="issues">
              Issues {issues.data && <span className="text-xs text-muted-foreground">{formatCount(issues.data.totalCount)}</span>}
            </TabsTrigger>
            <TabsTrigger value="languages">
              Languages <span className="text-xs text-muted-foreground">{languages.length}</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="projects">
            <RepoGrid
              repos={repos.data?.items}
              isLoading={repos.isLoading}
              error={repos.error}
              onRetry={() => repos.refetch()}
              dimmed={repos.isPlaceholderData}
              empty={<EmptyState title={`No projects found for “${q}”`} description="Check the spelling or try a broader term." />}
            />
            {repos.data && (
              <Pagination page={page} perPage={perPage} totalCount={repos.data.totalCount} onPageChange={changePage} />
            )}
          </TabsContent>

          <TabsContent value="issues">
            <IssueList
              issues={issues.data?.items}
              isLoading={issues.isLoading}
              error={issues.error}
              onRetry={() => issues.refetch()}
              dimmed={issues.isPlaceholderData}
              empty={<EmptyState title={`No open issues found for “${q}”`} description="Check the spelling or try a broader term." />}
            />
            {issues.data && (
              <Pagination page={page} perPage={perPage} totalCount={issues.data.totalCount} onPageChange={changePage} />
            )}
          </TabsContent>

          <TabsContent value="languages">
            {languages.length === 0 ? (
              <EmptyState icon={Code2} title={`No language matches “${q}”`} description="Only languages available as filters are listed." />
            ) : (
              <Card className="divide-y">
                {languages.map((language) => (
                  <div key={language} className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 text-sm">
                    <LanguageTag language={language} />
                    <span className="flex gap-3 text-[13px]">
                      <Link to={`/explore?language=${encodeURIComponent(language)}`} className="underline underline-offset-2">
                        Projects
                      </Link>
                      <Link to={`/issues?language=${encodeURIComponent(language)}`} className="underline underline-offset-2">
                        Good first issues
                      </Link>
                    </span>
                  </div>
                ))}
              </Card>
            )}
          </TabsContent>
        </Tabs>
      )}
    </>
  )
}
