import React from 'react'
import Guitar from 'react-guitar'
import { standard } from 'react-guitar-tunings'
import useSound from 'react-guitar-sound'
import { Button } from '@/components/ui/button'
import { PlayCircle } from 'lucide-react'
import type { Note } from '@/lib/music-producer'
import { Card } from '@/components/ui/card'

interface GuitarVisualizerProps {
  notes: Note[] | undefined
  onReplay: () => void
  isPlaying?: boolean
}

const noteToFret = (note: string): [number, number] => {
  // Map of notes to [string, fret] positions
  const guitarMap: Record<string, [number, number]> = {
    E2: [5, 0],
    F2: [5, 1],
    'F#2': [5, 2],
    G2: [5, 3],
    A2: [4, 0],
    B2: [4, 2],
    C3: [4, 3],
    D3: [3, 0],
    E3: [3, 2],
    F3: [3, 3],
    G3: [2, 0],
    A3: [2, 2],
    B3: [2, 4],
    C4: [1, 1],
    D4: [1, 3],
    E4: [1, 5],
    F4: [0, 1],
    G4: [0, 3],
    A4: [0, 5],
  }
  return guitarMap[note] || [0, 0]
}

export function GuitarVisualizer({
  notes = [],
  onReplay,
  isPlaying,
}: GuitarVisualizerProps) {
  const [strings, setStrings] = React.useState([0, 0, 0, 0, 0, 0])

  const { play } = useSound({
    fretting: strings,
    tuning: standard,
  })

  const visualizeNote = (note: Note) => {
    const [string, fret] = noteToFret(note.note)
    const newStrings = [0, 0, 0, 0, 0, 0]
    newStrings[string] = fret
    setStrings(newStrings)
  }

  const handleReplay = () => {
    const firstNote = notes?.[0]
    if (firstNote) {
      const [string, fret] = noteToFret(firstNote.note)
      const newStrings = [0, 0, 0, 0, 0, 0]
      newStrings[string] = fret
      setStrings(newStrings)
    }
    onReplay()
  }

  return (
    <Card className="p-4">
      <div className="flex flex-col gap-4">
        <Guitar
          strings={strings}
          onChange={setStrings}
          onPlay={play}
          className="w-full max-w-2xl mx-auto"
          renderFinger={(string, fret) => (
            <div
              className="w-4 h-4 rounded-full bg-primary"
              style={{
                opacity: strings[string] === fret ? 1 : 0,
              }}
            />
          )}
        />

        <div className="flex justify-between items-center">
          <div className="flex gap-2">
            {notes.map((note, i) => (
              <Button
                key={i}
                variant="outline"
                size="sm"
                onClick={() => visualizeNote(note)}
                className="font-mono"
              >
                {note.note}
              </Button>
            ))}
          </div>

          <Button
            variant="secondary"
            size="sm"
            onClick={handleReplay}
            disabled={isPlaying}
          >
            <PlayCircle className="w-4 h-4 mr-2" />
            Replay
          </Button>
        </div>
      </div>
    </Card>
  )
}
