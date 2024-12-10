import { useEffect, useRef } from 'react'
import { useChat } from '@/contexts/chat-context'
import { aiService } from '@/lib/services/ai-service'
import { db } from '@/lib/db'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'
import { Skeleton } from '../ui/skeleton'
import { Music, PlayCircle } from 'lucide-react'
import Markdown from 'react-markdown'
import { Button } from '../ui/button'
import { playGuitarNotes } from '@/lib/music-producer'
import type { ChatMessage } from '@/lib/db'
import remarkGfm from 'remark-gfm'
import { NoteVisualizer } from './NoteVisualizer'

type Props = {
  messages: ChatMessage[]
}

export function MessagesContainer({ messages }: Props) {
  const bottomRef = useRef<HTMLDivElement>(null)
  const { activeSessionId } = useChat()

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  return (
    <div className="flex-1 overflow-hidden relative">
      <div className="absolute inset-0 overflow-y-auto">
        <div className="mx-auto flex flex-col gap-6 p-4 max-w-3xl w-full">
          {messages.length === 0 ? (
            <EmptyState />
          ) : (
            messages.map((message, i) => (
              <MessageItem key={i} message={message} />
            ))
          )}
          <div ref={bottomRef} />
        </div>
      </div>
    </div>
  )
}

function EmptyState() {
  return (
    <div className="flex h-[50vh] flex-col items-center justify-center gap-2 text-center">
      <Music className="h-12 w-12 text-muted-foreground" />
      <h2 className="text-lg font-semibold">Welcome to Guitar GPT</h2>
      <p className="text-sm text-muted-foreground">
        Ask me to play any melody or help you with music theory!
      </p>
    </div>
  )
}

function UserMessageItem({
  message,
}: { message: Extract<ChatMessage, { role: 'user' }> }) {
  return (
    <div className="flex items-start gap-3 justify-end">
      <div className="bg-primary/10 rounded-lg px-4 py-2 max-w-[85%]">
        {message.content}
      </div>
      <Avatar>
        <AvatarFallback>U</AvatarFallback>
      </Avatar>
    </div>
  )
}

function AssistantMessageItem({
  message,
}: { message: Extract<ChatMessage, { role: 'assistant' }> }) {
  const hasNotes = message.notes && message.notes.length > 0
  const handleReplay = async () => {
    if (message.notes) {
      playGuitarNotes(message.notes)
    }
  }

  return (
    <div className={cn('flex items-start gap-3')}>
      <Avatar>
        <AvatarImage src="/guitar-bot.png" />
        <AvatarFallback>GB</AvatarFallback>
      </Avatar>
      <div className="flex flex-col gap-2 max-w-[85%]">
        <div className="bg-secondary/10 rounded-lg px-4 py-2">
          <Markdown
            remarkPlugins={[remarkGfm]}
            className="prose prose-invert prose-sm"
          >
            {message.content}
          </Markdown>
          {message.isLoading && <LoadingDots />}
        </div>
        {hasNotes && (
          <NoteVisualizer
            notes={message.notes}
            onReplay={handleReplay}
            isPlaying={message.isLoading}
          />
        )}
      </div>
    </div>
  )
}

function MessageItem({ message }: { message: ChatMessage }) {
  if (message.role === 'user') {
    return <UserMessageItem message={message} />
  }
  return <AssistantMessageItem message={message} />
}

function LoadingDots() {
  return (
    <div className="flex gap-1">
      <Skeleton className="h-2 w-2 rounded-full" />
      <Skeleton className="h-2 w-2 rounded-full" />
      <Skeleton className="h-2 w-2 rounded-full" />
    </div>
  )
}
