import { z } from 'zod'

export const forgotPasswordSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Invalid email address'),
  recaptcha: z.string().optional(),
})

export type ForgotPasswordInputs = z.infer<typeof forgotPasswordSchema>
