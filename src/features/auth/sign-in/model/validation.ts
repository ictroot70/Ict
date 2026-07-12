import { z } from 'zod'

export const signInSchema = z.object({
  email: z
    .string()
    .toLowerCase()
    .trim()
    .min(1, { message: 'Email is required' })
    .email({ message: 'The email must match the format example@example.com' }),
  password: z.string().trim().min(1, { message: 'Password is required' }),
})
export type LoginFields = z.infer<typeof signInSchema>
