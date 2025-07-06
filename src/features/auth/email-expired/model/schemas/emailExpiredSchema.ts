import { z } from 'zod'

export const emailExpiredSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Invalid email address'),
})

export type EmailExpiredInputs = z.infer<typeof emailExpiredSchema>
