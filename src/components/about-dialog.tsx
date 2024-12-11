import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import ReactMarkdown from 'react-markdown'

const aboutContent = `
# Guitar GPT

An AI-powered guitar companion that helps you learn and explore music.

## Features

- 🎸 Play guitar melodies and progressions
- 🎵 Learn music theory concepts
- 🤖 AI-powered musical assistance
- 🌙 Dark mode support
- 💾 Conversation history
`

interface AboutDialogProps {
  trigger?: React.ReactNode
}

export function AboutDialog({ trigger }: AboutDialogProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        {trigger || <Button variant="outline">About</Button>}
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>About Guitar GPT</DialogTitle>
          <DialogDescription>An AI-powered guitar companion</DialogDescription>
        </DialogHeader>
        <ScrollArea className="max-h-[60vh]">
          <ReactMarkdown className="prose prose-sm dark:prose-invert">
            {aboutContent}
          </ReactMarkdown>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
