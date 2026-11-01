import { Bookmark, KeyRound, Settings, UserRound } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useViewer } from '@/hooks/useGitHub'

export function UserMenu() {
  const { data: viewer } = useViewer()
  const navigate = useNavigate()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Account menu">
          {viewer ? (
            <img src={viewer.avatarUrl} alt="" className="size-6 rounded-full border" />
          ) : (
            <span className="flex size-6 items-center justify-center rounded-full border bg-muted">
              <UserRound className="!size-3.5" aria-hidden />
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>
          {viewer ? `Connected as ${viewer.login}` : 'Browsing as guest'}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={() => navigate('/bookmarks')}>
          <Bookmark /> My bookmarks
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => navigate('/settings')}>
          <Settings /> Settings
        </DropdownMenuItem>
        {!viewer && (
          <DropdownMenuItem onSelect={() => navigate('/settings#api-access')}>
            <KeyRound /> Add GitHub token
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
