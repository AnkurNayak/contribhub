import type { ComponentProps } from 'react'
import { cn } from '@/utils/cn'

export function Card({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div
      className={cn('rounded-xl border bg-card text-card-foreground shadow-[0_1px_2px_rgb(0_0_0/0.03)]', className)}
      {...props}
    />
  )
}
