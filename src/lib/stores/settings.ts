import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface SettingsState {
  theme: 'light' | 'dark' | 'system'
  apiKey: string | null
  setTheme: (theme: 'light' | 'dark' | 'system') => void
  setApiKey: (apiKey: string) => void
  clearHistory: () => void
}

export const useSettings = create<SettingsState>()(
  persist(
    (set) => ({
      theme: 'system',
      apiKey: null,
      setTheme: (theme) => set({ theme }),
      setApiKey: (apiKey) => set({ apiKey }),
      clearHistory: () => {
        localStorage.removeItem('chat-history')
        window.location.reload()
      },
    }),
    {
      name: 'settings',
    },
  ),
)
