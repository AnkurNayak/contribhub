import { ExternalLink } from 'lucide-react'
import { useMemo } from 'react'
import { IssueList } from '@/components/issues/IssueList'
import { EmptyState } from '@/components/common/States'
import { Button } from '@/components/ui/button'
import { useRepoIssues } from '@/hooks/useGitHub'
import type { Repo } from '@/types/github'

export function ProjectIssuesTab({ repo, labels }: { repo: Repo; labels?: string }) {
  const query = useRepoIssues(repo.owner.login, repo.name, labels, true)
  // The repository is already known, so cards needn't spend a request looking it up.
  const issues = useMemo(
    () => query.data?.map((issue) => ({ ...issue, language: repo.language })),
    [query.data, repo.language],
  )
  const allIssuesUrl = `${repo.htmlUrl}/issues`

  return (
    <IssueList
      issues={issues}
      isLoading={query.isLoading}
      error={query.error}
      onRetry={() => query.refetch()}
      skeletons={4}
      empty={
        <EmptyState
          title={labels ? 'No “good first issue” label here right now' : 'No open issues'}
          description={
            labels
              ? 'Projects label beginner tasks differently. Their issue tracker may use another name.'
              : 'This project has no open issues at the moment.'
          }
        >
          <Button variant="outline" size="sm" asChild>
            <a href={allIssuesUrl} target="_blank" rel="noreferrer">
              <ExternalLink aria-hidden /> Issue tracker on GitHub
            </a>
          </Button>
        </EmptyState>
      }
    />
  )
}
