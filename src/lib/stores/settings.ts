import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { DEFAULT_GUITAR_SETTINGS, type Settings } from '../types/settings'

interface SettingsState {
  settings: Settings
  apiKey: string | null
  setApiKey: (key: string) => void
  theme: 'light' | 'dark' | 'system'
  clearHistory: () => void
  updateSettings: (newSettings: Partial<Settings>) => void
}

const defaultSettings: Settings = {
  guitar: {
    delay: 0,
    enabled: true,
    reverb: 0,
    volume: 0.75,
  },
}

export const useSettings = create<SettingsState>()(
  persist(
    (set) => ({
      settings: {
        guitar: DEFAULT_GUITAR_SETTINGS,
      },
      apiKey: null,
      setApiKey: (key) => set({ apiKey: key }),
      theme: 'system',
      clearHistory: () => {
        localStorage.removeItem('chat-history')
        window.location.reload()
      },
      updateSettings: (newSettings: Partial<Settings>) =>
        set((state) => ({
          settings: { ...state.settings, ...newSettings },
        })),
    }),
    {
      name: 'settings-storage',
    },
  ),
)
