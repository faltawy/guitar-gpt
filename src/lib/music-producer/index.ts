import * as Tone from 'tone'
import z from 'zod'
import { noteNameSchema, notesMap } from './notes-map'
import type { GuitarSettings } from '../types/settings'

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
  loaded: false,
  isPlaying: false,
  audioSupported: false,
  permissionGranted: false,
}

async function checkAudioSupport(): Promise<boolean> {
  try {
    // Check if the Web Audio API is supported
    if (!window.AudioContext && !window.webkitAudioContext) {
      throw new Error('Web Audio API is not supported in this browser')
    }

    // Test if we can create an audio context
    const audioContext = new (
      window.AudioContext || window.webkitAudioContext
    )()
    await audioContext.resume()
    audioContext.close()

    state.audioSupported = true
    state.permissionGranted = true
    return true
  } catch (error) {
    console.error('Audio not supported or permission denied:', error)
    state.audioSupported = false
    state.permissionGranted = false
    return false
  }
}

function createGuitarSampler() {
  // Check audio support before starting
  if (!state.audioSupported) {
    console.error('Audio is not supported or permission was denied')
    return null
  }

  // Start Tone.js context when creating sampler
  Tone.start()

  const sampler = new Tone.Sampler(notesMap, () => {
    state.loaded = true
  }).toDestination()

  return sampler
}

let guitarSampler: Tone.Sampler | null = null

export async function initializeAudio() {
  const supported = await checkAudioSupport()
  if (supported) {
    guitarSampler = createGuitarSampler()
    return true
  }
  return false
}

export function getAudioState() {
  return {
    supported: state.audioSupported,
    permissionGranted: state.permissionGranted,
    loaded: state.loaded,
  }
}

/**
 * Play a complete guitar note.
 * @param note - The guitar note to play (e.g., 'E4').
 * @param duration - The duration of the note (e.g., '4n').
 * @param time - Optional time to play the note (in seconds).
 * @param effects - Optional effects like reverb or delay.
 */
export function playGuitarNote(
  note: keyof typeof notesMap,
  duration: string,
  time?: number,
  velocity: number = 0.8,
  effects: {
    reverb?: boolean
    delay?: boolean
    pan?: number
  } = {},
) {
  if (!guitarSampler || !state.loaded) {
    console.error('Guitar samples are not loaded yet!')
    return
  }

  // Create a chain starting with the sampler
  let chain = guitarSampler

  // Add panning if specified
  if (effects.pan !== undefined) {
    const panner = new Tone.Panner(effects.pan).toDestination()
    chain.connect(panner)
  }

  // Add effects if specified
  if (effects.reverb) {
    const reverb = new Tone.Reverb({ decay: 2.5, wet: 0.3 }).toDestination()
    chain.connect(reverb)
  }
  if (effects.delay) {
    const delay = new Tone.PingPongDelay({
      delayTime: '8n',
      feedback: 0.2,
      wet: 0.2,
    }).toDestination()
    chain.connect(delay)
  }

  // Schedule the note to play at the specified time with velocity
  if (time !== undefined) {
    chain.triggerAttackRelease(note, duration, time, velocity)
  } else {
    chain.triggerAttackRelease(note, duration, Tone.now(), velocity)
  }
}

export async function playGuitarNotes(notes: Note[]) {
  // Prevent multiple playback instances
  if (state.isPlaying) return
  state.isPlaying = true

  try {
    // Make sure Tone.js is started
    await Tone.start()

    // Calculate total duration for proper scheduling
    const now = Tone.now()
    let currentTime = now

    // Schedule all notes with proper timing
    notes.forEach(({ note, duration }) => {
      playGuitarNote(note as keyof typeof notesMap, duration, currentTime)

      // Calculate next note timing based on duration
      const durationInSeconds = Tone.Time(duration).toSeconds()
      currentTime += durationInSeconds
    })

    // Wait for the sequence to finish before allowing new playback
    const totalDuration = currentTime - now
    await new Promise((resolve) => setTimeout(resolve, totalDuration * 1000))
  } catch (error) {
    console.error('Error playing guitar notes:', error)
  } finally {
    state.isPlaying = false
  }
}

// Add a function to stop playback if needed
export function stopGuitarNotes() {
  guitarSampler?.releaseAll()
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

    await playGuitarNotes(notesWithSettings)
  }

  updateSettings(newSettings: GuitarSettings) {
    this.guitarSettings = newSettings
  }
}
