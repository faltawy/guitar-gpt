import React from 'react'
import { useSettings } from '../contexts/settings-context'

export function GuitarSettings() {
  const { settings, updateGuitarSettings } = useSettings()

  return (
    <div className="guitar-settings">
      <h3>Guitar Settings</h3>

      <div className="setting-group">
        <label>
          Volume
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={settings.guitar.volume}
            onChange={(e) =>
              updateGuitarSettings({ volume: parseFloat(e.target.value) })
            }
          />
        </label>
      </div>

      <div className="setting-group">
        <label>
          Guitar Type
          <select
            value={settings.guitar.type}
            onChange={(e) =>
              updateGuitarSettings({ type: e.target.value as any })
            }
          >
            <option value="acoustic">Acoustic</option>
            <option value="electric">Electric</option>
            <option value="classical">Classical</option>
          </select>
        </label>
      </div>

      {/* Add similar controls for distortion, reverb, and delay */}
    </div>
  )
}
