import { z } from 'zod'

import { passwordSchema } from './passwordSchema'

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
