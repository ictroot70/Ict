import { z } from 'zod'
import { PASSWORD_ALLOWED_CHARACTERS, PASSWORD_REGEX } from './constants'

export const passwordSchema = () => {
  return z
    .string()
    .min(6, { message: 'Password must be at least 6 characters' })
    .max(20, { message: 'Password must be no more than 20 characters' })
    .regex(PASSWORD_REGEX, {
      message: `Password must contain: ${PASSWORD_ALLOWED_CHARACTERS}`,
    })
    .trim()
}

export const newPasswordSchema = () => {
  return z
    .object({
      password: passwordSchema(),
      passwordConfirmation: passwordSchema(),
    })
    .refine(values => values.password === values.passwordConfirmation, {
      message: 'The passwords must match',
      path: ['passwordConfirmation'],
    })
}

export type CreateNewPasswordInputs = z.infer<ReturnType<typeof newPasswordSchema>>
