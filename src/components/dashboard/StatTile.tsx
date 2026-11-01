import type { LucideIcon } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

export function StatTile({
  label,
  value,
  note,
  icon: Icon,
  loading,
}: {
  label: string
  value: string
  note: string
  icon: LucideIcon
  loading?: boolean
}) {
  return (
    <Card className="p-4">
      <div className="flex items-center justify-between gap-2 text-[13px] text-muted-foreground">
        <span>{label}</span>
        <Icon className="size-4 shrink-0" aria-hidden />
      </div>
      {loading ? (
        <Skeleton className="mt-2 h-8 w-20" />
      ) : (
        <p className="mt-1.5 text-[1.75rem] leading-9 font-semibold tracking-tight tabular-nums">{value}</p>
      )}
      <p className="mt-1 text-xs text-muted-foreground">{note}</p>
    </Card>
  )
}
