import fs from 'node:fs'
import path from 'node:path'

import { forgotPasswordSchema } from '@/features/auth/password-recovery/model/schemas/forgotPasswordSchema'
import { signInSchema } from '@/features/auth/sign-in/model/validation'
import { signUpSchema } from '@/features/auth/sign-up/model/validationSchemas'
import { APP_ROUTES } from '@/shared/constant'
import { describe, expect, it } from 'vitest'

const readSource = (relativePath: string) =>
  fs.readFileSync(path.join(process.cwd(), relativePath), 'utf8')

const getFieldIssueMessage = (
  issues: Array<{ message: string; path: Array<string | number> }>,
  field: string
) => issues.find(issue => issue.path[0] === field)?.message

describe('AUTH-UC1-FORM-VALIDATION', () => {
  it('accepts valid sign-up payload', () => {
    const result = signUpSchema.safeParse({
      username: 'user_123',
      email: 'user@example.com',
      password: 'Abc123!@',
      passwordConfirm: 'Abc123!@',
      agreement: true,
    })

    expect(result.success).toBe(true)
  })

  it('rejects invalid username length', () => {
    const result = signUpSchema.safeParse({
      username: 'abc',
      email: 'user@example.com',
      password: 'Abc123!@',
      passwordConfirm: 'Abc123!@',
      agreement: true,
    })

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(getFieldIssueMessage(result.error.issues, 'username')).toBe(
        'Minimum number of characters 6'
      )
    }
  })

  it('rejects password confirmation mismatch', () => {
    const result = signUpSchema.safeParse({
      username: 'user_123',
      email: 'user@example.com',
      password: 'Abc123!@',
      passwordConfirm: 'Different123!',
      agreement: true,
    })

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(getFieldIssueMessage(result.error.issues, 'passwordConfirm')).toBe(
        'Passwords must match'
      )
    }
  })

  it('requires agreement checkbox', () => {
    const result = signUpSchema.safeParse({
      username: 'user_123',
      email: 'user@example.com',
      password: 'Abc123!@',
      passwordConfirm: 'Abc123!@',
      agreement: false,
    })

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(getFieldIssueMessage(result.error.issues, 'agreement')).toBe(
        'You must agree to the Terms of Service and Privacy Policy'
      )
    }
  })
})

describe('AUTH-UC2-LOGIN-FLOW', () => {
  it('keeps auth routes stable', () => {
    expect(APP_ROUTES.AUTH.LOGIN).toBe('/auth/login')
    expect(APP_ROUTES.AUTH.REGISTRATION).toBe('/auth/registration')
    expect(APP_ROUTES.AUTH.PASSWORD_RECOVERY).toBe('/auth/password-recovery')
    expect(APP_ROUTES.AUTH.EMAIL_EXPIRED).toBe('/auth/email-expired')
  })

  it('rejects invalid login email', () => {
    const result = signInSchema.safeParse({
      email: 'wrong-email',
      password: '123456',
    })

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(getFieldIssueMessage(result.error.issues, 'email')).toBe('This is not a valid email.')
    }
  })
})

describe('AUTH-UC3-RECAPTCHA-FORGOT-PASSWORD', () => {
  it('requires valid email and allows recaptcha token field', () => {
    const valid = forgotPasswordSchema.safeParse({
      email: 'user@example.com',
      recaptcha: 'captcha-token',
    })

    expect(valid.success).toBe(true)

    const invalid = forgotPasswordSchema.safeParse({
      email: 'bad-email',
      recaptcha: '',
    })

    expect(invalid.success).toBe(false)
  })

  it('keeps reCAPTCHA widget and submit-gate logic in form', () => {
    const source = readSource('src/features/auth/password-recovery/ui/PasswordRecoveryForm.tsx')

    expect(source).toContain('<Recaptcha')
    expect(source).toContain('(!isEmailSent && !recaptchaValue)')
  })
})

describe('AUTH-UC4-LOGOUT-CONFIRMATION', () => {
  it('keeps confirmation text and yes/no actions in logout modal', () => {
    const source = readSource('src/widgets/Sidebar/components/LogoutModal/index.tsx')

    expect(source).toContain('Are you really want to log out of your account')
    expect(source).toContain("confirmButton={{ label: 'Yes'")
    expect(source).toContain("cancelButton={{ label: 'No'")
  })
})

describe('AUTH-UC5-OAUTH (optional_or_blocked)', () => {
  it('keeps OAuth route constants available for integration points', () => {
    expect(APP_ROUTES.AUTH.GOOGLE_LOGIN).toBe('/auth/google/login')
    expect(APP_ROUTES.AUTH.GITHUB_LOGIN).toBe('/auth/github/login')
  })
})
