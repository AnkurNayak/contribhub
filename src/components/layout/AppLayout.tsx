import { Suspense, useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { RateLimitBanner } from '@/components/common/RateLimitBanner'
import { PageSkeleton } from './PageSkeleton'
import { SidebarNav } from './SidebarNav'
import { TopBar } from './TopBar'

export function AppLayout() {
  const { pathname, hash } = useLocation()

  // Filter changes keep position; moving between pages starts at the top.
  useEffect(() => {
    if (!hash) window.scrollTo(0, 0)
  }, [pathname, hash])

  return (
    <div className="min-h-dvh">
      <a
        href="#main"
        className="fixed top-2 left-2 z-50 -translate-y-16 rounded-md bg-primary px-3 py-2 text-sm text-primary-foreground focus:translate-y-0"
      >
        Skip to content
      </a>
      <TopBar />
      <div className="flex">
        <aside className="sticky top-14 hidden h-[calc(100dvh-3.5rem)] w-60 shrink-0 overflow-y-auto border-r lg:block">
          <SidebarNav />
        </aside>
        <div className="min-w-0 flex-1">
          <RateLimitBanner />
          <main id="main" className="mx-auto max-w-[1400px] px-4 py-6 lg:px-8 lg:py-8">
            <Suspense fallback={<PageSkeleton />}>
              <Outlet />
            </Suspense>
          </main>
        </div>
      </div>
    </div>
  )
}
