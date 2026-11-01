import { ArrowLeft, CircleDot, ExternalLink, GitFork, Rocket, Star } from 'lucide-react'
import { lazy, Suspense } from 'react'
import { Link, useParams } from 'react-router-dom'
import { BookmarkButton } from '@/components/common/BookmarkButton'
import { ErrorState } from '@/components/common/States'
import { ProjectAbout } from '@/components/projects/ProjectAbout'
import { ProjectActivity } from '@/components/projects/ProjectActivity'
import { ProjectContributeTab } from '@/components/projects/ProjectContributeTab'
import { ProjectIssuesTab } from '@/components/projects/ProjectIssuesTab'
import { RepoStat } from '@/components/projects/RepoCard'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { repoKey, useBookmarks } from '@/context/BookmarksContext'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { useReadme, useRepository } from '@/hooks/useGitHub'
import { useUrlParams } from '@/hooks/useUrlParams'
import type { Repo } from '@/types/github'

// The Markdown stack is the heaviest dependency; only this tab needs it.
const Markdown = lazy(() => import('@/components/common/Markdown'))

const TABS = ['readme', 'issues', 'good-first', 'activity', 'contribute']

function ReadmeSkeleton() {
  return (
    <div className="space-y-3" aria-busy aria-label="Loading README">
      <Skeleton className="h-6 w-1/3" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-5/6" />
      <Skeleton className="h-4 w-2/3" />
    </div>
  )
}

function ReadmePanel({ repo }: { repo: Repo }) {
  const readme = useReadme(repo.owner.login, repo.name)
  if (readme.isLoading) return <ReadmeSkeleton />
  if (readme.error) return <ErrorState error={readme.error} onRetry={() => readme.refetch()} />
  if (!readme.data) return <p className="text-sm text-muted-foreground">This repository has no README.</p>
  return (
    <Suspense fallback={<ReadmeSkeleton />}>
      <Markdown source={readme.data} repoFullName={repo.fullName} branch={repo.defaultBranch} />
    </Suspense>
  )
}

export default function ProjectDetails() {
  const { owner = '', repo: name = '' } = useParams()
  const { params, setParam } = useUrlParams()
  const query = useRepository(owner, name)
  const { isSaved, toggleRepo } = useBookmarks()
  useDocumentTitle(`${owner}/${name}`)

  const requested = params.get('tab') ?? ''
  const tab = TABS.includes(requested) ? requested : 'readme'

  if (query.error) {
    return (
      <div className="mx-auto max-w-lg py-10">
        <ErrorState error={query.error} onRetry={() => query.refetch()} />
      </div>
    )
  }

  const repo = query.data
  if (!repo) {
    return (
      <div aria-busy aria-label="Loading project">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="mt-6 h-8 w-72 max-w-full" />
        <Skeleton className="mt-3 h-4 w-full max-w-xl" />
        <Skeleton className="mt-8 h-96 rounded-xl" />
      </div>
    )
  }

  return (
    <>
      <Link
        to="/explore"
        className="mb-5 inline-flex items-center gap-1.5 rounded-sm text-[13px] text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-3.5" aria-hidden /> Explore
      </Link>

      <header className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex min-w-0 gap-3.5">
          <img src={repo.owner.avatarUrl} alt="" className="size-12 shrink-0 rounded-xl border bg-muted" />
          <div className="min-w-0">
            <p className="text-[13px] text-muted-foreground">
              <a href={repo.owner.htmlUrl} target="_blank" rel="noreferrer" className="hover:underline">
                {repo.owner.login}
              </a>
            </p>
            <h1 className="flex flex-wrap items-center gap-2 text-2xl font-semibold tracking-tight">
              <span className="break-all">{repo.name}</span>
              {repo.archived && <Badge>Archived</Badge>}
            </h1>
            {repo.description && <p className="mt-1.5 max-w-2xl text-sm text-muted-foreground">{repo.description}</p>}
            <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-[13px] text-muted-foreground">
              <RepoStat icon={Star} value={repo.stars} label="stars" />
              <RepoStat icon={GitFork} value={repo.forks} label="forks" />
              <RepoStat icon={CircleDot} value={repo.openIssues} label="open issues and pull requests" />
            </div>
          </div>
        </div>
        <div className="flex shrink-0 flex-wrap gap-2">
          <BookmarkButton withText saved={isSaved(repoKey(repo))} label={repo.fullName} onToggle={() => toggleRepo(repo)} />
          <Button variant="outline" asChild>
            <a href={repo.htmlUrl} target="_blank" rel="noreferrer">
              <ExternalLink aria-hidden /> View on GitHub
            </a>
          </Button>
          <Button asChild>
            <a href={repo.htmlUrl} target="_blank" rel="noreferrer">
              <Rocket aria-hidden /> Start Contributing
            </a>
          </Button>
        </div>
      </header>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_280px]">
        <Tabs
          value={tab}
          onValueChange={(next) => setParam({ tab: next === 'readme' ? null : next }, { replace: true })}
          className="min-w-0"
        >
          <TabsList>
            <TabsTrigger value="readme">README</TabsTrigger>
            <TabsTrigger value="issues">Open issues</TabsTrigger>
            <TabsTrigger value="good-first">Good first issues</TabsTrigger>
            <TabsTrigger value="activity">Latest activity</TabsTrigger>
            <TabsTrigger value="contribute">How to contribute</TabsTrigger>
          </TabsList>
          <TabsContent value="readme">
            <Card className="p-5 sm:p-6">
              <ReadmePanel repo={repo} />
            </Card>
          </TabsContent>
          <TabsContent value="issues">
            <ProjectIssuesTab repo={repo} />
          </TabsContent>
          <TabsContent value="good-first">
            <ProjectIssuesTab repo={repo} labels="good first issue" />
          </TabsContent>
          <TabsContent value="activity">
            <ProjectActivity repo={repo} />
          </TabsContent>
          <TabsContent value="contribute">
            <ProjectContributeTab repo={repo} />
          </TabsContent>
        </Tabs>
        <ProjectAbout repo={repo} />
      </div>
    </>
  )
}
