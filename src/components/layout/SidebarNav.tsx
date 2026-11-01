import { NavLink } from 'react-router-dom'
import { useBookmarks } from '@/context/BookmarksContext'
import { cn } from '@/utils/cn'
import { NAV_ITEMS } from './navigation'

export function SidebarNav({ onNavigate }: { onNavigate?: () => void }) {
  const { bookmarks } = useBookmarks()

  return (
    <nav aria-label="Main" className="space-y-0.5 p-3">
      {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
        <NavLink
          key={to}
          to={to}
          onClick={onNavigate}
          className={({ isActive }) =>
            cn(
              'flex items-center gap-2.5 rounded-md px-2.5 py-1.5 text-sm transition-colors',
              isActive
                ? 'bg-accent font-medium text-foreground'
                : 'text-muted-foreground hover:bg-accent/60 hover:text-foreground',
            )
          }
        >
          <Icon className="size-4 shrink-0" aria-hidden />
          <span className="flex-1 truncate">{label}</span>
          {to === '/bookmarks' && bookmarks.length > 0 && (
            <span className="text-xs text-muted-foreground tabular-nums">{bookmarks.length}</span>
          )}
        </NavLink>
      ))}
    </nav>
  )
}
