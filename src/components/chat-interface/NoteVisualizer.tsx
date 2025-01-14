import type { Note } from '@/lib/music-producer'
import { Button } from '@/components/ui/button'
import { PlayCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { playGuitarNote } from '@/lib/music-producer'

interface NoteVisualizerProps {
  notes: Note[] | undefined
  onReplay: () => void
  isPlaying?: boolean
}

export function NoteVisualizer({
  notes = [],
  onReplay,
  isPlaying,
}: NoteVisualizerProps) {
  const handleNoteClick = (note: Note) => {
    playGuitarNote(note.note, note.duration, undefined, note.velocity, {
      reverb: note.reverb,
      delay: note.delay,
      pan: note.pan,
    })
  }

  return (
    <div className="flex flex-col gap-2 p-2 rounded-lg border bg-muted/30">
      <div className="flex items-center gap-2 overflow-x-auto p-2">
        {notes.map((note, i) => (
          <div key={i} className="flex flex-col items-center text-sm">
            <div className="text-xs font-mono text-muted-foreground">
              {note.duration}
            </div>
            <div
              role="button"
              tabIndex={0}
              onClick={() => handleNoteClick(note)}
              onKeyDown={(e) => e.key === 'Enter' && handleNoteClick(note)}
              className={cn(
                'px-2 bg-primary/10 text-primary py-1 rounded-md font-medium',
                'hover:bg-primary/20 cursor-pointer transition-colors',
                note.reverb && 'ring-2 ring-primary/20',
                note.delay && 'opacity-80',
              )}
              style={{
                transform: `translateX(${note.pan ? note.pan * 10 : 0}px)`,
                opacity: note.velocity,
              }}
            >
              {note.note}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              {note.velocity?.toFixed(2)}
            </div>
          </div>
        ))}
      </div>
      <div className="flex justify-end">
        <Button
          variant="secondary"
          size="sm"
          onClick={onReplay}
          disabled={isPlaying}
        >
          <PlayCircle className="w-4 h-4" />
          Replay Melody
        </Button>
      </div>
    </div>
  )
}
