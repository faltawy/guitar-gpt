import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useSettings } from '@/lib/stores/settings'

export function ApiKeyDialog() {
  const { apiKey, setApiKey } = useSettings()
  const [key, setKey] = useState('')
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async () => {
    if (!key.trim()) {
      setError('API key is required')
      return
    }

    // Basic validation that it starts with "sk-"
    if (!key.startsWith('sk-')) {
      setError('Invalid API key format')
      return
    }

    setApiKey(key.trim())
  }

  return (
    <Dialog open={!apiKey} modal>
      <DialogContent
        className="sm:max-w-md"
        onPointerDownOutside={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>Enter your OpenAI API Key</DialogTitle>
          <DialogDescription>
            Your API key will be stored locally and never sent to our servers.
            You can get your API key from{' '}
            <a
              href="https://platform.openai.com/api-keys"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              OpenAI's dashboard
            </a>
            .
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          <Input
            placeholder="sk-..."
            value={key}
            onChange={(e) => {
              setKey(e.target.value)
              setError(null)
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleSubmit()
              }
            }}
          />
          {error && <p className="text-sm text-destructive">{error}</p>}
          <Button onClick={handleSubmit}>Save API Key</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
