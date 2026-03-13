import fs from 'node:fs'
import path from 'node:path'

import { editProfileSchema } from '@/features/profile/edit-profile/lib/editProfileFormValues'
import { describe, expect, it } from 'vitest'

const readSource = (relativePath: string) =>
  fs.readFileSync(path.join(process.cwd(), relativePath), 'utf8')

const findIssueMessage = (
  issues: Array<{ message: string; path: Array<string | number> }>,
  field: string
) => issues.find(issue => issue.path[0] === field)?.message

describe('PROFILE-UC1-FORM-VALIDATION', () => {
  it('accepts valid profile payload', () => {
    const result = editProfileSchema.safeParse({
      userName: 'valid_user',
      firstName: 'Иван',
      lastName: 'Ivanov',
      date_of_birth: new Date('2000-01-01'),
      country: 'Armenia',
      city: 'Yerevan',
      region: 'ER',
      aboutMe: 'Hello world!',
      detectLocation: '',
    })

    expect(result.success).toBe(true)
  })

  it('rejects too short username', () => {
    const result = editProfileSchema.safeParse({
      userName: 'usr',
      firstName: 'John',
      lastName: 'Doe',
    })

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(findIssueMessage(result.error.issues, 'userName')).toBe('Min length is 6 symbols')
    }
  })

  it('rejects about me longer than 200 characters', () => {
    const result = editProfileSchema.safeParse({
      userName: 'valid_user',
      firstName: 'John',
      lastName: 'Doe',
      aboutMe: 'a'.repeat(201),
    })

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(findIssueMessage(result.error.issues, 'aboutMe')).toBe('Max length is 200 symbols')
    }
  })

  it('rejects age under 13', () => {
    const under13 = new Date()

    under13.setFullYear(under13.getFullYear() - 12)

    const result = editProfileSchema.safeParse({
      userName: 'valid_user',
      firstName: 'John',
      lastName: 'Doe',
      date_of_birth: under13,
    })

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(findIssueMessage(result.error.issues, 'date_of_birth')).toBe('too_young')
    }
  })
})

describe('PROFILE-UC2-AVATAR-UPLOAD-CONSTRAINTS', () => {
  it('keeps avatar upload dropzone limits and error text', () => {
    const source = readSource('src/features/profile/avatar-upload/model/useAvatarUpload.ts')

    expect(source).toContain('maxSize: 10 * 1024 * 1024')
    expect(source).toContain("'image/jpeg'")
    expect(source).toContain("'image/png'")
    expect(source).toContain('The photo must be less than 10 Mb and have JPEG or PNG format')
  })

  it('keeps under-13 policy text with privacy link', () => {
    const source = readSource('src/features/legal/AgePolicyError.tsx')

    expect(source).toContain('A user under 13 cannot create a profile.')
    expect(source).toContain('Privacy Policy')
  })
})
