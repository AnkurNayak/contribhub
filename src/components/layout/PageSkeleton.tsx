import { Skeleton } from '@/components/ui/skeleton'

export function PageSkeleton() {
  return (
    <div aria-busy aria-label="Loading page">
      <Skeleton className="h-7 w-52" />
      <Skeleton className="mt-2 h-4 w-80 max-w-full" />
      <div className="mt-8 grid gap-3 md:grid-cols-2">
        {Array.from({ length: 4 }, (_, index) => (
          <Skeleton key={index} className="h-44 rounded-xl" />
        ))}
      </div>
    </div>
  )
}
