import { z } from 'zod'

export const signInSchema = z.object({
  email: z
    .string()
    .toLowerCase()
    .trim()
    .min(3, { message: 'Email is required' })
    .email({ message: 'This is not a valid email.' }),
  password: z.string().trim().min(1, { message: 'Password is required' }),
})
export type LoginFields = z.infer<typeof signInSchema>
