import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react'
import type { Preferences } from '@/types/app'
import { readJson, STORAGE_KEYS, writeJson } from '@/utils/storage'

const DEFAULTS: Preferences = { token: '', languages: [], perPage: 12 }

interface PreferencesValue {
  preferences: Preferences
  update: (patch: Partial<Preferences>) => void
}

const PreferencesContext = createContext<PreferencesValue | null>(null)

export function PreferencesProvider({ children }: { children: ReactNode }) {
  const [preferences, setPreferences] = useState<Preferences>(() => ({
    ...DEFAULTS,
    ...readJson<Partial<Preferences>>(STORAGE_KEYS.preferences, {}),
  }))

  const update = useCallback((patch: Partial<Preferences>) => {
    setPreferences((current) => {
      const next = { ...current, ...patch }
      writeJson(STORAGE_KEYS.preferences, next)
      return next
    })
  }, [])

  const value = useMemo(() => ({ preferences, update }), [preferences, update])
  return <PreferencesContext.Provider value={value}>{children}</PreferencesContext.Provider>
}

export function usePreferences() {
  const value = useContext(PreferencesContext)
  if (!value) throw new Error('usePreferences must be used inside PreferencesProvider')
  return value
}
