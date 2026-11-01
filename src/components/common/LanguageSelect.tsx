import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { LANGUAGES } from '@/utils/constants'
import { cn } from '@/utils/cn'

const ANY = 'any'

export function LanguageSelect({
  value,
  onChange,
  className,
}: {
  value: string
  onChange: (value: string) => void
  className?: string
}) {
  // Keep a language that arrived via URL/search selectable, even if not in our list.
  const options = value && !LANGUAGES.includes(value) ? [value, ...LANGUAGES] : LANGUAGES
  return (
    <Select value={value || ANY} onValueChange={(next) => onChange(next === ANY ? '' : next)}>
      <SelectTrigger aria-label="Programming language" className={cn('sm:w-44', className)}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value={ANY}>All languages</SelectItem>
        {options.map((language) => (
          <SelectItem key={language} value={language}>
            {language}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
