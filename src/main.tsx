import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import { BookmarksProvider } from './context/BookmarksContext'
import { PreferencesProvider } from './context/PreferencesContext'
import { ThemeProvider } from './context/ThemeContext'
import './index.css'
import { GitHubError } from './services/github'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60_000,
      gcTime: 30 * 60_000,
      refetchOnWindowFocus: false,
      // Retrying rate limits or bad queries only wastes the request budget.
      retry: (failures, error) =>
        failures < 1 && (!(error instanceof GitHubError) || error.kind === 'network' || error.kind === 'unknown'),
    },
  },
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <PreferencesProvider>
          <BookmarksProvider>
            <BrowserRouter basename={import.meta.env.BASE_URL}>
              <App />
            </BrowserRouter>
          </BookmarksProvider>
        </PreferencesProvider>
      </ThemeProvider>
    </QueryClientProvider>
  </StrictMode>,
)
