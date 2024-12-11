import { ChatInput } from './ChatInput'
import { MessagesContainer } from './MessagesContainer'
import { ChatHeader } from './ChatHeader'
import { useChat } from '@/contexts/chat-context'
import { GuitarPlayer } from '../GuitarPlayer'
import { useSettings } from '../../contexts/settings-context'

export function ChatInterface() {
  const { messages, sendMessage, isLoading } = useChat()
  const { settings } = useSettings()

  return (
    <div className="flex flex-col h-full">
      <ChatHeader />
      <MessagesContainer messages={messages} />
      <ChatInput onSubmit={sendMessage} disabled={isLoading} />
    </div>
  )
}
