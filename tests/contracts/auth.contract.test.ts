import fs from 'node:fs'
import path from 'node:path'

import { resolveNewPasswordError } from '@/features/auth/create-new-password/model/resolveNewPasswordError'
import { newPasswordSchema } from '@/features/auth/create-new-password/model/schemas/newPasswordSchema'
import { hasValidRecaptchaToken } from '@/features/auth/password-recovery/model/recaptcha'
import { forgotPasswordSchema } from '@/features/auth/password-recovery/model/schemas/forgotPasswordSchema'
import { resolvePostLoginRedirectPath } from '@/features/auth/sign-in/model/resolvePostLoginRedirect'
import { signInSchema } from '@/features/auth/sign-in/model/validation'
import { resolveSignUpError } from '@/features/auth/sign-up/model/resolveSignUpError'
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
      password: 'Abc12345!',
      passwordConfirm: 'Abc12345!',
      agreement: true,
    })

    expect(result.success).toBe(true)
  })

  it('rejects invalid username length', () => {
    const result = signUpSchema.safeParse({
      username: 'abc',
      email: 'user@example.com',
      password: 'Abc12345!',
      passwordConfirm: 'Abc12345!',
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
      password: 'Abc12345!',
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
      password: 'Abc12345!',
      passwordConfirm: 'Abc12345!',
      agreement: false,
    })

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(getFieldIssueMessage(result.error.issues, 'agreement')).toBe(
        'You must agree to the Terms of Service and Privacy Policy'
      )
    }
  })

  it('rejects password without required uppercase/lowercase/digit mix', () => {
    const result = signUpSchema.safeParse({
      username: 'user_123',
      email: 'user@example.com',
      password: 'onlylowercase',
      passwordConfirm: 'onlylowercase',
      agreement: true,
    })

    expect(result.success).toBe(false)
  })

  it('rejects password without required special character', () => {
    const result = signUpSchema.safeParse({
      username: 'user_123',
      email: 'user@example.com',
      password: 'Abc12345',
      passwordConfirm: 'Abc12345',
      agreement: true,
    })

    expect(result.success).toBe(false)
  })

  it('uses the same password policy for new-password flow', () => {
    const schema = newPasswordSchema()

    const validResult = schema.safeParse({
      password: 'Abc12345!',
      passwordConfirmation: 'Abc12345!',
    })
    const invalidResult = schema.safeParse({
      password: 'abc12345',
      passwordConfirmation: 'abc12345',
    })

    expect(validResult.success).toBe(true)
    expect(invalidResult.success).toBe(false)
  })

  it('maps new-password API validation error to password field and clear message', () => {
    const resolved = resolveNewPasswordError({
      status: 400,
      data: {
        messages: [
          {
            field: 'newPassword',
            message: 'Password must contain only Latin letters, numbers, and special characters.',
          },
        ],
      },
    })

    expect(resolved.shouldRedirectToEmailExpired).toBe(false)
    expect(resolved.fieldErrors).toEqual([
      {
        field: 'password',
        message: 'Password must include lowercase, uppercase, digit, and special character.',
      },
    ])
    expect(resolved.toastMessage).toBe(
      'Password must include lowercase, uppercase, digit, and special character.'
    )
  })

  it('maps expired recovery code error to email-expired redirect flow', () => {
    const resolved = resolveNewPasswordError({
      status: 400,
      data: {
        messages: [{ field: 'recoveryCode', message: 'Recovery code is expired' }],
      },
    })

    expect(resolved.shouldRedirectToEmailExpired).toBe(true)
    expect(resolved.fieldErrors).toEqual([])
    expect(resolved.toastMessage).toBe(
      'The recovery link is invalid or expired. Please request a new reset link.'
    )
  })

  it('maps signup API errors to current request toast and field errors', () => {
    const resolved = resolveSignUpError({
      status: 429,
      data: { messages: [] },
    })
    const resolvedFieldError = resolveSignUpError({
      status: 400,
      data: {
        messages: [{ field: 'userName', message: 'already exists' }],
      },
    })

    expect(resolved.toastMessage).toBe('Too many requests. Please wait a moment and try again.')
    expect(resolved.serverError).toBe('Too many requests. Please wait a moment and try again.')
    expect(resolvedFieldError.fieldErrors).toEqual([
      { field: 'username', message: 'User with this username is already registered' },
    ])
    expect(resolvedFieldError.toastMessage).toBe('Please check highlighted fields.')
  })

  it('keeps sign-up success close action on registration page (no forced login redirect)', () => {
    const source = readSource('src/features/auth/sign-up/ui/SignUpForm.tsx')

    expect(source).not.toContain('router.replace(APP_ROUTES.AUTH.LOGIN)')
    expect(source).toContain('form.reset()')
  })

  it('allows new-password flow without mandatory email query', () => {
    const source = readSource('src/features/auth/create-new-password/hooks/useCreateNewPassword.ts')

    expect(source).not.toContain('if (!urlCode || !urlEmail)')
    expect(source).toContain('if (!urlCode)')
    expect(source).toContain("mode: 'recovery'")
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

  it('accepts only safe internal post-login redirect targets', () => {
    const origin = 'https://ictroot.uk'

    expect(resolvePostLoginRedirectPath('/profile/1?from=home', origin)).toBe(
      '/profile/1?from=home'
    )
    expect(resolvePostLoginRedirectPath(' /feed ', origin)).toBe('/feed')
    expect(resolvePostLoginRedirectPath('https://evil.example/path', origin)).toBeNull()
    expect(resolvePostLoginRedirectPath('//evil.example/path', origin)).toBeNull()
    expect(resolvePostLoginRedirectPath('javascript:alert(1)', origin)).toBeNull()
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

  it('treats empty recaptcha token as invalid', () => {
    expect(hasValidRecaptchaToken(undefined)).toBe(false)
    expect(hasValidRecaptchaToken('')).toBe(false)
    expect(hasValidRecaptchaToken('   ')).toBe(false)
    expect(hasValidRecaptchaToken('valid-token')).toBe(true)
  })

  it('uses explicit mode query for email-expired flow and supports recovery mode', () => {
    const source = readSource('src/features/auth/email-expired/ui/EmailExpiredForm.tsx')

    expect(source).toContain("const modeParam = params?.get('mode')")
    expect(source).toContain('const hook = isRecoveryMode ? passwordRecovery : emailVerification')
    expect(source).not.toContain('const hook = urlEmail ? passwordRecovery : emailVerification')
  })
})

describe('AUTH-UC4-LOGOUT-CONFIRMATION', () => {
  it('keeps confirmation text and yes/no actions in logout modal', () => {
    const source = readSource('src/widgets/Sidebar/components/LogoutModal/index.tsx')

    expect(source).toContain('Are you really want to log out of your account')
    expect(source).toContain("confirmButton={{ label: 'Yes'")
    expect(source).toContain("cancelButton={{ label: 'No'")
  })

  it('does not show fake user-not-found toast on logout cancel', () => {
    const source = readSource('src/widgets/Sidebar/model/useLogoutHandler.ts')

    expect(source).not.toContain("User with this email doesn't exist")
  })
})

describe('AUTH-UC5-OAUTH (optional_or_blocked)', () => {
  it('keeps OAuth route constants available for integration points', () => {
    expect(APP_ROUTES.AUTH.GOOGLE_LOGIN).toBe('/auth/google/login')
    expect(APP_ROUTES.AUTH.GITHUB_LOGIN).toBe('/auth/github/login')
  })
})
