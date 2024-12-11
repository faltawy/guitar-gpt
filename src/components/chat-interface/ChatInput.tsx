import React from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Textarea } from '../ui/textarea'
import { SendHorizonal } from 'lucide-react'

interface ChatInputProps {
  onSubmit: (message: string) => void
  disabled?: boolean
}

const SUGGESTED_QUESTIONS = [
  'Play a C major chord',
  'Can you play happy birthday?',
  'Play some jazz chords',
  'Teach me basic guitar chords',
  'Explain music scales',
  'Show me some fingerpicking patterns',
  'What are power chords?',
  'Teach me chord progressions',
]

export function ChatInput({ onSubmit, disabled }: ChatInputProps) {
  const [message, setMessage] = React.useState('')

  return (
    <Card className="p-4 mt-auto">
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap gap-2">
          {SUGGESTED_QUESTIONS.map((question) => (
            <Button
              key={question}
              variant="outline"
              size="sm"
              onClick={() => onSubmit(question)}
              disabled={disabled}
            >
              {question}
            </Button>
          ))}
        </div>

        <div className="flex gap-2">
          <Textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Ask me anything about guitar..."
            className="flex-1"
            disabled={disabled}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                if (message.trim()) {
                  onSubmit(message)
                  setMessage('')
                }
              }
            }}
          />
          <Button
            onClick={() => {
              if (message.trim()) {
                onSubmit(message)
                setMessage('')
              }
            }}
            disabled={disabled || !message.trim()}
          >
            <SendHorizonal className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </Card>
  )
}
