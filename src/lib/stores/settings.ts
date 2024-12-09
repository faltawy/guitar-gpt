import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface SettingsState {
  theme: 'light' | 'dark' | 'system'
  setTheme: (theme: 'light' | 'dark' | 'system') => void
  clearHistory: () => void
}

export const useSettings = create<SettingsState>()(
  persist(
    (set) => ({
      theme: 'system',
      setTheme: (theme) => set({ theme }),
      clearHistory: () => {
        // Clear chat history from localStorage
        localStorage.removeItem('chat-history')
        // Reload the page to reset the state
        window.location.reload()
      },
    }),
    {
      name: 'settings',
    },
  ),
)
