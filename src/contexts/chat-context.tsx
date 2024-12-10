import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useReducer,
} from 'react'
import { db, type ChatMessage, type ChatSession } from '@/lib/db'
import { aiService } from '@/lib/services/ai-service'
import { playGuitarNotes } from '@/lib/music-producer'
import { chatReducer, type ChatState } from '@/lib/reducers/chat-reducer'

interface ChatContextType {
  activeSessionId: number | null
  sessions: ChatSession[]
  messages: ChatMessage[]
  isLoading: boolean
  sendMessage: (content: string) => Promise<void>
  createSession: () => Promise<number>
  deleteSession: (id: number) => Promise<void>
  setActiveSessionId: (id: number | null) => void
  renameSession: (id: number, title: string) => Promise<void>
}

const ChatContext = createContext<ChatContextType | null>(null)

const initialState: ChatState = {
  activeSessionId: null,
  sessions: [],
  messages: [],
  isLoading: false,
}

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(chatReducer, initialState)

  // Load sessions
  useEffect(() => {
    async function loadSessions() {
      const sessions = await db.sessions
        .orderBy('updatedAt')
        .reverse()
        .toArray()
      dispatch({ type: 'SET_SESSIONS', payload: sessions })
      const firstSession = sessions.at(0)
      if (firstSession && firstSession.id && !state.activeSessionId) {
        dispatch({ type: 'SET_ACTIVE_SESSION', payload: firstSession.id })
      }
    }
    loadSessions()
  }, [])

  // Load messages when active session changes
  useEffect(() => {
    async function loadMessages() {
      if (!state.activeSessionId) {
        dispatch({ type: 'SET_MESSAGES', payload: [] })
        return
      }

      const messages = await db.messages
        .where('sessionId')
        .equals(state.activeSessionId)
        .sortBy('createdAt')

      dispatch({ type: 'SET_MESSAGES', payload: messages })
    }
    loadMessages()
  }, [state.activeSessionId])

  const createSession = useCallback(async () => {
    const id = await db.sessions.add({
      title: 'New Chat',
      createdAt: new Date(),
      updatedAt: new Date(),
      profileId: 1, // TODO: Get from profile context
    })

    const newSession = await db.sessions.get(id)
    if (newSession) {
      dispatch({
        type: 'SET_SESSIONS',
        payload: [newSession, ...state.sessions],
      })
      dispatch({ type: 'SET_ACTIVE_SESSION', payload: id })
    }
    return id
  }, [state.sessions])

  const deleteSession = useCallback(async (id: number) => {
    await db.sessions.delete(id)
    await db.messages.where('sessionId').equals(id).delete()
    dispatch({ type: 'DELETE_SESSION', payload: id })
  }, [])

  const setActiveSessionId = useCallback((id: number | null) => {
    dispatch({ type: 'SET_ACTIVE_SESSION', payload: id })
  }, [])

  const renameSession = useCallback(async (id: number, title: string) => {
    await db.sessions.update(id, {
      title,
      updatedAt: new Date(),
    })
    dispatch({
      type: 'UPDATE_SESSION',
      payload: { id, updates: { title, updatedAt: new Date() } },
    })
  }, [])

  const sendMessage = useCallback(
    async (content: string) => {
      let sessionId = state.activeSessionId
      if (!sessionId) {
        sessionId = await createSession()
        dispatch({ type: 'SET_ACTIVE_SESSION', payload: sessionId })
      }
      if (!sessionId) return

      dispatch({ type: 'SET_LOADING', payload: true })
      try {
        // Create and add user message
        const userMessage: ChatMessage = {
          sessionId,
          role: 'user',
          content,
          createdAt: new Date(),
        }
        await db.messages.add(userMessage)
        dispatch({ type: 'ADD_MESSAGE', payload: userMessage })

        // Update session
        await db.sessions.update(sessionId, {
          lastMessage: content,
          updatedAt: new Date(),
        })
        dispatch({
          type: 'UPDATE_SESSION',
          payload: {
            id: sessionId,
            updates: { lastMessage: content, updatedAt: new Date() },
          },
        })

        // Create and add loading assistant message
        const loadingMessage: ChatMessage = {
          sessionId,
          role: 'assistant',
          content: '',
          createdAt: new Date(),
          isLoading: true,
          notes: [],
        }
        await db.messages.add(loadingMessage)
        dispatch({ type: 'ADD_MESSAGE', payload: loadingMessage })

        // Get AI response
        const response = await aiService.chat([...state.messages, userMessage])
        if (!response) {
          // Remove loading message if no response
          await db.messages.delete(loadingMessage.id!)
          dispatch({ type: 'DELETE_MESSAGE', payload: loadingMessage.id! })
          throw new Error('No response from AI service')
        }

        // Update the loading message with actual response
        const assistantMessage: ChatMessage = {
          ...loadingMessage,
          content: response.message,
          isLoading: false,
          notes: response.notes,
        }
        await db.messages.update(loadingMessage.id!, assistantMessage)
        dispatch({
          type: 'UPDATE_MESSAGE',
          payload: { id: loadingMessage.id!, updates: assistantMessage },
        })

        if (response.notes) {
          playGuitarNotes(response.notes)
        }
      } catch {
        const errorMessage: ChatMessage = {
          sessionId,
          role: 'assistant',
          content: 'Sorry, I encountered an error. Please try again.',
          createdAt: new Date(),
          isLoading: false,
          notes: [],
        }
        await db.messages.add(errorMessage)
        dispatch({ type: 'ADD_MESSAGE', payload: errorMessage })
      } finally {
        dispatch({ type: 'SET_LOADING', payload: false })
      }
    },
    [state.activeSessionId, state.messages, createSession],
  )

  return (
    <ChatContext.Provider
      value={{
        activeSessionId: state.activeSessionId,
        sessions: state.sessions,
        messages: state.messages,
        isLoading: state.isLoading,
        sendMessage,
        createSession,
        deleteSession,
        setActiveSessionId,
        renameSession,
      }}
    >
      {children}
    </ChatContext.Provider>
  )
}

export function useChat() {
  const context = useContext(ChatContext)
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider')
  }
  return context
}
