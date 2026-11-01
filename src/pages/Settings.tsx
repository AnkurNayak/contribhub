import { useQueryClient } from '@tanstack/react-query'
import { Download, Eye, EyeOff, Monitor, Moon, RefreshCw, Sun, Trash2, Upload } from 'lucide-react'
import { useEffect, useRef, useState, type ChangeEvent, type FormEvent, type ReactNode } from 'react'
import { useLocation } from 'react-router-dom'
import { FilterChip } from '@/components/common/FilterChip'
import { PageHeader } from '@/components/common/PageHeader'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useBookmarks } from '@/context/BookmarksContext'
import { usePreferences } from '@/context/PreferencesContext'
import { useTheme } from '@/context/ThemeContext'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { useRateLimits, useViewer } from '@/hooks/useGitHub'
import { clearResponseCache, refreshRateLimit } from '@/services/github'
import { rateLimitStore } from '@/services/rateLimit'
import type { Theme } from '@/types/app'
import type { RateBucket } from '@/types/github'
import { cn } from '@/utils/cn'
import { LANGUAGES, PER_PAGE_OPTIONS } from '@/utils/constants'

function Panel({ id, title, description, children }: { id?: string; title: string; description: ReactNode; children: ReactNode }) {
  return (
    <Card id={id} className="scroll-mt-20 p-5">
      <h2 className="text-[15px] font-semibold tracking-tight">{title}</h2>
      <p className="mt-0.5 text-sm text-muted-foreground">{description}</p>
      <div className="mt-4">{children}</div>
    </Card>
  )
}

function RateMeter({ name, bucket }: { name: string; bucket?: RateBucket }) {
  const share = bucket && bucket.limit > 0 ? (bucket.remaining / bucket.limit) * 100 : 0
  return (
    <div>
      <div className="flex justify-between gap-2 text-[13px]">
        <span>{name}</span>
        <span className="text-muted-foreground tabular-nums">
          {bucket ? `${bucket.remaining.toLocaleString('en')} of ${bucket.limit.toLocaleString('en')} left` : 'Unknown'}
        </span>
      </div>
      <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-muted">
        <div className="h-full rounded-full bg-brand transition-[width]" style={{ width: `${share}%` }} />
      </div>
      {bucket && (
        <p className="mt-1 text-xs text-muted-foreground">
          Resets at {new Date(bucket.resetAt).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
        </p>
      )}
    </div>
  )
}

const THEMES: { id: Theme; label: string; icon: typeof Sun }[] = [
  { id: 'light', label: 'Light', icon: Sun },
  { id: 'dark', label: 'Dark', icon: Moon },
  { id: 'system', label: 'System', icon: Monitor },
]

export default function Settings() {
  useDocumentTitle('Settings')
  const { theme, setTheme } = useTheme()
  const { preferences, update } = usePreferences()
  const bookmarks = useBookmarks()
  const limits = useRateLimits()
  const viewer = useViewer()
  const queryClient = useQueryClient()
  const { hash } = useLocation()

  const [tokenDraft, setTokenDraft] = useState(preferences.token)
  const [showToken, setShowToken] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [dataMessage, setDataMessage] = useState('')
  const [confirmClear, setConfirmClear] = useState(false)
  const fileInput = useRef<HTMLInputElement>(null)

  const refreshLimits = async () => {
    setRefreshing(true)
    try {
      await refreshRateLimit()
    } catch {
      // The meters keep their last known values; a bad token is reported via useViewer.
    } finally {
      setRefreshing(false)
    }
  }

  useEffect(() => {
    void refreshLimits()
    // Runs once on open, and the /rate_limit endpoint is free.
  }, [])

  useEffect(() => {
    if (hash) document.getElementById(hash.slice(1))?.scrollIntoView()
  }, [hash])

  const applyToken = (token: string) => {
    update({ token })
    clearResponseCache()
    rateLimitStore.reset()
    queryClient.invalidateQueries()
    void refreshLimits()
  }

  const submitToken = (event: FormEvent) => {
    event.preventDefault()
    applyToken(tokenDraft.trim())
  }

  const toggleLanguage = (language: string) => {
    update({
      languages: preferences.languages.includes(language)
        ? preferences.languages.filter((item) => item !== language)
        : [...preferences.languages, language],
    })
  }

  const exportBookmarks = () => {
    const payload = JSON.stringify({ bookmarks: bookmarks.bookmarks, collections: bookmarks.collections }, null, 2)
    const url = URL.createObjectURL(new Blob([payload], { type: 'application/json' }))
    const link = document.createElement('a')
    link.href = url
    link.download = 'contribhub-bookmarks.json'
    link.click()
    URL.revokeObjectURL(url)
    setDataMessage(`Exported ${bookmarks.bookmarks.length} bookmarks.`)
  }

  const importBookmarks = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return
    try {
      const added = bookmarks.importStore(JSON.parse(await file.text()))
      setDataMessage(`Imported ${added} new ${added === 1 ? 'bookmark' : 'bookmarks'}.`)
    } catch {
      setDataMessage('That file isn’t a valid ContribHub bookmarks export.')
    }
  }

  const tokenChanged = tokenDraft.trim() !== preferences.token

  return (
    <div className="max-w-3xl">
      <PageHeader title="Settings" description="Everything here is stored only in this browser." />

      <div className="space-y-4">
        <Panel title="Appearance" description="Choose a theme, or follow your system setting.">
          <div role="radiogroup" aria-label="Theme" className="inline-flex rounded-lg border bg-muted p-0.5">
            {THEMES.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                type="button"
                role="radio"
                aria-checked={theme === id}
                onClick={() => setTheme(id)}
                className={cn(
                  'flex items-center gap-1.5 rounded-md px-3 py-1 text-sm transition-colors',
                  theme === id ? 'bg-card font-medium shadow-xs' : 'text-muted-foreground hover:text-foreground',
                )}
              >
                <Icon className="size-3.5" aria-hidden /> {label}
              </button>
            ))}
          </div>
        </Panel>

        <Panel
          id="api-access"
          title="GitHub API access"
          description="ContribHub works without an account. Anonymous use is limited to 10 searches a minute and 60 other requests an hour; an optional free token raises this to 30 and 5,000."
        >
          <form onSubmit={submitToken} className="flex flex-col gap-2 sm:flex-row">
            <div className="relative flex-1">
              <Input
                type={showToken ? 'text' : 'password'}
                value={tokenDraft}
                onChange={(event) => setTokenDraft(event.target.value)}
                aria-label="GitHub personal access token"
                placeholder="github_pat_…"
                autoComplete="off"
                spellCheck={false}
                className="pr-10 font-mono"
              />
              <button
                type="button"
                onClick={() => setShowToken((value) => !value)}
                aria-label={showToken ? 'Hide token' : 'Show token'}
                className="absolute top-1.5 right-1.5 rounded-md p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground"
              >
                {showToken ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
              </button>
            </div>
            <Button type="submit" disabled={!tokenChanged}>
              Save token
            </Button>
            {preferences.token && (
              <Button
                variant="outline"
                onClick={() => {
                  setTokenDraft('')
                  applyToken('')
                }}
              >
                Remove
              </Button>
            )}
          </form>

          <p className="mt-2 text-[13px]" role="status">
            {viewer.data && <span>Connected as <strong className="font-medium">{viewer.data.login}</strong>.</span>}
            {viewer.error && <span className="text-destructive">{(viewer.error as Error).message}</span>}
          </p>
          <p className="mt-1 text-[13px] text-muted-foreground">
            <a
              href="https://github.com/settings/personal-access-tokens/new"
              target="_blank"
              rel="noreferrer"
              className="font-medium text-foreground underline underline-offset-2"
            >
              Create a fine-grained token
            </a>{' '}
            with public-repository read-only access and no extra permissions. It’s kept in this browser’s local storage and
            sent only to api.github.com, so avoid saving one on a shared computer.
          </p>

          <div className="mt-5 grid gap-4 border-t pt-4 sm:grid-cols-2">
            <RateMeter name="Search requests" bucket={limits.search} />
            <RateMeter name="Other requests" bucket={limits.core} />
          </div>
          <Button variant="ghost" size="sm" className="mt-2 -ml-2.5" onClick={refreshLimits} disabled={refreshing}>
            <RefreshCw className={cn(refreshing && 'animate-spin')} aria-hidden /> Refresh limits
          </Button>
        </Panel>

        <Panel
          id="languages"
          title="Preferred languages"
          description="Overview shows good first issues for these languages first."
        >
          <div className="flex flex-wrap gap-1.5" role="group" aria-label="Preferred languages">
            {LANGUAGES.map((language) => (
              <FilterChip
                key={language}
                active={preferences.languages.includes(language)}
                onClick={() => toggleLanguage(language)}
              >
                {language}
              </FilterChip>
            ))}
          </div>
        </Panel>

        <Panel title="Results per page" description="More results use the same number of API requests, but load a little slower.">
          <Select value={String(preferences.perPage)} onValueChange={(value) => update({ perPage: Number(value) })}>
            <SelectTrigger aria-label="Results per page" className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PER_PAGE_OPTIONS.map((option) => (
                <SelectItem key={option} value={String(option)}>
                  {option} results
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Panel>

        <Panel
          title="Your data"
          description={`${bookmarks.bookmarks.length} bookmarks in ${bookmarks.collections.length} collections. Export a backup or move them to another browser.`}
        >
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={exportBookmarks} disabled={bookmarks.bookmarks.length === 0}>
              <Download aria-hidden /> Export
            </Button>
            <Button variant="outline" onClick={() => fileInput.current?.click()}>
              <Upload aria-hidden /> Import
            </Button>
            <input
              ref={fileInput}
              type="file"
              accept="application/json,.json"
              className="sr-only"
              tabIndex={-1}
              aria-label="Import bookmarks file"
              onChange={importBookmarks}
            />
            <Button variant="destructive" onClick={() => setConfirmClear(true)} disabled={bookmarks.bookmarks.length === 0 && bookmarks.collections.length === 0}>
              <Trash2 aria-hidden /> Delete all bookmarks
            </Button>
          </div>
          {dataMessage && (
            <p role="status" className="mt-2 text-[13px] text-muted-foreground">
              {dataMessage}
            </p>
          )}
        </Panel>
      </div>

      <Dialog open={confirmClear} onOpenChange={setConfirmClear}>
        <DialogContent>
          <DialogTitle className="text-base font-semibold">Delete all bookmarks?</DialogTitle>
          <DialogDescription className="mt-1 text-sm text-muted-foreground">
            This removes {bookmarks.bookmarks.length} bookmarks and {bookmarks.collections.length} collections from this
            browser. It can’t be undone unless you have an export.
          </DialogDescription>
          <div className="mt-5 flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setConfirmClear(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                bookmarks.clear()
                setConfirmClear(false)
                setDataMessage('All bookmarks deleted.')
              }}
            >
              Delete everything
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
