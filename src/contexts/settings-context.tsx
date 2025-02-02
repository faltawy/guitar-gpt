import type React from 'react'
import { createContext, useContext, useState } from 'react'
import { type Settings, DEFAULT_GUITAR_SETTINGS } from '../lib/types/settings'

interface SettingsContextType {
  settings: Settings
  updateSettings: (settings: Partial<Settings>) => void
  updateGuitarSettings: (updates: Partial<Settings['guitar']>) => void
}

const SettingsContext = createContext<SettingsContextType | undefined>(
  undefined,
)

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<Settings>({
    guitar: DEFAULT_GUITAR_SETTINGS,
  })

  const updateSettings = (updates: Partial<Settings>) => {
    setSettings((prev) => ({ ...prev, ...updates }))
  }

  const updateGuitarSettings = (updates: Partial<Settings['guitar']>) => {
    setSettings((prev) => ({
      ...prev,
      guitar: {
        ...prev.guitar,
        ...updates,
      },
    }))
  }

  return (
    <SettingsContext.Provider
      value={{ settings, updateGuitarSettings, updateSettings }}
    >
      {children}
    </SettingsContext.Provider>
  )
}

export function useSettings() {
  const context = useContext(SettingsContext)
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider')
  }
  return context
}
