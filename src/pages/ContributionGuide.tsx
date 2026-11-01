import { ArrowRight, Check } from 'lucide-react'
import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { CodeBlock } from '@/components/common/CodeBlock'
import { BranchIllustration, ForkFlowIllustration } from '@/components/common/GuideIllustrations'
import { PageHeader } from '@/components/common/PageHeader'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'

const COMMANDS: [string, string][] = [
  ['git status', 'See changed and staged files'],
  ['git switch -c <branch>', 'Create and move to a new branch'],
  ['git add <file>', 'Stage a change for the next commit'],
  ['git commit -m "message"', 'Save staged changes as a commit'],
  ['git push -u origin <branch>', 'Publish your branch to your fork'],
  ['git fetch upstream', 'Download the latest from the original repo'],
  ['git rebase upstream/main', 'Replay your work on top of the latest code'],
  ['git log --oneline', 'View recent history in short form'],
]

const PRACTICES = [
  'Read CONTRIBUTING and the code of conduct before you start.',
  'Comment on an issue and wait for a go-ahead before large changes.',
  'Keep each pull request focused on a single problem.',
  'Run the project’s tests and linter locally before pushing.',
  'Write commit messages that explain why, not just what.',
  'Link the issue in your pull request, e.g. “Fixes #123”.',
  'Treat review feedback as collaboration. Maintainers are often volunteers.',
  'Be patient, then send a polite follow-up after a week or two of silence.',
]

const SECTIONS = [
  ['what', 'What is open source?'],
  ['find', 'Find a project'],
  ['fork', 'Fork a repository'],
  ['clone', 'Clone your fork'],
  ['branch', 'Create a branch'],
  ['change', 'Make your changes'],
  ['pr', 'Open a pull request'],
  ['commands', 'Common Git commands'],
  ['practices', 'Good practices'],
] as const

function Section({ id, step, title, children }: { id: string; step?: number; title: string; children: ReactNode }) {
  return (
    <section id={id} aria-labelledby={`${id}-title`} className="scroll-mt-20">
      <h2 id={`${id}-title`} className="flex items-center gap-2.5 text-lg font-semibold tracking-tight">
        {step && (
          <span className="flex size-6 items-center justify-center rounded-full bg-brand-soft text-xs font-semibold text-brand-foreground tabular-nums">
            {step}
          </span>
        )}
        {title}
      </h2>
      <div className="mt-3 space-y-3 text-sm leading-relaxed text-muted-foreground">{children}</div>
    </section>
  )
}

export default function ContributionGuide() {
  useDocumentTitle('Contribution Guide')

  return (
    <>
      <PageHeader
        title="Contribution Guide"
        description="From “where do I start?” to your first merged pull request, in six steps."
      />

      <div className="grid gap-10 xl:grid-cols-[minmax(0,720px)_200px] xl:justify-between">
        <div className="min-w-0 space-y-10">
          <Card className="p-4 sm:p-6">
            <ForkFlowIllustration />
            <p className="mt-2 text-center text-[13px] text-muted-foreground">The workflow nearly every project uses.</p>
          </Card>

          <Section id="what" title="What is open source?">
            <p>
              Open-source software has source code anyone can read, use and improve under the terms of its license. Most of
              it is built in public by people around the world. Contributions aren’t only code: documentation, bug reports,
              tests, translations and design all count.
            </p>
          </Section>

          <Section id="find" step={1} title="Find a project">
            <p>
              Start with something you already use or a language you’re learning. Check that it’s alive: recent commits,
              maintainers replying to issues, and a clear README. Issues labelled “good first issue” are picked by
              maintainers as a way in.
            </p>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm" asChild>
                <Link to="/issues">
                  Browse good first issues <ArrowRight />
                </Link>
              </Button>
              <Button variant="outline" size="sm" asChild>
                <Link to="/explore">Explore projects</Link>
              </Button>
            </div>
          </Section>

          <Section id="fork" step={2} title="Fork the repository">
            <p>
              A fork is your own copy on GitHub, where you have permission to push. On the project’s page, select{' '}
              <strong className="font-medium text-foreground">Fork</strong>, then{' '}
              <strong className="font-medium text-foreground">Create fork</strong>. Or use the GitHub CLI:
            </p>
            <CodeBlock code="gh repo fork owner/project --clone" />
          </Section>

          <Section id="clone" step={3} title="Clone your fork">
            <p>
              Download your fork, then add the original as a remote named <code className="font-mono text-foreground">upstream</code>{' '}
              so you can pull in new changes later.
            </p>
            <CodeBlock
              code={`git clone https://github.com/YOUR-USERNAME/project.git
cd project
git remote add upstream https://github.com/owner/project.git`}
            />
          </Section>

          <Section id="branch" step={4} title="Create a branch">
            <p>
              Keep each change on its own branch, so your default branch stays clean and you can work on several things at
              once.
            </p>
            <Card className="p-4">
              <BranchIllustration />
            </Card>
            <CodeBlock
              code={`git fetch upstream
git switch -c fix/typo-in-readme upstream/main`}
            />
            <p className="text-[13px]">Some projects use a different default branch, such as master or develop. Check before branching.</p>
          </Section>

          <Section id="change" step={5} title="Make your changes">
            <p>
              Follow the project’s setup instructions and match its code style. Make small commits, run the tests, then push
              the branch to your fork.
            </p>
            <CodeBlock
              code={`git add README.md
git commit -m "Fix typo in installation steps"
git push -u origin fix/typo-in-readme`}
            />
          </Section>

          <Section id="pr" step={6} title="Open a pull request">
            <p>
              Back on GitHub, choose <strong className="font-medium text-foreground">Compare &amp; pull request</strong>. Say what
              changed and why, link the issue, and add screenshots for visual changes. If reviewers ask for changes, push more
              commits to the same branch and the pull request updates automatically.
            </p>
            <CodeBlock code={`gh pr create --title "Fix typo in installation steps" --body "Fixes #123"`} />
          </Section>

          <Section id="commands" title="Common Git commands">
            <Card className="overflow-x-auto">
              <table className="w-full text-left text-[13px]">
                <caption className="sr-only">Common Git commands and what they do</caption>
                <thead className="border-b text-foreground">
                  <tr>
                    <th scope="col" className="px-3.5 py-2 font-medium">Command</th>
                    <th scope="col" className="px-3.5 py-2 font-medium">What it does</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {COMMANDS.map(([command, purpose]) => (
                    <tr key={command}>
                      <td className="px-3.5 py-2 font-mono whitespace-nowrap text-foreground">{command}</td>
                      <td className="px-3.5 py-2">{purpose}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>
          </Section>

          <Section id="practices" title="Good practices">
            <ul className="grid gap-2.5 sm:grid-cols-2">
              {PRACTICES.map((practice) => (
                <li key={practice} className="flex gap-2">
                  <Check className="mt-0.5 size-4 shrink-0 text-brand" aria-hidden />
                  {practice}
                </li>
              ))}
            </ul>
          </Section>
        </div>

        <nav aria-label="On this page" className="sticky top-20 hidden self-start xl:block">
          <p className="mb-2 text-xs font-medium text-muted-foreground">On this page</p>
          <ul className="space-y-1.5 border-l pl-3 text-[13px]">
            {SECTIONS.map(([id, label]) => (
              <li key={id}>
                <a href={`#${id}`} className="text-muted-foreground hover:text-foreground">
                  {label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </>
  )
}
