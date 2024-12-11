export interface GuitarSettings {
  enabled: boolean
  volume: number
  reverb: number
  delay: number
}

export interface Settings {
  guitar: GuitarSettings
}

export const DEFAULT_GUITAR_SETTINGS: GuitarSettings = {
  enabled: false,
  volume: 0.8,
  reverb: 0,
  delay: 0,
}

export interface SettingsState {
  settings: Settings
  updateSettings: (settings: Partial<Settings>) => void
  theme: 'light' | 'dark' | 'system'
  clearHistory: () => void
  // ... other existing settings
}
