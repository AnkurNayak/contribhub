import { BookOpen, ExternalLink, FileText, ShieldCheck } from 'lucide-react'
import { Link } from 'react-router-dom'
import { CodeBlock } from '@/components/common/CodeBlock'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { useCommunityProfile, useViewer } from '@/hooks/useGitHub'
import type { Repo } from '@/types/github'

export function ProjectContributeTab({ repo }: { repo: Repo }) {
  const community = useCommunityProfile(repo.owner.login, repo.name, true)
  const { data: viewer } = useViewer()
  const you = viewer?.login ?? 'YOUR-USERNAME'
  const profile = community.data

  const steps = [
    {
      title: 'Fork the repository',
      body: (
        <p>
          Create your own copy using{' '}
          <a href={`${repo.htmlUrl}/fork`} target="_blank" rel="noreferrer" className="font-medium text-foreground underline underline-offset-2">
            the fork page
          </a>
          .
        </p>
      ),
    },
    {
      title: 'Clone your fork and track the original',
      code: `git clone https://github.com/${you}/${repo.name}.git\ncd ${repo.name}\ngit remote add upstream ${repo.htmlUrl}.git`,
    },
    {
      title: 'Create a branch for your change',
      code: `git switch -c fix/short-description`,
    },
    {
      title: 'Commit and push',
      code: `git add .\ngit commit -m "Describe your change"\ngit push -u origin fix/short-description`,
    },
    {
      title: `Open a pull request against ${repo.defaultBranch}`,
      body: (
        <p>
          GitHub offers a “Compare &amp; pull request” button after you push. Reference the issue you’re solving, e.g.
          “Fixes #123”.
        </p>
      ),
    },
  ]

  return (
    <div className="space-y-4">
      <Card className="p-4">
        <h2 className="text-sm font-semibold">Read this project’s rules first</h2>
        {community.isLoading ? (
          <Skeleton className="mt-3 h-8 w-64" />
        ) : (
          <>
            <div className="mt-3 flex flex-wrap gap-2">
              {profile?.contributingUrl && (
                <Button variant="outline" size="sm" asChild>
                  <a href={profile.contributingUrl} target="_blank" rel="noreferrer">
                    <FileText aria-hidden /> Contributing guidelines
                  </a>
                </Button>
              )}
              {profile?.codeOfConductUrl && (
                <Button variant="outline" size="sm" asChild>
                  <a href={profile.codeOfConductUrl} target="_blank" rel="noreferrer">
                    <ShieldCheck aria-hidden /> Code of conduct
                  </a>
                </Button>
              )}
              <Button variant="outline" size="sm" asChild>
                <a href={`${repo.htmlUrl}/issues`} target="_blank" rel="noreferrer">
                  <ExternalLink aria-hidden /> Issue tracker
                </a>
              </Button>
            </div>
            {profile && !profile.contributingUrl && (
              <p className="mt-2 text-[13px] text-muted-foreground">
                No CONTRIBUTING file was found. Check the README and comment on an issue before starting larger work.
              </p>
            )}
            {community.error ? (
              <p className="mt-2 text-[13px] text-muted-foreground">
                Couldn’t check for contributing guidelines. Look for a CONTRIBUTING file in the repository.
              </p>
            ) : null}
          </>
        )}
      </Card>

      <ol className="space-y-4">
        {steps.map((step, index) => (
          <li key={step.title} className="flex gap-3">
            <span className="flex size-6 shrink-0 items-center justify-center rounded-full border bg-card text-xs font-medium tabular-nums">
              {index + 1}
            </span>
            <div className="min-w-0 flex-1 text-sm text-muted-foreground">
              <h3 className="mb-1.5 pt-0.5 font-medium text-foreground">{step.title}</h3>
              {step.body}
              {step.code && <CodeBlock code={step.code} />}
            </div>
          </li>
        ))}
      </ol>

      <Button variant="ghost" size="sm" asChild>
        <Link to="/guide">
          <BookOpen aria-hidden /> Read the full contribution guide
        </Link>
      </Button>
    </div>
  )
}
