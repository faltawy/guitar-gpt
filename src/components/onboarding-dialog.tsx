import { useRef } from 'react'
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
import { Camera } from 'lucide-react'
import { useProfile } from '@/contexts/profile-context'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  onboardingSchema,
  type OnboardingFormValues,
} from '@/lib/schemas/onboarding-schema'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { db } from '@/lib/db'

export function OnboardingDialog() {
  const { apiKey, setApiKey } = useSettings()
  const { profile, isLoading } = useProfile()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const form = useForm<OnboardingFormValues>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      name: '',
      apiKey: apiKey || '',
      avatar: '',
    },
  })

  // Don't show dialog while checking initial profile state
  if (isLoading) return null

  const onSubmit = async (values: OnboardingFormValues) => {
    try {
      if (!profile) {
        await db.profiles.add({
          name: values.name.trim(),
          avatar: values.avatar,
          createdAt: new Date(),
          updatedAt: new Date(),
        })
      }

      if (values.apiKey) {
        setApiKey(values.apiKey.trim())
      }

      window.location.reload()
    } catch (err) {
      console.error('Error saving profile:', err)
      form.setError('root', {
        type: 'submit',
        message: 'Failed to save profile',
      })
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
        form.setValue('avatar', reader.result as string)
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

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {!profile && (
              <div className="flex flex-col items-center gap-4">
                <div className="relative">
                  <Avatar
                    className="h-20 w-20 cursor-pointer"
                    onClick={handleAvatarClick}
                  >
                    <AvatarImage src={form.watch('avatar')} />
                    <AvatarFallback className="bg-primary/10">
                      {form.watch('avatar') ? (
                        form.watch('name')[0]?.toUpperCase()
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

                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem className="w-full">
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter your name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}

            {!apiKey && (
              <FormField
                control={form.control}
                name="apiKey"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>OpenAI API Key</FormLabel>
                    <FormControl>
                      <Input placeholder="sk-..." {...field} />
                    </FormControl>
                    <FormMessage />
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
                  </FormItem>
                )}
              />
            )}

            {form.formState.errors.root && (
              <p className="text-sm text-destructive">
                {form.formState.errors.root.message}
              </p>
            )}

            <Button type="submit" className="w-full">
              {!profile
                ? 'Create Profile'
                : !apiKey
                  ? 'Save API Key'
                  : 'Continue'}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
