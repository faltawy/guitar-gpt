import { notesMap } from './notes-map'
import type { Note } from '.'

export function generateRandomNotes(count: number): Note[] {
  const noteKeys = Object.keys(notesMap)
  // More musical durations, favoring quarter and eighth notes
  const durations = ['4n', '4n', '4n', '8n', '8n', '16n']
  const notes: Note[] = []

  for (let i = 0; i < count; i++) {
    const note = noteKeys[Math.floor(Math.random() * noteKeys.length)]
    const duration = durations[Math.floor(Math.random() * durations.length)]
    notes.push({ note, duration } as Note)
  }

  return notes
}
