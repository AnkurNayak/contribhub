import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import type { Bookmark, BookmarkStore, Collection } from '@/types/app'
import type { Issue, Repo } from '@/types/github'
import { readJson, STORAGE_KEYS, writeJson } from '@/utils/storage'

const EMPTY: BookmarkStore = { bookmarks: [], collections: [] }

export const repoKey = (repo: Pick<Repo, 'id'>) => `repo:${repo.id}`
export const issueKey = (issue: Pick<Issue, 'id'>) => `issue:${issue.id}`

interface BookmarksValue extends BookmarkStore {
  isSaved: (key: string) => boolean
  toggleRepo: (repo: Repo) => void
  toggleIssue: (issue: Issue) => void
  remove: (key: string) => void
  moveTo: (key: string, collectionId: string | null) => void
  createCollection: (name: string) => Collection
  renameCollection: (id: string, name: string) => void
  deleteCollection: (id: string) => void
  /** Merges a backup, keeping existing entries when keys collide. Returns items added. */
  importStore: (store: BookmarkStore) => number
  clear: () => void
}

const BookmarksContext = createContext<BookmarksValue | null>(null)

function isStore(value: unknown): value is BookmarkStore {
  const store = value as BookmarkStore | null
  return Boolean(store) && Array.isArray(store?.bookmarks) && Array.isArray(store?.collections)
}

function isValidBookmark(item: Bookmark): boolean {
  return (
    typeof item?.key === 'string' &&
    ((item.kind === 'repo' && Boolean(item.repo?.fullName)) ||
      (item.kind === 'issue' && Boolean(item.issue?.htmlUrl)))
  )
}

function load(): BookmarkStore {
  const stored = readJson<unknown>(STORAGE_KEYS.bookmarks, EMPTY)
  return isStore(stored) ? stored : EMPTY
}

export function BookmarksProvider({ children }: { children: ReactNode }) {
  const [store, setStore] = useState<BookmarkStore>(load)

  useEffect(() => {
    writeJson(STORAGE_KEYS.bookmarks, store)
  }, [store])

  // Keep multiple open tabs in step.
  useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (event.key === STORAGE_KEYS.bookmarks) setStore(load())
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  const value = useMemo<BookmarksValue>(() => {
    const saved = new Set(store.bookmarks.map((b) => b.key))

    const toggle = (entry: Bookmark) =>
      setStore((current) =>
        current.bookmarks.some((b) => b.key === entry.key)
          ? { ...current, bookmarks: current.bookmarks.filter((b) => b.key !== entry.key) }
          : { ...current, bookmarks: [entry, ...current.bookmarks] },
      )

    return {
      ...store,
      isSaved: (key) => saved.has(key),
      toggleRepo: (repo) =>
        toggle({
          kind: 'repo',
          key: repoKey(repo),
          repo,
          savedAt: new Date().toISOString(),
          collectionId: null,
        }),
      toggleIssue: (issue) =>
        toggle({
          kind: 'issue',
          key: issueKey(issue),
          issue,
          savedAt: new Date().toISOString(),
          collectionId: null,
        }),
      remove: (key) =>
        setStore((current) => ({
          ...current,
          bookmarks: current.bookmarks.filter((b) => b.key !== key),
        })),
      moveTo: (key, collectionId) =>
        setStore((current) => ({
          ...current,
          bookmarks: current.bookmarks.map((b) => (b.key === key ? { ...b, collectionId } : b)),
        })),
      createCollection: (name) => {
        const collection = { id: crypto.randomUUID(), name: name.trim() }
        setStore((current) => ({ ...current, collections: [...current.collections, collection] }))
        return collection
      },
      renameCollection: (id, name) =>
        setStore((current) => ({
          ...current,
          collections: current.collections.map((c) => (c.id === id ? { ...c, name: name.trim() } : c)),
        })),
      deleteCollection: (id) =>
        setStore((current) => ({
          collections: current.collections.filter((c) => c.id !== id),
          // Bookmarks survive their collection and fall back to "unfiled".
          bookmarks: current.bookmarks.map((b) => (b.collectionId === id ? { ...b, collectionId: null } : b)),
        })),
      importStore: (incoming) => {
        if (!isStore(incoming)) throw new Error('Not a ContribHub bookmarks file.')
        const fresh = incoming.bookmarks.filter(isValidBookmark).filter((b) => !saved.has(b.key))
        setStore((current) => ({
          bookmarks: [...fresh, ...current.bookmarks],
          collections: [
            ...current.collections,
            ...incoming.collections.filter(
              (c) => c?.id && c?.name && !current.collections.some((own) => own.id === c.id),
            ),
          ],
        }))
        return fresh.length
      },
      clear: () => setStore(EMPTY),
    }
  }, [store])

  return <BookmarksContext.Provider value={value}>{children}</BookmarksContext.Provider>
}

export function useBookmarks() {
  const value = useContext(BookmarksContext)
  if (!value) throw new Error('useBookmarks must be used inside BookmarksProvider')
  return value
}
