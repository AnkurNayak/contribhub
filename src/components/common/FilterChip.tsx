import { Check } from 'lucide-react'
import type { ReactNode } from 'react'
import { cn } from '@/utils/cn'

export function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: ReactNode
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={cn(
        'inline-flex h-8 items-center gap-1.5 rounded-full border px-3 text-[13px] whitespace-nowrap transition-colors',
        active
          ? 'border-brand/40 bg-brand-soft font-medium text-brand-foreground'
          : 'bg-card text-muted-foreground hover:bg-accent hover:text-foreground',
      )}
    >
      {active && <Check className="size-3.5" aria-hidden />}
      {children}
    </button>
  )
}
