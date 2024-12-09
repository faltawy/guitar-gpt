import { useState, useRef, useEffect } from 'react'
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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Label } from '@/components/ui/label'
import { db } from '@/lib/db'
import { Camera } from 'lucide-react'
import { useProfile } from '@/contexts/profile-context'

export function OnboardingDialog() {
  const { apiKey, setApiKey } = useSettings()
  const { profile, isLoading } = useProfile()
  const [key, setKey] = useState(apiKey || '')
  const [name, setName] = useState('')
  const [avatar, setAvatar] = useState<string>('')
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Don't show dialog while checking initial profile state
  if (isLoading) return null

  const handleSubmit = async () => {
    // Only validate API key if it's not already set
    if (!apiKey) {
      if (!key.trim()) {
        setError('API key is required')
        return
      }

      // Basic validation that it starts with "sk-"
      if (!key.startsWith('sk-')) {
        setError('Invalid API key format')
        return
      }
    }

    if (!name.trim()) {
      setError('Name is required')
      return
    }

    try {
      // Save profile to IndexedDB
      await db.profiles.add({
        name: name.trim(),
        avatar: avatar || undefined,
        createdAt: new Date(),
        updatedAt: new Date(),
      })

      // Only update API key if it's changed
      if (key !== apiKey) {
        setApiKey(key.trim())
      }
    } catch (err) {
      console.error('Error saving profile:', err)
      setError('Failed to save profile')
    }
  }

  const handleAvatarClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setAvatar(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  // Show dialog if either API key or profile is missing
  const showDialog = !apiKey || !profile

  return (
    <Dialog open={showDialog} modal>
      <DialogContent
        className="sm:max-w-md"
        onPointerDownOutside={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>Welcome to GuitarGPT</DialogTitle>
          <DialogDescription>
            {!profile
              ? 'To get started, please create your profile.'
              : !apiKey
                ? 'Please enter your OpenAI API key to continue.'
                : 'Please complete your profile setup.'}
            Your information will be stored locally
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-6">
          {!profile && (
            <div className="flex flex-col items-center gap-4">
              <div className="relative">
                <Avatar
                  className="h-20 w-20 cursor-pointer"
                  onClick={handleAvatarClick}
                >
                  <AvatarImage src={avatar} />
                  <AvatarFallback className="bg-primary/10">
                    {avatar ? (
                      name[0]?.toUpperCase()
                    ) : (
                      <Camera className="h-8 w-8" />
                    )}
                  </AvatarFallback>
                </Avatar>
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept="image/*"
                  onChange={handleFileChange}
                />
              </div>
              <div className="w-full space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  placeholder="Enter your name"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value)
                    setError(null)
                  }}
                />
              </div>
            </div>
          )}

          {!apiKey && (
            <div className="space-y-2">
              <Label htmlFor="apiKey">OpenAI API Key</Label>
              <Input
                id="apiKey"
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
              <p className="text-xs text-muted-foreground">
                Get your API key from{' '}
                <a
                  href="https://platform.openai.com/api-keys"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  OpenAI's dashboard
                </a>
              </p>
            </div>
          )}

          {error && <p className="text-sm text-destructive">{error}</p>}
          <Button onClick={handleSubmit}>
            {!profile
              ? 'Create Profile'
              : !apiKey
                ? 'Save API Key'
                : 'Continue'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
