/* @vitest-environment node */

import { readFileSync } from 'node:fs'
import { join } from 'node:path'

import { describe, expect, it } from 'vitest'

const root = process.cwd()
const readSource = (path: string) => readFileSync(join(root, path), 'utf8')

describe('auth guest guard route contract', () => {
  it('keeps guest routes aligned with the global auth UI state', () => {
    const source = readSource('src/shared/guards/GuestGuard.tsx')

    expect(source).toContain('useAuthUiState')
    expect(source).toContain("status === 'authenticated'")
    expect(source).toContain('APP_ROUTES.PROFILE.ID(user.userId)')
    expect(source).toContain("status !== 'guest'")
  })

  it('guards login and registration without blocking token-driven auth pages', () => {
    const loginPage = readSource('src/app/(public)/auth/login/page.tsx')
    const registrationPage = readSource('src/app/(public)/auth/registration/page.tsx')
    const newPasswordPage = readSource('src/app/(public)/auth/new-password/page.tsx')
    const confirmationPage = readSource('src/app/(public)/auth/registration-confirmation/page.tsx')
    const emailExpiredPage = readSource('src/app/(public)/auth/email-expired/page.tsx')

    expect(loginPage).toContain('<GuestGuard>')
    expect(registrationPage).toContain('<GuestGuard>')
    expect(newPasswordPage).not.toContain('GuestGuard')
    expect(confirmationPage).not.toContain('GuestGuard')
    expect(emailExpiredPage).not.toContain('GuestGuard')
  })
})
