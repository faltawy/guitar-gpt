import type { ChatMessage, ChatSession } from '@/lib/db'
import { create } from 'mutative'

export type ChatState = {
  activeSessionId: number | null
  sessions: ChatSession[]
  messages: ChatMessage[]
  isLoading: boolean
}

export type ChatAction =
  | { type: 'SET_ACTIVE_SESSION'; payload: number | null }
  | { type: 'SET_SESSIONS'; payload: ChatSession[] }
  | { type: 'SET_MESSAGES'; payload: ChatMessage[] }
  | { type: 'ADD_MESSAGE'; payload: ChatMessage }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'DELETE_SESSION'; payload: number }
  | {
      type: 'UPDATE_SESSION'
      payload: { id: number; updates: Partial<ChatSession> }
    }
  | { type: 'DELETE_MESSAGE'; payload: number }
  | {
      type: 'UPDATE_MESSAGE'
      payload: { id: number; updates: Partial<ChatMessage> }
    }

export function chatReducer(state: ChatState, action: ChatAction): ChatState {
  return create(state, (draft) => {
    switch (action.type) {
      case 'SET_ACTIVE_SESSION':
        draft.activeSessionId = action.payload
        break

      case 'SET_SESSIONS':
        draft.sessions = action.payload
        break

      case 'SET_MESSAGES':
        draft.messages = action.payload
        break

      case 'ADD_MESSAGE':
        draft.messages.push(action.payload)
        break

      case 'SET_LOADING':
        draft.isLoading = action.payload
        break

      case 'DELETE_SESSION': {
        draft.sessions = draft.sessions.filter(
          (session) => session.id !== action.payload,
        )
        if (draft.activeSessionId === action.payload) {
          draft.activeSessionId = null
        }
        break
      }

      case 'UPDATE_SESSION': {
        const session = draft.sessions.find((s) => s.id === action.payload.id)
        if (session) {
          Object.assign(session, action.payload.updates)
        }
        break
      }

      case 'DELETE_MESSAGE': {
        draft.messages = draft.messages.filter(
          (message) => message.id !== action.payload,
        )
        break
      }

      case 'UPDATE_MESSAGE': {
        const message = draft.messages.find((m) => m.id === action.payload.id)
        if (message) {
          Object.assign(message, action.payload.updates)
        }
        break
      }
    }
  })
}
