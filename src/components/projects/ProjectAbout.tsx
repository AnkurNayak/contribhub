import { Link } from 'react-router-dom'
import { LanguageTag } from '@/components/common/LanguageTag'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import type { Repo } from '@/types/github'
import { formatDate, formatRelative } from '@/utils/format'

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-4 py-2 text-[13px]">
      <dt className="shrink-0 text-muted-foreground">{label}</dt>
      <dd className="min-w-0 truncate text-right">{children}</dd>
    </div>
  )
}

export function ProjectAbout({ repo }: { repo: Repo }) {
  return (
    <aside aria-label="About this project" className="xl:pt-12">
      <Card className="p-4">
        <h2 className="text-sm font-semibold">About</h2>
        <dl className="mt-1 divide-y">
          <Row label="Owner">
            <a href={repo.owner.htmlUrl} target="_blank" rel="noreferrer" className="hover:underline">
              {repo.owner.login}
            </a>
            <span className="text-muted-foreground"> · {repo.owner.type}</span>
          </Row>
          {repo.language && (
            <Row label="Language">
              <LanguageTag language={repo.language} />
            </Row>
          )}
          {repo.license && <Row label="License">{repo.license}</Row>}
          <Row label="Last push">{formatRelative(repo.pushedAt)}</Row>
          <Row label="Created">{formatDate(repo.createdAt)}</Row>
          {repo.homepage && (
            <Row label="Website">
              <a href={repo.homepage} target="_blank" rel="noreferrer" className="hover:underline">
                {repo.homepage.replace(/^https?:\/\//, '').replace(/\/$/, '')}
              </a>
            </Row>
          )}
        </dl>
        {repo.topics.length > 0 && (
          <>
            <h3 className="mt-3 text-sm font-semibold">Topics</h3>
            <ul className="mt-2 flex flex-wrap gap-1">
              {repo.topics.map((topic) => (
                <li key={topic} className="max-w-full">
                  <Link to={`/explore?topic=${encodeURIComponent(topic)}`}>
                    <Badge className="bg-transparent font-normal text-muted-foreground hover:text-foreground">{topic}</Badge>
                  </Link>
                </li>
              ))}
            </ul>
          </>
        )}
      </Card>
    </aside>
  )
}
