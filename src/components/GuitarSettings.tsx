import type React from 'react'
import { useSettings } from '../contexts/settings-context'

export const GuitarSettings: React.FC = () => {
  const { settings, updateSettings } = useSettings()

  const handleSettingChange = (
    key: keyof typeof settings.guitar,
    value: number | boolean,
  ) => {
    updateSettings({
      guitar: {
        ...settings.guitar,
        [key]: value,
      },
    })
  }

  return (
    <div className="guitar-settings space-y-4">
      <h3 className="text-lg font-semibold mb-2">Guitar Settings</h3>

      <div className="flex items-center mb-4">
        <label className="flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={settings.guitar.enabled}
            onChange={(e) => handleSettingChange('enabled', e.target.checked)}
            className="mr-2"
          />
          Enable Guitar
        </label>
      </div>

      {settings.guitar.enabled && (
        <>
          <div className="flex flex-col">
            <label className="mb-1">Volume</label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={settings.guitar.volume}
              onChange={(e) =>
                handleSettingChange('volume', parseFloat(e.target.value))
              }
              className="w-full"
            />
          </div>

          <div className="flex flex-col">
            <label className="mb-1">Reverb</label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={settings.guitar.reverb}
              onChange={(e) =>
                handleSettingChange('reverb', parseFloat(e.target.value))
              }
              className="w-full"
            />
          </div>

          <div className="flex flex-col">
            <label className="mb-1">Delay</label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={settings.guitar.delay}
              onChange={(e) =>
                handleSettingChange('delay', parseFloat(e.target.value))
              }
              className="w-full"
            />
          </div>
        </>
      )}
    </div>
  )
}
