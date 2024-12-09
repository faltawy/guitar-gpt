import { useCallback, useRef, useEffect } from 'react'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Send } from 'lucide-react'

type Props = {
  onSubmit: (message: string) => void
  disabled?: boolean
}

export function ChatInput({ onSubmit, disabled }: Props) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const handleSubmit = useCallback(() => {
    if (!textareaRef.current?.value.trim()) return
    onSubmit(textareaRef.current.value)
    textareaRef.current.value = ''
    textareaRef.current.style.height = 'auto'
  }, [onSubmit])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault()
        handleSubmit()
      }
    },
    [handleSubmit],
  )

  return (
    <div className="mx-auto shrink-0 w-full max-w-3xl p-4">
      <div className="relative flex items-end gap-2">
        <Textarea
          ref={textareaRef}
          placeholder="Ask me to play something..."
          className="min-h-[60px]  w-full resize-none bg-background pr-12"
          onKeyDown={handleKeyDown}
          disabled={disabled}
          rows={1}
        />
        <Button
          size="icon"
          onClick={handleSubmit}
          disabled={disabled}
          className="absolute bottom-2 right-2"
        >
          <Send className="h-4 w-4" />
          <span className="sr-only">Send message</span>
        </Button>
      </div>
      <div className="mt-4 text-xs text-muted-foreground">
        Press <kbd className="rounded bg-muted px-1">Enter</kbd> to send,{' '}
        <kbd className="rounded bg-muted px-1">Shift + Enter</kbd> for new line
      </div>
    </div>
  )
}
