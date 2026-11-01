import { lazy, Suspense } from 'react'
import { Route, Routes } from 'react-router-dom'
import { ErrorBoundary } from '@/components/common/ErrorBoundary'
import { AppLayout } from '@/components/layout/AppLayout'
import { PageSkeleton } from '@/components/layout/PageSkeleton'

const Home = lazy(() => import('@/pages/Home'))
const Overview = lazy(() => import('@/pages/Overview'))
const Explore = lazy(() => import('@/pages/Explore'))
const Issues = lazy(() => import('@/pages/Issues'))
const ProjectDetails = lazy(() => import('@/pages/ProjectDetails'))
const Bookmarks = lazy(() => import('@/pages/Bookmarks'))
const Trending = lazy(() => import('@/pages/Trending'))
const ContributionGuide = lazy(() => import('@/pages/ContributionGuide'))
const Settings = lazy(() => import('@/pages/Settings'))
const SearchResults = lazy(() => import('@/pages/SearchResults'))
const NotFound = lazy(() => import('@/pages/NotFound'))

export default function App() {
  return (
    <ErrorBoundary>
      <Suspense fallback={<div className="p-8"><PageSkeleton /></div>}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route element={<AppLayout />}>
            <Route path="overview" element={<Overview />} />
            <Route path="explore" element={<Explore />} />
            <Route path="issues" element={<Issues />} />
            <Route path="projects/:owner/:repo" element={<ProjectDetails />} />
            <Route path="bookmarks" element={<Bookmarks />} />
            <Route path="trending" element={<Trending />} />
            <Route path="guide" element={<ContributionGuide />} />
            <Route path="settings" element={<Settings />} />
            <Route path="search" element={<SearchResults />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </Suspense>
    </ErrorBoundary>
  )
}
