import { Link } from 'react-router-dom'
import { cn } from '@/utils/cn'

/** A tiny contribution graph: the 9 cells use the brand scale. */
const CELLS = [2, 0, 4, 4, 2, 0, 0, 4, 2]

export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 17 17" aria-hidden className={cn('size-[18px]', className)}>
      {CELLS.map((level, index) => (
        <rect
          key={index}
          x={(index % 3) * 6}
          y={Math.floor(index / 3) * 6}
          width="5"
          height="5"
          rx="1.2"
          fill={`var(--cell-${level})`}
        />
      ))}
    </svg>
  )
}

export function Logo({ className }: { className?: string }) {
  return (
    <Link
      to="/"
      aria-label="ContribHub home"
      className={cn('flex items-center gap-2 rounded-md text-[15px] font-semibold tracking-tight', className)}
    >
      <LogoMark />
      ContribHub
    </Link>
  )
}
