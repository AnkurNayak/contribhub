import { X } from 'lucide-react'
import { FilterChip } from '@/components/common/FilterChip'
import { LanguageSelect } from '@/components/common/LanguageSelect'
import { SearchInput } from '@/components/common/SearchInput'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import type { RepoFilters } from '@/types/app'
import { POPULAR_TOPICS, STAR_OPTIONS } from '@/utils/constants'

export function ProjectFilters({
  filters,
  onChange,
  onClear,
  canClear,
}: {
  filters: RepoFilters
  onChange: (updates: Record<string, string | null>) => void
  onClear: () => void
  canClear: boolean
}) {
  // A topic reached from a card or link stays visible even if it isn't a preset.
  const topics =
    filters.topic && !POPULAR_TOPICS.includes(filters.topic) ? [filters.topic, ...POPULAR_TOPICS] : POPULAR_TOPICS

  return (
    <section aria-label="Filters" className="mb-5 space-y-3">
      <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
        <SearchInput
          label="Search repositories"
          placeholder="Search repositories by name or description"
          value={filters.q}
          onChange={(q) => onChange({ q: q || null })}
        />
        <div className="grid grid-cols-2 gap-2 sm:flex">
          <LanguageSelect value={filters.language} onChange={(language) => onChange({ language: language || null })} />
          <Select value={String(filters.minStars)} onValueChange={(stars) => onChange({ stars })}>
            <SelectTrigger aria-label="Minimum stars" className="sm:w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {STAR_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={String(option.value)}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={filters.sort} onValueChange={(sort) => onChange({ sort })}>
            <SelectTrigger aria-label="Sort by" className="col-span-2 sm:w-44">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="stars">Most stars</SelectItem>
              <SelectItem value="updated">Recently updated</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 [scrollbar-width:none]" role="group" aria-label="Topics">
        {topics.map((topic) => (
          <FilterChip
            key={topic}
            active={filters.topic === topic}
            onClick={() => onChange({ topic: filters.topic === topic ? null : topic })}
          >
            {topic}
          </FilterChip>
        ))}
        {canClear && (
          <Button variant="ghost" size="sm" onClick={onClear} className="ml-1 text-muted-foreground">
            <X /> Clear
          </Button>
        )}
      </div>
    </section>
  )
}
