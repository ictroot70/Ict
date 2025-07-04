import { z } from 'zod'

export const PASSWORD_PATTERN =
  /^(?=.*[0-9])(?=.*[A-Z])(?=.*[a-z])(?=.*[!"#$%&'()*+,\-./:;<=>?@[\\\]^_`{|}~])[0-9A-Za-z!"#$%&'()*+,\-./:;<=>?@[\\\]^_`{|}~]+$/

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, { message: 'This field has to be filled.' })
    .email('This is not a valid email.'),
  password: z
    .string()
    .min(6, { message: 'Password must be at least 6 characters' })
    .regex(PASSWORD_PATTERN, {
      message:
        'Password must include at least one uppercase latin letter, one lowercase latin letter, one number, and one special character.',
    }),
})

export type LoginFormData = z.infer<typeof loginSchema>
