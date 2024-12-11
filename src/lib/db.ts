import Dexie, { type Table } from 'dexie'
import type { Note } from './music-producer'
import type { AIResponse } from './services/ai-service'

export interface Profile {
  id?: number
  name: string
  avatar?: string
  createdAt: Date
  updatedAt: Date
}

export interface ChatSession {
  id?: number
  title: string
  createdAt: Date
  updatedAt: Date
  profileId: number
  lastMessage?: string
  hasGeneratedTitle?: boolean
}

interface BotMessage {
  role: 'assistant'
  content: AIResponse['message']
  isLoading: boolean
}

interface UserMessage {
  role: 'user'
  content: string
}

export type ChatMessage = (UserMessage | BotMessage) & {
  id?: number
  sessionId: number
  createdAt: Date
  updatedAt?: Date
}

export class GuitarGPTDB extends Dexie {
  profiles!: Table<Profile>
  sessions!: Table<ChatSession>
  messages!: Table<ChatMessage>

  constructor() {
    super('guitar-gpt')
    this.version(1).stores({
      profiles: '++id, name, createdAt, updatedAt',
      sessions: '++id, profileId, title, createdAt, updatedAt',
      messages: '++id, sessionId, role, createdAt, updatedAt',
    })
  }
}

export const db = new GuitarGPTDB()
