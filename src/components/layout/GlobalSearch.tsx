import { Command } from 'cmdk'
import { ArrowRight, CircleDot, Code2, FolderGit2, Loader2, Search } from 'lucide-react'
import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { LanguageTag } from '@/components/common/LanguageTag'
import { ErrorState } from '@/components/common/States'
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog'
import { useDebounce } from '@/hooks/useDebounce'
import { useIssueSearch, useRepoSearch, useRepository } from '@/hooks/useGitHub'
import { LANGUAGES } from '@/utils/constants'
import { formatCount } from '@/utils/format'
import { GitHubError } from '@/services/github'
import { buildIssueTextQuery, buildRepoQuery, parseRepoName } from '@/utils/queryBuilders'

const MIN_LENGTH = 2

function Group({ heading, children }: { heading: string; children: ReactNode }) {
  return (
    <Command.Group
      heading={heading}
      className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:text-muted-foreground"
    >
      {children}
    </Command.Group>
  )
}

function Item({ value, onSelect, children }: { value: string; onSelect: () => void; children: ReactNode }) {
  return (
    <Command.Item
      value={value}
      onSelect={onSelect}
      className="flex cursor-pointer items-center gap-2.5 rounded-md px-2 py-2 text-sm data-[selected=true]:bg-accent"
    >
      {children}
    </Command.Item>
  )
}

export function GlobalSearch() {
  const [open, setOpen] = useState(false)
  const [term, setTerm] = useState('')
  const navigate = useNavigate()
  const debounced = useDebounce(term.trim(), 450)
  const active = open && debounced.length >= MIN_LENGTH

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        setOpen((value) => !value)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  // "owner/repo" is an exact lookup; anything else is a text search.
  const exact = parseRepoName(debounced)
  const exactRepo = useRepository(exact?.owner ?? '', exact?.repo ?? '', active && Boolean(exact))
  const repos = useRepoSearch({
    query: buildRepoQuery({ q: debounced, language: '', topic: '', minStars: 0 }),
    sort: undefined,
    perPage: 5,
    enabled: active && !exact,
  })
  const issues = useIssueSearch({ query: buildIssueTextQuery(debounced), perPage: 5, enabled: active && !exact })

  const languages = useMemo(() => {
    const needle = term.trim().toLowerCase()
    return needle ? LANGUAGES.filter((l) => l.toLowerCase().includes(needle)).slice(0, 4) : []
  }, [term])

  const go = (path: string) => {
    setOpen(false)
    setTerm('')
    navigate(path)
  }

  const repoItems = exact ? (exactRepo.data ? [exactRepo.data] : []) : active ? (repos.data?.items ?? []) : []
  const issueItems = !exact && active ? (issues.data?.items ?? []) : []
  const settled = term.trim() === debounced
  const loading =
    active && settled && (exact ? exactRepo.isFetching : repos.isFetching || issues.isFetching)
  const failure = exact ? exactRepo.error : repos.error
  // An exact name that doesn't exist is just an empty result, not a failure.
  const error =
    active && !loading && failure && !(failure instanceof GitHubError && failure.kind === 'not-found') ? failure : null
  const nothingFound =
    active && settled && !loading && !error && repoItems.length === 0 && issueItems.length === 0 && languages.length === 0

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Search projects, issues and languages"
        className="@container flex h-9 min-w-9 flex-1 items-center gap-2 rounded-md border border-input bg-card px-2.5 text-sm text-muted-foreground shadow-xs transition-colors hover:bg-accent sm:max-w-sm"
      >
        <Search className="size-4 shrink-0" aria-hidden />
        <span className="hidden truncate @[6rem]:block">Search…</span>
        <kbd className="ml-auto hidden rounded border bg-muted px-1.5 py-px font-mono text-[11px] sm:block">Ctrl K</kbd>
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent hideClose aria-describedby={undefined} className="max-w-xl overflow-hidden p-0">
          <DialogTitle className="sr-only">Search ContribHub</DialogTitle>
          <DialogDescription className="sr-only">
            Search GitHub projects, issues, programming languages and repository names.
          </DialogDescription>
          <Command shouldFilter={false} loop label="Search">
            <div className="flex items-center gap-2.5 border-b px-3.5">
              {loading ? (
                <Loader2 className="size-4 shrink-0 animate-spin text-muted-foreground" aria-label="Searching" />
              ) : (
                <Search className="size-4 shrink-0 text-muted-foreground" aria-hidden />
              )}
              <Command.Input
                value={term}
                onValueChange={setTerm}
                placeholder="Search projects, issues, languages, or owner/repo"
                className="h-12 min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
              />
            </div>
            <Command.List className="max-h-[60vh] overflow-y-auto p-1.5">
              {term.trim().length < MIN_LENGTH && languages.length === 0 && (
                <p className="px-3 py-8 text-center text-sm text-muted-foreground">
                  Try “react”, “Rust”, or an exact name like “vercel/next.js”.
                </p>
              )}
              {nothingFound && (
                <p className="px-3 py-8 text-center text-sm text-muted-foreground">
                  No results for “{debounced}”. Check the spelling or try a broader term.
                </p>
              )}
              {error ? (
                <div className="p-2">
                  <ErrorState error={error} onRetry={() => (exact ? exactRepo.refetch() : repos.refetch())} />
                </div>
              ) : null}

              {languages.length > 0 && (
                <Group heading="Languages">
                  {languages.map((language) => (
                    <Item
                      key={language}
                      value={`language-${language}`}
                      onSelect={() => go(`/explore?language=${encodeURIComponent(language)}`)}
                    >
                      <Code2 className="size-4 text-muted-foreground" aria-hidden />
                      <LanguageTag language={language} />
                      <span className="ml-auto text-xs text-muted-foreground">Explore projects</span>
                    </Item>
                  ))}
                </Group>
              )}

              {repoItems.length > 0 && (
                <Group heading="Projects">
                  {repoItems.map((repo) => (
                    <Item key={repo.id} value={`repo-${repo.id}`} onSelect={() => go(`/projects/${repo.fullName}`)}>
                      <FolderGit2 className="size-4 shrink-0 text-muted-foreground" aria-hidden />
                      <span className="truncate font-medium">{repo.fullName}</span>
                      <span className="ml-auto shrink-0 text-xs text-muted-foreground tabular-nums">
                        {formatCount(repo.stars)} ★
                      </span>
                    </Item>
                  ))}
                </Group>
              )}

              {issueItems.length > 0 && (
                <Group heading="Issues">
                  {issueItems.map((issue) => (
                    <Item
                      key={issue.id}
                      value={`issue-${issue.id}`}
                      onSelect={() => {
                        setOpen(false)
                        window.open(issue.htmlUrl, '_blank', 'noopener,noreferrer')
                      }}
                    >
                      <CircleDot className="size-4 shrink-0 text-brand" aria-hidden />
                      <span className="min-w-0 truncate">{issue.title}</span>
                      <span className="ml-auto max-w-36 shrink-0 truncate text-xs text-muted-foreground">
                        {issue.repoFullName}
                      </span>
                    </Item>
                  ))}
                </Group>
              )}

              {term.trim().length >= MIN_LENGTH && (
                <Item value="all-results" onSelect={() => go(`/search?q=${encodeURIComponent(term.trim())}`)}>
                  <ArrowRight className="size-4 text-muted-foreground" aria-hidden />
                  See all results for “{term.trim()}”
                </Item>
              )}
            </Command.List>
          </Command>
        </DialogContent>
      </Dialog>
    </>
  )
}
