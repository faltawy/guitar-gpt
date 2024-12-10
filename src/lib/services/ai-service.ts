import { noteSchema, playGuitarNotes } from '@/lib/music-producer'
import type { ChatMessage } from '@/lib/db'
import OpenAI from 'openai'
import { zodResponseFormat } from 'openai/helpers/zod'
import { z } from 'zod'
import { availableNotes } from '../music-producer/notes-map'
import { useSettings } from '@/lib/stores/settings'
import { db } from '@/lib/db'

const AIResponseSchema = z.object({
  message: z.string(),
  notes: z.array(noteSchema).optional(),
})

export type AIResponse = z.infer<typeof AIResponseSchema>

const SYSTEM_PROMPT = `
You are GuitarGPT, an AI assistant specialized in guitar and music theory, that will help the user to learn guitar and music theory.
- availabe notes are ${availableNotes.join('\t')}.
- generate detailed explanations for the notes or the chords generated.
- don't generate notes if the user doesn't ask for them.
- be super creative and follow the user's instructions, be a great guitar teacher.
- if the user asks for a song, please generate the chords and the notes for the song.
- please respond in markdown for the text messages
- explain everthing and every note in detail, don't leave anything out.
- remember you are a guitar teacher, so you should be able to explain the guitar in a way that is easy to understand.
`

const MAX_CONTEXT_MESSAGES = 20
export class AIService {
  private static instance: AIService
  private openai: OpenAI | null = null

  private constructor() {
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
      AIService.instance = new AIService()
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
      content: msg.content,
    }))
  }

  async chat(messages: ChatMessage[]) {
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
              notes: response.notes,
            } as ChatMessage,
          ]
          await this.generateTitleInBackground(sessionId, allMessages)
        }
      }

      // Play the notes if they exist
      if (response.notes) {
        playGuitarNotes(response.notes)
      }

      return response
    } catch (error) {
      console.error('AI Service Error:', error)
      return {
        message: 'Sorry, I encountered an error. Please try again.',
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
}

export const aiService = AIService.getInstance()
