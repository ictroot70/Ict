import { PASSWORD_ALLOWED_CHARACTERS, PASSWORD_REGEX } from '@/shared/constant'
import { z } from 'zod'

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
