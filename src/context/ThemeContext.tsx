import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import type { Theme } from '@/types/app'
import { STORAGE_KEYS } from '@/utils/storage'

interface ThemeValue {
  theme: Theme
  resolved: 'light' | 'dark'
  setTheme: (theme: Theme) => void
}

const ThemeContext = createContext<ThemeValue | null>(null)
const media = () => window.matchMedia('(prefers-color-scheme: dark)')

function readTheme(): Theme {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.theme)
    if (stored === 'light' || stored === 'dark') return stored
  } catch {
    // Fall through to the system default.
  }
  return 'system'
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(readTheme)
  const [systemDark, setSystemDark] = useState(() => media().matches)

  useEffect(() => {
    const query = media()
    const onChange = (event: MediaQueryListEvent) => setSystemDark(event.matches)
    query.addEventListener('change', onChange)
    return () => query.removeEventListener('change', onChange)
  }, [])

  const resolved = theme === 'system' ? (systemDark ? 'dark' : 'light') : theme

  useEffect(() => {
    document.documentElement.classList.toggle('dark', resolved === 'dark')
  }, [resolved])

  const value = useMemo<ThemeValue>(
    () => ({
      theme,
      resolved,
      setTheme(next) {
        setThemeState(next)
        try {
          if (next === 'system') localStorage.removeItem(STORAGE_KEYS.theme)
          else localStorage.setItem(STORAGE_KEYS.theme, next)
        } catch {
          // The choice still applies for this session.
        }
      },
    }),
    [theme, resolved],
  )

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  const value = useContext(ThemeContext)
  if (!value) throw new Error('useTheme must be used inside ThemeProvider')
  return value
}
