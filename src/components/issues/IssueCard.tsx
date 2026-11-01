import { CircleDot, ExternalLink, MessageSquare } from 'lucide-react'
import { Link } from 'react-router-dom'
import { BookmarkButton } from '@/components/common/BookmarkButton'
import { LanguageTag } from '@/components/common/LanguageTag'
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { issueKey, useBookmarks } from '@/context/BookmarksContext'
import { useTheme } from '@/context/ThemeContext'
import { useRepoLanguage } from '@/hooks/useRepoLanguage'
import type { Issue } from '@/types/github'
import { formatRelative, labelStyle } from '@/utils/format'

export function IssueCard({ issue }: { issue: Issue }) {
  const { isSaved, toggleIssue } = useBookmarks()
  const { resolved } = useTheme()
  const { ref, language } = useRepoLanguage(issue.repoFullName, issue.language)

  return (
    <Card className="transition-[border-color,box-shadow] duration-150 hover:border-input hover:shadow-sm">
      <article ref={ref} className="flex gap-3 p-4">
        <CircleDot className="mt-0.5 size-4 shrink-0 text-brand" aria-hidden />
        <div className="min-w-0 flex-1">
          <Link
            to={`/projects/${issue.repoFullName}`}
            className="text-xs font-medium text-muted-foreground hover:text-foreground hover:underline"
          >
            {issue.repoFullName} <span className="font-normal">#{issue.number}</span>
          </Link>
          <h3 className="mt-0.5 text-[15px] leading-snug font-medium tracking-tight">
            <a href={issue.htmlUrl} target="_blank" rel="noreferrer" className="group/title rounded-sm hover:underline hover:underline-offset-2">
              {issue.title}
              <ExternalLink
                className="ml-1.5 inline size-3 align-baseline text-muted-foreground opacity-0 transition-opacity group-hover/title:opacity-100"
                aria-hidden
              />
              <span className="sr-only"> (opens on GitHub in a new tab)</span>
            </a>
          </h3>

          {issue.labels.length > 0 && (
            <ul className="mt-2 flex flex-wrap gap-1" aria-label="Labels">
              {issue.labels.slice(0, 6).map((label) => (
                <li
                  key={label.id}
                  style={labelStyle(label.color, resolved === 'dark')}
                  className="max-w-52 truncate rounded-full border px-2 py-px text-xs font-medium"
                >
                  {label.name}
                </li>
              ))}
              {issue.labels.length > 6 && (
                <li className="px-1 text-xs text-muted-foreground">+{issue.labels.length - 6}</li>
              )}
            </ul>
          )}

          <div className="mt-2.5 flex flex-wrap items-center gap-x-3.5 gap-y-1 text-[13px] text-muted-foreground">
            {language && <LanguageTag language={language} />}
            <span>Opened {formatRelative(issue.createdAt)}</span>
            <span className="inline-flex items-center gap-1 tabular-nums">
              <MessageSquare className="size-3.5" aria-hidden />
              <span className="sr-only">Comments: </span>
              {issue.comments}
            </span>
            {issue.assigned && <span>Assigned</span>}
          </div>
        </div>
        <BookmarkButton
          saved={isSaved(issueKey(issue))}
          label={issue.title}
          onToggle={() => toggleIssue(issue)}
        />
      </article>
    </Card>
  )
}

export function IssueCardSkeleton() {
  return (
    <Card className="flex gap-3 p-4">
      <Skeleton className="size-4 rounded-full" />
      <div className="flex-1">
        <Skeleton className="h-3 w-40" />
        <Skeleton className="mt-2 h-4 w-4/5" />
        <div className="mt-3 flex gap-1.5">
          <Skeleton className="h-5 w-24 rounded-full" />
          <Skeleton className="h-5 w-16 rounded-full" />
        </div>
        <Skeleton className="mt-3 h-3 w-48" />
      </div>
    </Card>
  )
}
