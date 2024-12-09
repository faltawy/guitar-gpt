import { z } from 'zod'

export const notesMap = {
  A2: 'samples/A2.mp3',
  A3: 'samples/A3.mp3',
  A4: 'samples/A4.mp3',
  'A#3': 'samples/As3.mp3',
  'A#4': 'samples/As4.mp3',
  B2: 'samples/B2.mp3',
  B3: 'samples/B3.mp3',
  B4: 'samples/B4.mp3',
  C3: 'samples/C3.mp3',
  C4: 'samples/C4.mp3',
  C5: 'samples/C5.mp3',
  'C#3': 'samples/Cs3.mp3',
  'C#4': 'samples/Cs4.mp3',
  'C#5': 'samples/Cs5.mp3',
  D2: 'samples/D2.mp3',
  D3: 'samples/D3.mp3',
  D4: 'samples/D4.mp3',
  'A#2': 'samples/As2.mp3',
  D5: 'samples/D5.mp3',
  'D#2': 'samples/Ds2.mp3',
  'D#3': 'samples/Ds3.mp3',
  'D#4': 'samples/Ds4.mp3',
  E2: 'samples/E2.mp3',
  E3: 'samples/E3.mp3',
  E4: 'samples/E4.mp3',
  F2: 'samples/F2.mp3',
  F3: 'samples/F3.mp3',
  F4: 'samples/F4.mp3',
  'F#2': 'samples/Fs2.mp3',
  'F#3': 'samples/Fs3.mp3',
  'F#4': 'samples/Fs4.mp3',
  G2: 'samples/G2.mp3',
  G3: 'samples/G3.mp3',
  G4: 'samples/G4.mp3',
  'G#2': 'samples/Gs2.mp3',
  'G#3': 'samples/Gs3.mp3',
  'G#4': 'samples/Gs4.mp3',
} as const

export const noteNameSchema = z.enum(Object.keys(notesMap) as any) as z.ZodType<
  keyof typeof notesMap
>

export const availableNotes = Object.keys(notesMap)
