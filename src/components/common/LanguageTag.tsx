import { LANGUAGE_COLORS } from '@/utils/constants'

export function LanguageTag({ language }: { language: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span
        aria-hidden
        className="size-2.5 rounded-full ring-1 ring-black/10 dark:ring-white/15"
        style={{ backgroundColor: LANGUAGE_COLORS[language] ?? 'var(--muted-foreground)' }}
      />
      {language}
    </span>
  )
}
