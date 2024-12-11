import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { ChatInput } from './ChatInput'
import { MessagesContainer } from './MessagesContainer'
import { ChatHeader } from './ChatHeader'
import { useChat } from '@/contexts/chat-context'

export function ChatInterface() {
  const [showAudioError, setShowAudioError] = useState(false)
  const { messages, sendMessage, isLoading } = useChat()

  return (
    <div className="flex flex-col h-full">
      <ChatHeader />
      <MessagesContainer messages={messages} />
      <ChatInput
        onSubmit={sendMessage}
        disabled={isLoading}
        hasPreviousMessages={messages.length > 0}
      />

      <Dialog open={showAudioError} onOpenChange={setShowAudioError}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Audio Support Required</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p>
              Guitar GPT requires audio support to function properly. Please
              ensure:
            </p>
            <ul className="list-disc pl-4 space-y-2">
              <li>You are using a modern browser with audio support</li>
              <li>Your browser allows audio playback</li>
              <li>Your audio output device is properly connected</li>
            </ul>
            <p>
              You can still use the chat interface, but guitar playback will not
              be available.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
