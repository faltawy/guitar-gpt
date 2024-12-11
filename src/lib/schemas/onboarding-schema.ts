import * as z from 'zod'

export const onboardingSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  apiKey: z.string().refine((val) => {
    return val.startsWith('sk-')
  }, 'Invalid API key format'),
  avatar: z.string().optional(),
})

export type OnboardingFormValues = z.infer<typeof onboardingSchema>
