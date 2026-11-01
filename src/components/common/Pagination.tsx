import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { SEARCH_RESULT_CAP } from '@/utils/constants'

export function Pagination({
  page,
  perPage,
  totalCount,
  onPageChange,
}: {
  page: number
  perPage: number
  totalCount: number
  onPageChange: (page: number) => void
}) {
  const reachable = Math.min(totalCount, SEARCH_RESULT_CAP)
  const totalPages = Math.max(1, Math.ceil(reachable / perPage))
  if (totalPages <= 1) return null

  return (
    <nav aria-label="Pagination" className="mt-6 flex items-center justify-between gap-3">
      <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => onPageChange(page - 1)}>
        <ChevronLeft /> Previous
      </Button>
      <p className="text-center text-[13px] text-muted-foreground" aria-live="polite">
        Page {page} of {totalPages}
        {totalCount > SEARCH_RESULT_CAP && <span className="hidden sm:inline"> · GitHub shows the first 1,000</span>}
      </p>
      <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => onPageChange(page + 1)}>
        Next <ChevronRight />
      </Button>
    </nav>
  )
}
