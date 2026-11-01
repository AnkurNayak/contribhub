import { Bookmark } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/utils/cn'

export function BookmarkButton({
  saved,
  label,
  onToggle,
  withText,
}: {
  saved: boolean
  label: string
  onToggle: () => void
  withText?: boolean
}) {
  return (
    <Button
      variant={withText ? 'outline' : 'ghost'}
      size={withText ? 'default' : 'icon-sm'}
      aria-pressed={saved}
      aria-label={`${saved ? 'Remove bookmark for' : 'Bookmark'} ${label}`}
      onClick={onToggle}
      className={cn(!withText && 'text-muted-foreground', saved && 'text-brand-foreground')}
    >
      <Bookmark className={cn(saved && 'fill-current')} aria-hidden />
      {withText && (saved ? 'Saved' : 'Save')}
    </Button>
  )
}
