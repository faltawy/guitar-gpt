import * as Tone from 'tone'
import z from 'zod'
import { noteNameSchema, notesMap } from './notes-map'
import type { GuitarSettings } from '../types/settings'
import { standard } from 'react-guitar-tunings'
import useSound from 'react-guitar-sound'

// Convert note to [string, fret] format for react-guitar
export function noteToFret(note: string): [number, number] {
  // Map of notes to [string, fret] positions on standard tuning
  const guitarMap: Record<string, [number, number]> = {
    E2: [5, 0],
    F2: [5, 1],
    'F#2': [5, 2],
    G2: [5, 3],
    'G#2': [5, 4],
    A2: [4, 0],
    'A#2': [4, 1],
    B2: [4, 2],
    C3: [4, 3],
    'C#3': [4, 4],
    D3: [3, 0],
    'D#3': [3, 1],
    E3: [3, 2],
    F3: [3, 3],
    'F#3': [3, 4],
    G3: [2, 0],
    'G#3': [2, 1],
    A3: [2, 2],
    'A#3': [2, 3],
    B3: [2, 4],
    C4: [1, 1],
    'C#4': [1, 2],
    D4: [1, 3],
    'D#4': [1, 4],
    E4: [1, 5],
    F4: [0, 1],
    'F#4': [0, 2],
    G4: [0, 3],
    'G#4': [0, 4],
    A4: [0, 5],
  }
  return guitarMap[note] || [0, 0]
}

const noteDuration = z.enum([
  '1n',
  '2n',
  '2n.',
  '4n',
  '4n.',
  '8n',
  '8n.',
  '16n',
])

export const noteSchema = z.object({
  note: noteNameSchema.describe('Name of the note'),
  duration: noteDuration.describe('Duration of the note'),
  velocity: z.number().describe('Velocity of the note, min 0, max 1'),
  time: z.number().optional().describe('Time to play the note in seconds'),
  pan: z.number().optional().describe('Panning of the note, min -1, max 1'),
  reverb: z.boolean().optional().describe('Reverb effect'),
  delay: z.boolean().optional().describe('Delay effect'),
})

export type Note = z.infer<typeof noteSchema>

const state = {
  isPlaying: false,
}

export async function playGuitarNotes(
  notes: Note[],
  playSound: (string: number) => void,
) {
  if (state.isPlaying) return
  state.isPlaying = true

  try {
    for (const note of notes) {
      const [string, fret] = noteToFret(note.note)
      const strings = [0, 0, 0, 0, 0, 0]
      strings[string] = fret

      playSound(string)

      // Wait for the note duration
      const durationMs = getDurationInMs(note.duration)
      await new Promise((resolve) => setTimeout(resolve, durationMs))
    }
  } catch (error) {
    console.error('Error playing guitar notes:', error)
  } finally {
    state.isPlaying = false
  }
}

function getDurationInMs(duration: string): number {
  const durationMap: Record<string, number> = {
    '1n': 2000,
    '2n': 1000,
    '2n.': 1500,
    '4n': 500,
    '4n.': 750,
    '8n': 250,
    '8n.': 375,
    '16n': 125,
  }
  return durationMap[duration] || 500
}

export function stopGuitarNotes() {
  state.isPlaying = false
}

export class MusicProducer {
  private guitarSettings: GuitarSettings

  constructor(settings: GuitarSettings) {
    this.guitarSettings = settings
  }

  async playGuitar(notes: string[]) {
    const notesWithSettings = notes.map((note) => ({
      note: note as keyof typeof notesMap,
      duration: '4n' as const,
      velocity: this.guitarSettings.volume,
      reverb: this.guitarSettings.reverb > 0,
      delay: this.guitarSettings.delay > 0,
    }))

    await playGuitarNotes(notesWithSettings, (string) => {
      // Implement the playSound function to handle the sound playback
    })
  }

  updateSettings(newSettings: GuitarSettings) {
    this.guitarSettings = newSettings
  }
}
