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

  it('rejects username with unsupported symbols', () => {
    const result = editProfileSchema.safeParse({
      userName: 'user!@#',
      firstName: 'John',
      lastName: 'Doe',
    })

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(findIssueMessage(result.error.issues, 'userName')).toBe(
        'Username can contain only letters, numbers, _ and -'
      )
    }
  })

  it('rejects first name longer than 50 chars', () => {
    const result = editProfileSchema.safeParse({
      userName: 'valid_user',
      firstName: 'a'.repeat(51),
      lastName: 'Doe',
    })

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(findIssueMessage(result.error.issues, 'firstName')).toBe('Max length is 50 symbols')
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

describe('PROFILE-SWAGGER-API-CONTRACT', () => {
  it('keeps profile endpoints map aligned with swagger', () => {
    const source = readSource('src/shared/api/api-routes.ts')

    expect(source).toContain("GET: '/v1/users/profile'")
    expect(source).toContain("UPDATE: '/v1/users/profile'")
    expect(source).toContain("DELETE: '/v1/users/profile'")
    expect(source).toContain("UPLOAD_AVATAR: '/v1/users/profile/avatar'")
    expect(source).toContain("DELETE_AVATAR: '/v1/users/profile/avatar'")
    expect(source).toContain('DELETE_BY_ID: (id: number) => `/v1/users/profile/${id}`')
  })

  it('keeps profile API methods and avatar operations aligned with swagger', () => {
    const source = readSource('src/entities/profile/api/profileApi.ts')

    expect(source).toContain('url: API_ROUTES.PROFILE.GET')
    expect(source).toContain("method: 'PUT'")
    expect(source).toContain('url: API_ROUTES.PROFILE.UPDATE')
    expect(source).toContain("method: 'DELETE'")
    expect(source).toContain('url: API_ROUTES.PROFILE.DELETE')
    expect(source).toContain("method: 'POST'")
    expect(source).toContain('url: API_ROUTES.PROFILE.UPLOAD_AVATAR')
    expect(source).toContain('url: API_ROUTES.PROFILE.DELETE_AVATAR')
  })

  it('keeps dateOfBirth mapping for update profile payload as ISO datetime or null', () => {
    const source = readSource('src/features/profile/edit-profile/lib/formDataMappers.ts')

    expect(source).toContain('dateOfBirth: string | null')
    expect(source).toContain('data.date_of_birth instanceof Date')
    expect(source).toContain('data.date_of_birth.toISOString()')
    expect(source).toContain(': null')
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
