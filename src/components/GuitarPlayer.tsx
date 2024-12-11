import React from 'react'
import Guitar from 'react-guitar'
import { standard } from 'react-guitar-tunings'
import useSound from 'react-guitar-sound'

interface GuitarPlayerProps {
  className?: string
  initialStrings?: number[]
}

export const GuitarPlayer: React.FC<GuitarPlayerProps> = ({
  className,
  initialStrings = [0, 0, 0, 0, 0, 0], // Open strings by default
}) => {
  const [strings, setStrings] = React.useState(initialStrings)

  // Setup sound with standard tuning
  const { play, strum } = useSound({
    fretting: strings,
    tuning: standard,
  })

  return (
    <div className="guitar-player">
      <Guitar
        strings={strings}
        className={className}
        onChange={setStrings}
        onPlay={play}
      />
      <button
        onClick={() => strum()}
        className="px-4 py-2 mt-4 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        Strum
      </button>
    </div>
  )
}
