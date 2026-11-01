import { Menu } from 'lucide-react'
import { useState, type ReactNode } from 'react'
import { Logo } from '@/components/common/Logo'
import { Button } from '@/components/ui/button'
import { Dialog, DialogDescription, DialogTitle, SheetContent } from '@/components/ui/dialog'
import { PROJECT_REPO_URL } from '@/utils/constants'
import { GlobalSearch } from './GlobalSearch'
import { SidebarNav } from './SidebarNav'
import { ThemeToggle } from './ThemeToggle'
import { UserMenu } from './UserMenu'

function GitHubIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="currentColor" aria-hidden>
      <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82a7.6 7.6 0 0 1 4 0c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8" />
    </svg>
  )
}

/** `start` lets the landing page add its own links; `hideLogoAt` tucks the logo on app pages. */
export function TopBar({ start, logoClassName }: { start?: ReactNode; logoClassName?: string }) {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <header className="sticky top-0 z-40 flex h-14 items-center gap-2 border-b bg-background/85 px-3 backdrop-blur-md sm:gap-3 lg:px-4">
      <Dialog open={menuOpen} onOpenChange={setMenuOpen}>
        <Button
          variant="ghost"
          size="icon"
          aria-label="Open navigation"
          className="lg:hidden"
          onClick={() => setMenuOpen(true)}
        >
          <Menu />
        </Button>
        <SheetContent aria-describedby={undefined}>
          <DialogTitle className="sr-only">Navigation</DialogTitle>
          <DialogDescription className="sr-only">Main sections of ContribHub</DialogDescription>
          <div className="flex h-14 items-center border-b px-5">
            <Logo />
          </div>
          <SidebarNav onNavigate={() => setMenuOpen(false)} />
        </SheetContent>
      </Dialog>

      <Logo className={logoClassName ?? 'mr-1 hidden w-[216px] shrink-0 pl-2 sm:flex'} />
      {start}
      <GlobalSearch />

      <div className="ml-auto flex shrink-0 items-center gap-0.5">
        <ThemeToggle />
        <Button variant="ghost" size="icon" asChild>
          <a href={PROJECT_REPO_URL} target="_blank" rel="noreferrer" aria-label="ContribHub on GitHub">
            <GitHubIcon />
          </a>
        </Button>
        <UserMenu />
      </div>
    </header>
  )
}
