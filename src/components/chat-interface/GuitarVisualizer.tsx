import React from 'react'
import Guitar from 'react-guitar'
import { standard } from 'react-guitar-tunings'
import useSound from 'react-guitar-sound'
import { Button } from '@/components/ui/button'
import { PlayCircle } from 'lucide-react'
import type { Note } from '@/lib/music-producer'
import { noteToFret } from '@/lib/music-producer'
import { Card } from '@/components/ui/card'
import { playGuitarNotes } from '@/lib/music-producer'

interface GuitarVisualizerProps {
  notes: Note[] | undefined
  onReplay: () => void
  isPlaying?: boolean
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

  const handleReplay = async () => {
    await playGuitarNotes(notes, play)
  }

  const visualizeNote = (note: Note) => {
    const [string, fret] = noteToFret(note.note)
    const newStrings = [0, 0, 0, 0, 0, 0]
    newStrings[string] = fret
    setStrings(newStrings)
    play(string)
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
