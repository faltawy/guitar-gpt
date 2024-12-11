import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { DEFAULT_GUITAR_SETTINGS, type Settings } from '../types/settings'

interface SettingsState {
  settings: Settings
  apiKey: string | null
  setApiKey: (key: string) => void
}

export const useSettings = create<SettingsState>()(
  persist(
    (set) => ({
      settings: {
        guitar: DEFAULT_GUITAR_SETTINGS,
      },
      apiKey: null,
      setApiKey: (key) => set({ apiKey: key }),
    }),
    {
      name: 'settings-storage',
    },
  ),
)
