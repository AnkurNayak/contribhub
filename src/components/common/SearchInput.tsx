import { Search, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Input } from '@/components/ui/input'
import { useDebounce } from '@/hooks/useDebounce'

/** Text box that reports its value after a pause, keeping API calls to a minimum. */
export function SearchInput({
  value,
  onChange,
  placeholder,
  label,
  delay = 500,
}: {
  value: string
  onChange: (value: string) => void
  placeholder: string
  label: string
  delay?: number
}) {
  const [draft, setDraft] = useState(value)
  const debounced = useDebounce(draft, delay)

  // Follow external changes such as "Clear filters" or browser navigation.
  useEffect(() => setDraft(value), [value])

  useEffect(() => {
    if (debounced !== value && debounced === draft) onChange(debounced)
    // Only a settled draft should trigger a change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debounced])

  return (
    <div className="relative min-w-0 flex-1">
      <Search className="pointer-events-none absolute top-2.5 left-3 size-4 text-muted-foreground" aria-hidden />
      <Input
        type="search"
        aria-label={label}
        placeholder={placeholder}
        value={draft}
        onChange={(event) => setDraft(event.target.value)}
        className="px-9 [&::-webkit-search-cancel-button]:hidden"
      />
      {draft && (
        <button
          type="button"
          aria-label="Clear search"
          onClick={() => {
            setDraft('')
            onChange('')
          }}
          className="absolute top-1.5 right-1.5 rounded-md p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground"
        >
          <X className="size-3.5" />
        </button>
      )}
    </div>
  )
}
