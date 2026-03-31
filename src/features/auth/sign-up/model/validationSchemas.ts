import {
  PASSWORD_ALLOWED_CHARACTERS,
  PASSWORD_COMPLEXITY_REQUIREMENTS,
  PASSWORD_REGEX,
} from '@/shared/constant'
import { z } from 'zod'

export const signUpSchema = z
  .object({
    username: z
      .string()
      .min(6, 'Minimum number of characters 6')
      .max(30, 'Maximum number of characters 30')
      .regex(/^[a-zA-Z0-9_-]*$/, 'Username can contain only: 0-9, A-Z, a-z, _, -'),

    email: z.string().email('The email must match the format example@example.com'),

    password: z
      .string()
      .min(6, 'Minimum number of characters 6')
      .max(20, 'Maximum number of characters 20')
      .regex(PASSWORD_REGEX, {
        message: `Password must contain ${PASSWORD_COMPLEXITY_REQUIREMENTS}. Allowed symbols: ${PASSWORD_ALLOWED_CHARACTERS}`,
      }),

    passwordConfirm: z.string(),

    agreement: z.boolean().refine(val => val, {
      message: 'You must agree to the Terms of Service and Privacy Policy',
    }),
  })
  .refine(data => data.password === data.passwordConfirm, {
    message: 'Passwords must match',
    path: ['passwordConfirm'],
  })

export type SignUpFormData = z.infer<typeof signUpSchema>
