import * as Tone from 'tone'
import z from 'zod'
import { noteNameSchema, notesMap } from './notes-map'

const noteDuration = z.enum(['4n', '8n', '16n', '32n'])

export const noteSchema = z.object({
  note: noteNameSchema,
  duration: noteDuration,
})

export type Note = z.infer<typeof noteSchema>

const state = {
  loaded: false,
  isPlaying: false,
}

function createGuitarSampler() {
  // Start Tone.js context when creating sampler
  Tone.start()

  const sampler = new Tone.Sampler(
    notesMap,
    () => {
      state.loaded = true
    },
    'http://localhost:3000/',
  ).toDestination()

  return sampler
}

const guitarSampler = createGuitarSampler()

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
  effects: { reverb?: boolean; delay?: boolean } = {},
) {
  if (!state.loaded) {
    console.error('Guitar samples are not loaded yet!')
    return
  }

  // Add effects if specified
  let chain = guitarSampler
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

  // Schedule the note to play at the specified time
  if (time !== undefined) {
    chain.triggerAttackRelease(note, duration, time)
  } else {
    chain.triggerAttackRelease(note, duration, Tone.now())
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
  guitarSampler.releaseAll()
  state.isPlaying = false
}
