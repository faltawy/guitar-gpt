import type { ChatMessage } from '@/lib/db'
import OpenAI from 'openai'
import { zodResponseFormat } from 'openai/helpers/zod'
import { z } from 'zod'
import { useSettings } from '@/lib/stores/settings'
import { db } from '@/lib/db'
import { MusicProducer } from '@/lib/music-producer'
import type { GuitarSettings } from '@/lib/types/settings'

const noteSchema = z.object({
  string: z.number().describe('The string number to play, from 0 to 5'),
  fret: z.number().describe('The fret position to play, from 0 to 12'),
  duration: z
    .enum(['1n', '2n', '4n', '8n', '16n'])
    .describe('The duration of the note'),
  velocity: z.number().describe('The velocity of the note'),
})

const AIResponseSchema = z
  .object({
    message: z
      .array(
        z.discriminatedUnion('kind', [
          z
            .object({
              kind: z.literal('notes'),
              notes: z.array(noteSchema),
            })
            .describe('A sequence of guitar string/fret positions to play'),
          z
            .object({
              kind: z.literal('message'),
              message: z.string(),
            })
            .describe('A message from the AI, in markdown'),
        ]),
      )
      .describe('A sequence of messages from the AI'),
  })
  .describe('A response from the AI, containing guitar positions and messages')

export type AIResponse = z.infer<typeof AIResponseSchema>

const SYSTEM_PROMPT = `
You are GuitarGPT, an AI assistant specialized in guitar and music theory, that will help the user to learn guitar and music theory.
- When generating guitar music, use standard tuning (E A D G B E) and provide:
  * String numbers (0-5, where 0 is high E and 5 is low E)
  * Fret positions (0-12)
  * For chords: Generate all string/fret combinations
  * For melodies: Break down into sequences of string/fret positions
  * For exercises: Provide complete sequences with string/fret positions
- Always include timing and rhythm information using note durations:
  * Use '1n' for whole notes
  * '2n' for half notes
  * '4n' for quarter notes
  * '8n' for eighth notes
  * '16n' for sixteenth notes
- When user asks for a song or chord progression:
  * Break it down into playable sequences
  * Show exact string and fret positions
  * Include strumming patterns with timing
  * Provide both single notes and chord shapes
- Please respond in markdown for the text messages
- Include fingering patterns and hand positions
- Provide progressive learning paths for beginners
- Suggest exercises and practice routines
- Include music theory concepts gradually
- Reference famous songs for practical examples
- If you don't know the answer, just say that you don't know
- Always generate complete musical phrases
- Available notes should be played in these positions:
  * High E string (0): F4(1), G4(3), A4(5)
  * B string (1): C4(1), D4(3), E4(5)
  * G string (2): G3(0), A3(2), B3(4)
  * D string (3): D3(0), E3(2), F3(3)
  * A string (4): A2(0), B2(2), C3(3)
  * Low E string (5): E2(0), F2(1), G2(3)
`

const MAX_CONTEXT_MESSAGES = 20
export class AIService {
  private static instance: AIService
  private openai: OpenAI | null = null
  private musicProducer: MusicProducer

  private constructor(settings: GuitarSettings) {
    this.musicProducer = new MusicProducer(settings)
    const apiKey = useSettings.getState().apiKey
    if (apiKey) {
      this.initializeOpenAI(apiKey)
    }
  }

  private initializeOpenAI(apiKey: string) {
    this.openai = new OpenAI({
      apiKey,
      dangerouslyAllowBrowser: true,
    })
  }

  static getInstance(): AIService {
    if (!AIService.instance) {
      AIService.instance = new AIService(useSettings.getState().settings.guitar)
    }
    return AIService.instance
  }

  private prepareContext(messages: ChatMessage[]) {
    // Take last N messages for context
    const contextMessages = messages.slice(-MAX_CONTEXT_MESSAGES)

    // Always include the first message if it exists (for conversation context)
    if (messages.length > MAX_CONTEXT_MESSAGES && messages[0]) {
      contextMessages.unshift(messages[0])
    }

    return contextMessages.map((msg) => ({
      role: msg.role as 'user' | 'assistant',
      content: JSON.stringify(msg.content),
    }))
  }

  async chat(messages: ChatMessage[]): Promise<AIResponse> {
    try {
      if (!this.openai) {
        const apiKey = useSettings.getState().apiKey
        if (!apiKey) {
          throw new Error('API key not set')
        }
        this.initializeOpenAI(apiKey)
      }

      const contextMessages = this.prepareContext(messages)

      const completion = await this.openai?.beta.chat.completions.parse({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          ...contextMessages,
        ],
        response_format: zodResponseFormat(AIResponseSchema, 'AIResponse'),
        temperature: 0.7,
        max_tokens: 2000,
      })

      const response = completion?.choices[0]?.message.parsed
      if (!response) throw new Error('No valid response from AI')

      if (messages.length >= 5) {
        const sessionId = messages[0]?.sessionId
        if (sessionId) {
          const allMessages = [
            ...messages,
            {
              role: 'assistant',
              content: response.message,
              sessionId,
              createdAt: new Date(),
              isLoading: false,
            } as ChatMessage,
          ]
          await this.generateTitleInBackground(sessionId, allMessages)
        }
      }
      return response
    } catch (error) {
      console.error('Chat error:', error)
      return {
        message: [
          {
            kind: 'message',
            message: 'Sorry, I encountered an error. Please try again.',
          },
        ],
      }
    }
  }

  private async generateTitleInBackground(
    sessionId: number,
    messages: ChatMessage[],
  ) {
    try {
      const session = await db.sessions.get(sessionId)

      if (session && !session.hasGeneratedTitle) {
        const prompt = messages.map((m) => m.content).join('\n')
        const title = await this.generateTitle(prompt)

        await db.sessions.update(sessionId, {
          title,
          hasGeneratedTitle: true,
          updatedAt: new Date(),
        })
      }
    } catch (error) {
      console.error('Title generation error:', error)
    }
  }

  async generateTitle(conversation: string): Promise<string> {
    const response = await this.openai?.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content:
            'Generate a short, concise title (max 6 words) for this guitar-related conversation.',
        },
        { role: 'user', content: conversation },
      ],
      temperature: 0.7,
      max_tokens: 20,
    })

    return (
      response?.choices[0]?.message?.content?.trim() || 'Guitar Conversation'
    )
  }

  updateSettings(settings: GuitarSettings) {
    this.musicProducer.updateSettings(settings)
  }
}

export const aiService = AIService.getInstance()
