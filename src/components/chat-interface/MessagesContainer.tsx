import { useEffect, useRef, useState } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'
import { Skeleton } from '../ui/skeleton'
import { Music } from 'lucide-react'
import Markdown from 'react-markdown'
import type { ChatMessage } from '@/lib/db'
import remarkGfm from 'remark-gfm'
import { NoteVisualizer } from './NoteVisualizer'
import { Note, playGuitarNotes } from '@/lib/music-producer'

type Props = {
  messages: ChatMessage[]
}

export function MessagesContainer({ messages }: Props) {
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  return (
    <div className="flex-1 overflow-hidden relative container">
      <div className="absolute inset-0 overflow-y-auto">
        <div className="mx-auto flex flex-col gap-6 p-4 w-full">
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
  const [isPlaying, setIsPlaying] = useState(false)

  const handleReplay = async (notes: Note[]) => {
    if (isPlaying) return
    setIsPlaying(true)
    try {
      await playGuitarNotes(notes)
    } finally {
      setIsPlaying(false)
    }
  }

  return (
    <div className="flex items-start gap-3">
      <Avatar>
        <AvatarImage src="/guitar-bot.png" />
        <AvatarFallback>GB</AvatarFallback>
      </Avatar>
      <div className="flex flex-col gap-2 max-w-[85%]">
        <div className="bg-secondary/10 rounded-lg px-4 py-2">
          {message.isLoading ? (
            <LoadingDots />
          ) : (
            <div className="flex flex-col gap-2">
              {message.content.map((content, index) => {
                if (content.kind === 'message') {
                  return (
                    <Markdown
                      remarkPlugins={[remarkGfm]}
                      className="prose prose-invert prose-sm"
                      key={index}
                    >
                      {content.message}
                    </Markdown>
                  )
                }
                if (content.kind === 'notes') {
                  return (
                    <NoteVisualizer
                      key={index}
                      notes={content.notes}
                      onReplay={() => handleReplay(content.notes)}
                      isPlaying={isPlaying}
                    />
                  )
                }
              })}
            </div>
          )}
        </div>
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
