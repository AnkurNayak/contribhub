import { ArrowRight, Check, CircleDashed } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import { CodeBlock } from '@/components/common/CodeBlock'
import { LanguageTag } from '@/components/common/LanguageTag'
import { PageHeader } from '@/components/common/PageHeader'
import { Pagination } from '@/components/common/Pagination'
import { EmptyState } from '@/components/common/States'
import { goodFirstIssuesQuery } from '@/components/dashboard/sharedQueries'
import { IssueList } from '@/components/issues/IssueList'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { usePreferences } from '@/context/PreferencesContext'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { useIssueSearch } from '@/hooks/useGitHub'
import { useUrlParams } from '@/hooks/useUrlParams'
import { findLanguagePage, LANGUAGE_PAGES } from '@/seo/languages'
import { languageMeta } from '@/seo/routes'
import NotFound from './NotFound'

export default function LanguageIssues() {
  const page = findLanguagePage(useParams().language)
  if (!page) return <NotFound />
  return <LanguageIssuesPage key={page.slug} slug={page.slug} />
}

function LanguageIssuesPage({ slug }: { slug: string }) {
  const page = findLanguagePage(slug)!
  const meta = languageMeta(page)
  useDocumentTitle(meta.title, { description: meta.description })

  const { setParam, page: pageNumber } = useUrlParams()
  const { perPage } = usePreferences().preferences
  const search = useIssueSearch(
    { query: goodFirstIssuesQuery(page.language), sort: 'updated', page: pageNumber, perPage },
    page.language,
  )

  return (
    <>
      <nav aria-label="Breadcrumb" className="mb-3 text-[13px] text-muted-foreground">
        <Link to="/good-first-issues" className="hover:text-foreground">
          Good first issues
        </Link>{' '}
        / <span className="text-foreground">{page.language}</span>
      </nav>
      <PageHeader
        title={`${page.language} Good First Issues`}
        description={page.intro}
        actions={
          <Button variant="outline" size="sm" asChild>
            <Link to={`/issues?language=${encodeURIComponent(page.language)}`}>
              More filters <ArrowRight />
            </Link>
          </Button>
        }
      />

      <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_300px]">
        <section aria-labelledby="live-issues" className="min-w-0">
          <h2 id="live-issues" className="mb-1 text-lg font-semibold tracking-tight">
            Open {page.language} issues for beginners
          </h2>
          <p className="mb-4 text-[13px] text-muted-foreground" aria-live="polite">
            {search.data
              ? `${search.data.totalCount.toLocaleString('en')} open, unassigned issues labelled “good first issue”, most recently updated first.`
              : 'Live from GitHub: open, unassigned issues labelled “good first issue”.'}
          </p>
          <IssueList
            issues={search.data?.items}
            isLoading={search.isLoading}
            error={search.error}
            onRetry={() => search.refetch()}
            dimmed={search.isPlaceholderData}
            empty={
              <EmptyState
                icon={CircleDashed}
                title={`No open ${page.language} good first issues right now`}
                description="Try the help wanted label on the issues page, or check back later."
              />
            }
          />
          {search.data && (
            <Pagination
              page={pageNumber}
              perPage={perPage}
              totalCount={search.data.totalCount}
              onPageChange={(next) => {
                setParam({ page: String(next) }, { keepPage: true })
                window.scrollTo({ top: 0 })
              }}
            />
          )}
        </section>

        <aside className="space-y-6 text-sm">
          <Card className="p-4">
            <h2 className="font-semibold tracking-tight">Typical first {page.language} contributions</h2>
            <ul className="mt-3 space-y-2 text-muted-foreground">
              {page.tasks.map((task) => (
                <li key={task} className="flex gap-2">
                  <Check className="mt-0.5 size-4 shrink-0 text-brand" aria-hidden />
                  {task}
                </li>
              ))}
            </ul>
          </Card>

          <Card className="p-4">
            <h2 className="font-semibold tracking-tight">Set up a {page.language} project</h2>
            <CodeBlock code={page.setup} className="mt-3" />
            <p className="mt-2 text-[13px] text-muted-foreground">{page.setupNote}</p>
          </Card>

          <Card className="p-4">
            <h2 className="font-semibold tracking-tight">Popular {page.language} projects</h2>
            <ul className="mt-3 space-y-1.5">
              {page.projects.map((repo) => (
                <li key={repo}>
                  <Link to={`/projects/${repo}`} className="font-mono text-[13px] text-muted-foreground hover:text-foreground">
                    {repo}
                  </Link>
                </li>
              ))}
            </ul>
            <p className="mt-3 text-[13px] text-muted-foreground">
              First time?{' '}
              <Link to="/guide" className="text-foreground underline underline-offset-4">
                How to make your first pull request
              </Link>
            </p>
          </Card>

          <div>
            <h2 className="mb-2 font-semibold tracking-tight">Other languages</h2>
            <ul className="flex flex-wrap gap-x-4 gap-y-1.5 text-[13px]">
              {LANGUAGE_PAGES.filter((p) => p.slug !== page.slug).map((p) => (
                <li key={p.slug}>
                  <Link to={`/good-first-issues/${p.slug}`} className="text-muted-foreground hover:text-foreground">
                    <LanguageTag language={p.language} />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </div>
    </>
  )
}
