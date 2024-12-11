import { ChatInput } from './ChatInput'
import { MessagesContainer } from './MessagesContainer'
import { ChatHeader } from './ChatHeader'
import { useChat } from '@/contexts/chat-context'

export function ChatInterface() {
  const { messages, sendMessage, isLoading } = useChat()

  return (
    <div className="flex flex-col h-full">
      <ChatHeader />
      <MessagesContainer messages={messages} />
      <ChatInput onSubmit={sendMessage} disabled={isLoading} />
    </div>
  )
}
