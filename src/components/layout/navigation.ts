import { Bookmark, BookOpen, CircleDot, Compass, LayoutDashboard, Settings, TrendingUp } from 'lucide-react'

export const NAV_ITEMS = [
  { to: '/overview', label: 'Overview', icon: LayoutDashboard },
  { to: '/explore', label: 'Explore Projects', icon: Compass },
  { to: '/issues', label: 'Find Issues', icon: CircleDot },
  { to: '/bookmarks', label: 'My Bookmarks', icon: Bookmark },
  { to: '/trending', label: 'Trending Projects', icon: TrendingUp },
  { to: '/guide', label: 'Contribution Guide', icon: BookOpen },
  { to: '/settings', label: 'Settings', icon: Settings },
]
