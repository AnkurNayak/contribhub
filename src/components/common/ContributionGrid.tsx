import { cn } from '@/utils/cn'

/** Deterministic decorative pattern; it is not anyone's real activity. */
function level(week: number, day: number): number {
  const wave = Math.sin(week * 0.55 + day * 0.9) + Math.sin(week * 0.17 - day * 0.4)
  const noise = ((week * 7 + day * 13) % 5) / 5
  return Math.max(0, Math.min(4, Math.round(wave + noise * 2 + week / 26 - 0.6)))
}

export function ContributionGrid({ weeks = 30, className }: { weeks?: number; className?: string }) {
  return (
    <div aria-hidden className={cn('flex gap-[3px]', className)}>
      {Array.from({ length: weeks }, (_, week) => (
        <div key={week} className="flex flex-col gap-[3px]">
          {Array.from({ length: 7 }, (_, day) => (
            <span
              key={day}
              className="size-[9px] rounded-[2px]"
              style={{ backgroundColor: `var(--cell-${level(week, day)})` }}
            />
          ))}
        </div>
      ))}
    </div>
  )
}
