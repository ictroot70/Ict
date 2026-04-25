import { z } from 'zod'

const usernameRegex = /^[a-zA-Z0-9_-]+$/
const nameRegex = /^[a-zA-Zа-яА-Я]+$/u
const aboutMeRegex = /^[\s\S]{0,200}$/
const minAge = 13
const isAtLeast13 = (date: Date) => {
  const today = new Date()
  const age =
    today.getFullYear() -
    date.getFullYear() -
    (today < new Date(today.getFullYear(), date.getMonth(), date.getDate()) ? 1 : 0)

  return age >= minAge
}

export const editProfileSchema = z
  .object({
    userName: z
      .string()
      .min(6, 'Min length is 6 symbols')
      .max(30, 'Max length is 30 symbols')
      .regex(usernameRegex, 'Username can contain only letters, numbers, _ and -'),

    firstName: z
      .string()
      .min(1, 'Required')
      .max(50, 'Max length is 50 symbols')
      .regex(nameRegex, 'First name can contain only letters'),

    lastName: z
      .string()
      .min(1, 'Required')
      .max(50, 'Max length is 50 symbols')
      .regex(nameRegex, 'Last name can contain only letters'),

    date_of_birth: z.date().refine(isAtLeast13, { message: 'too_young' }).optional(),

    country: z.string().optional(),
    city: z.string().optional(),
    region: z.string().optional(),

    aboutMe: z
      .string()
      .max(200, 'Max length is 200 symbols')
      .regex(aboutMeRegex, 'Invalid characters in About Me')
      .optional(),

    detectLocation: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.city && !data.country) {
      ctx.addIssue({
        path: ['city'],
        message: 'City cannot be selected without country',
        code: z.ZodIssueCode.custom,
      })
    }
  })

export type EditProfileFormValues = z.infer<typeof editProfileSchema>
