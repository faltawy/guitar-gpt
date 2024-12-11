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
]

export function ChatInput({ onSubmit, disabled }: ChatInputProps) {
  const [message, setMessage] = React.useState('')
  const [showSuggestions, setShowSuggestions] = React.useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (message.trim()) {
      onSubmit(message.trim())
      setMessage('')
      setShowSuggestions(false)
    }
  }

  const handleSuggestionClick = (suggestion: string) => {
    onSubmit(suggestion)
    setShowSuggestions(false)
  }

  return (
    <div className="container">
      <form onSubmit={handleSubmit} className="flex flex-col gap-2 relative">
        {showSuggestions && (
          <div className="absolute bottom-full w-full p-2">
            <div className="flex flex-wrap gap-2">
              {SUGGESTED_QUESTIONS.map((suggestion) => (
                <Button
                  key={suggestion}
                  variant="secondary"
                  size="sm"
                  onClick={() => handleSuggestionClick(suggestion)}
                >
                  {suggestion}
                </Button>
              ))}
            </div>
          </div>
        )}
        <Textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onFocus={() => setShowSuggestions(true)}
          placeholder="Ask me to play something..."
          className="resize-none"
          disabled={disabled}
        />
        <Button
          type="submit"
          size="icon"
          disabled={disabled || !message.trim()}
          className="absolute bottom-2 right-2"
        >
          <SendHorizonal className="w-4 h-4" />
        </Button>
      </form>
    </div>
  )
}
