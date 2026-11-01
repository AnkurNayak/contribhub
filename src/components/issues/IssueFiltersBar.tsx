import { X } from 'lucide-react'
import { FilterChip } from '@/components/common/FilterChip'
import { LanguageSelect } from '@/components/common/LanguageSelect'
import { SearchInput } from '@/components/common/SearchInput'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import type { IssueFilters } from '@/types/app'
import { ISSUE_LABELS } from '@/utils/constants'

export function IssueFiltersBar({
  filters,
  onChange,
  onClear,
  canClear,
}: {
  filters: IssueFilters
  onChange: (updates: Record<string, string | null>) => void
  onClear: () => void
  canClear: boolean
}) {
  const toggleLabel = (id: string) => {
    const labels = filters.labels.includes(id) ? filters.labels.filter((label) => label !== id) : [...filters.labels, id]
    onChange({ labels: labels.join(',') })
  }

  return (
    <section aria-label="Filters" className="mb-5 space-y-3">
      <div className="flex flex-wrap items-center gap-1.5" role="group" aria-label="Labels">
        {ISSUE_LABELS.map((label) => (
          <FilterChip key={label.id} active={filters.labels.includes(label.id)} onClick={() => toggleLabel(label.id)}>
            {label.name}
          </FilterChip>
        ))}
        <span className="mx-1 hidden h-5 w-px bg-border sm:block" aria-hidden />
        <FilterChip active={filters.recentOnly} onClick={() => onChange({ recent: filters.recentOnly ? null : '1' })}>
          Updated this week
        </FilterChip>
        <FilterChip active={filters.unassigned} onClick={() => onChange({ unassigned: filters.unassigned ? null : '1' })}>
          Unassigned
        </FilterChip>
        {canClear && (
          <Button variant="ghost" size="sm" onClick={onClear} className="text-muted-foreground">
            <X /> Reset
          </Button>
        )}
      </div>
      <div className="flex flex-col gap-2 lg:flex-row">
        <SearchInput
          label="Search issue text"
          placeholder="Search issue titles and descriptions"
          value={filters.q}
          onChange={(q) => onChange({ q: q || null })}
        />
        <div className="lg:w-56">
          <SearchInput
            label="Filter by repository"
            placeholder="owner/repository"
            delay={800}
            value={filters.repo}
            onChange={(repo) => onChange({ repo: repo || null })}
          />
        </div>
        <div className="grid grid-cols-2 gap-2 sm:flex">
          <LanguageSelect value={filters.language} onChange={(language) => onChange({ language: language || null })} />
          <Select value={filters.sort} onValueChange={(sort) => onChange({ sort })}>
            <SelectTrigger aria-label="Sort by" className="sm:w-44">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="updated">Recently updated</SelectItem>
              <SelectItem value="created">Newest</SelectItem>
              <SelectItem value="comments">Most discussed</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </section>
  )
}
