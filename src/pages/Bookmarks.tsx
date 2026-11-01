import { Bookmark as BookmarkIcon, FolderInput, FolderPlus, MoreHorizontal, Pencil, Trash2 } from 'lucide-react'
import { useMemo, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { FilterChip } from '@/components/common/FilterChip'
import { PageHeader } from '@/components/common/PageHeader'
import { SearchInput } from '@/components/common/SearchInput'
import { EmptyState } from '@/components/common/States'
import { IssueCard } from '@/components/issues/IssueCard'
import { RepoCard } from '@/components/projects/RepoCard'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { useBookmarks } from '@/context/BookmarksContext'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { useUrlParams } from '@/hooks/useUrlParams'
import type { Bookmark, Collection } from '@/types/app'
import { cn } from '@/utils/cn'
import { formatRelative } from '@/utils/format'

const ALL = 'all'
const UNFILED = 'unfiled'

function searchableText(item: Bookmark): string {
  const parts =
    item.kind === 'repo'
      ? [item.repo.fullName, item.repo.description, item.repo.language, ...item.repo.topics]
      : [item.issue.title, item.issue.repoFullName, ...item.issue.labels.map((label) => label.name)]
  return parts.filter(Boolean).join(' ').toLowerCase()
}

function CollectionDialog({
  editing,
  open,
  onOpenChange,
  onSubmit,
}: {
  editing: Collection | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (name: string) => void
}) {
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const name = String(new FormData(event.currentTarget).get('name') ?? '').trim()
    if (!name) return
    onSubmit(name)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogTitle className="text-base font-semibold">{editing ? 'Rename collection' : 'New collection'}</DialogTitle>
        <DialogDescription className="mt-1 text-sm text-muted-foreground">
          Collections group saved projects and issues in this browser.
        </DialogDescription>
        <form onSubmit={submit} className="mt-4 space-y-4">
          <Input
            name="name"
            aria-label="Collection name"
            placeholder="e.g. Weekend projects"
            defaultValue={editing?.name}
            maxLength={40}
            required
            autoFocus
          />
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">{editing ? 'Save' : 'Create'}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function SavedItem({ item }: { item: Bookmark }) {
  const { collections, moveTo } = useBookmarks()
  const current = collections.find((collection) => collection.id === item.collectionId)

  return (
    <li className="flex min-w-0 flex-col">
      <div className="mb-1.5 flex h-7 items-center justify-between gap-2 px-1 text-xs text-muted-foreground">
        <span className="truncate">Saved {formatRelative(item.savedAt)}</span>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-7 max-w-44 text-xs text-muted-foreground">
              <FolderInput aria-hidden className="!size-3.5" />
              <span className="truncate">{current?.name ?? 'Add to collection'}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Move to</DropdownMenuLabel>
            {collections.map((collection) => (
              <DropdownMenuItem key={collection.id} onSelect={() => moveTo(item.key, collection.id)}>
                {collection.name}
              </DropdownMenuItem>
            ))}
            {collections.length === 0 && (
              <DropdownMenuItem disabled>Create a collection first</DropdownMenuItem>
            )}
            {current && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem onSelect={() => moveTo(item.key, null)}>Remove from collection</DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      {item.kind === 'repo' ? <RepoCard repo={item.repo} /> : <IssueCard issue={item.issue} />}
    </li>
  )
}

export default function Bookmarks() {
  useDocumentTitle('My Bookmarks')
  const { bookmarks, collections, createCollection, renameCollection, deleteCollection } = useBookmarks()
  const { params, setParam } = useUrlParams()
  const [term, setTerm] = useState('')
  const [kind, setKind] = useState<'all' | 'repo' | 'issue'>('all')
  const [dialog, setDialog] = useState<{ open: boolean; editing: Collection | null }>({ open: false, editing: null })

  const requested = params.get('collection') ?? ALL
  const selected = requested === UNFILED || collections.some((c) => c.id === requested) ? requested : ALL

  const counts = useMemo(() => {
    const map = new Map<string, number>()
    bookmarks.forEach((b) => {
      const key = b.collectionId ?? UNFILED
      map.set(key, (map.get(key) ?? 0) + 1)
    })
    return map
  }, [bookmarks])

  const visible = useMemo(() => {
    const needle = term.trim().toLowerCase()
    return bookmarks.filter(
      (item) =>
        (kind === 'all' || item.kind === kind) &&
        (selected === ALL || (item.collectionId ?? UNFILED) === selected) &&
        (!needle || searchableText(item).includes(needle)),
    )
  }, [bookmarks, kind, selected, term])

  const navItem = (id: string, label: string, count: number) => (
    <button
      type="button"
      aria-current={selected === id ? 'true' : undefined}
      onClick={() => setParam({ collection: id === ALL ? null : id })}
      className={cn(
        'flex min-w-0 flex-1 items-center gap-2 rounded-md px-2.5 py-1.5 text-left text-sm whitespace-nowrap transition-colors',
        selected === id ? 'bg-accent font-medium' : 'text-muted-foreground hover:bg-accent/60 hover:text-foreground',
      )}
    >
      <span className="truncate">{label}</span>
      <span className="ml-auto pl-2 text-xs text-muted-foreground tabular-nums">{count}</span>
    </button>
  )

  const saved = (
    <EmptyState
      icon={BookmarkIcon}
      title="No bookmarks yet"
      description="Save projects and issues with the bookmark icon. They stay in this browser, no account needed."
    >
      <Button variant="outline" size="sm" asChild>
        <Link to="/explore">Explore projects</Link>
      </Button>
      <Button variant="outline" size="sm" asChild>
        <Link to="/issues">Find issues</Link>
      </Button>
    </EmptyState>
  )

  return (
    <>
      <PageHeader
        title="My Bookmarks"
        description="Everything you’ve saved, stored only in this browser."
        actions={
          <Button variant="outline" onClick={() => setDialog({ open: true, editing: null })}>
            <FolderPlus aria-hidden /> New collection
          </Button>
        }
      />

      <div className="grid gap-6 lg:grid-cols-[220px_minmax(0,1fr)]">
        <nav aria-label="Collections" className="flex gap-0.5 overflow-x-auto lg:block lg:space-y-0.5 lg:overflow-visible">
          <div className="flex shrink-0">{navItem(ALL, 'All bookmarks', bookmarks.length)}</div>
          <div className="flex shrink-0">{navItem(UNFILED, 'Unfiled', counts.get(UNFILED) ?? 0)}</div>
          {collections.map((collection) => (
            <div key={collection.id} className="flex shrink-0 items-center gap-0.5">
              {navItem(collection.id, collection.name, counts.get(collection.id) ?? 0)}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    className="size-7 text-muted-foreground"
                    aria-label={`Options for ${collection.name}`}
                  >
                    <MoreHorizontal aria-hidden />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                  <DropdownMenuItem onSelect={() => setDialog({ open: true, editing: collection })}>
                    <Pencil /> Rename
                  </DropdownMenuItem>
                  <DropdownMenuItem onSelect={() => deleteCollection(collection.id)}>
                    <Trash2 /> Delete, keep items
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ))}
        </nav>

        <section aria-label="Saved items" className="min-w-0">
          {bookmarks.length === 0 ? (
            saved
          ) : (
            <>
              <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center">
                <SearchInput
                  label="Search saved items"
                  placeholder="Search saved items"
                  value={term}
                  delay={120}
                  onChange={setTerm}
                />
                <div className="flex gap-1.5" role="group" aria-label="Type">
                  {(
                    [
                      ['all', 'All'],
                      ['repo', 'Projects'],
                      ['issue', 'Issues'],
                    ] as const
                  ).map(([id, label]) => (
                    <FilterChip key={id} active={kind === id} onClick={() => setKind(id)}>
                      {label}
                    </FilterChip>
                  ))}
                </div>
              </div>
              {visible.length === 0 ? (
                <EmptyState title="Nothing here matches" description="Try another collection, type or search term." />
              ) : (
                <ul className="grid gap-x-3 gap-y-4 2xl:grid-cols-2">
                  {visible.map((item) => (
                    <SavedItem key={item.key} item={item} />
                  ))}
                </ul>
              )}
            </>
          )}
        </section>
      </div>

      <CollectionDialog
        key={dialog.editing?.id ?? 'new'}
        open={dialog.open}
        editing={dialog.editing}
        onOpenChange={(open) => setDialog((current) => ({ ...current, open }))}
        onSubmit={(name) => {
          if (dialog.editing) renameCollection(dialog.editing.id, name)
          else createCollection(name)
        }}
      />
    </>
  )
}
