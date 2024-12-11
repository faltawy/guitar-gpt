export interface GuitarSettings {
  volume: number
  distortion: number
  reverb: number
  delay: number
  type: 'acoustic' | 'electric' | 'classical'
}

export interface Settings {
  guitar: GuitarSettings
}

export const DEFAULT_GUITAR_SETTINGS: GuitarSettings = {
  volume: 0.8,
  distortion: 0,
  reverb: 0.2,
  delay: 0,
  type: 'acoustic',
}
