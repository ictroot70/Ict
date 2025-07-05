import { z } from 'zod'

export const signInSchema = z.object({
  email: z
    .string()
    .min(3, { message: 'Email is required' })
    .email({ message: 'This is not a valid email.' }),
  password: z.string(),
})
export type LoginFields = z.infer<typeof signInSchema>
