import fs from 'node:fs'
import path from 'node:path'

import { describe, expect, it } from 'vitest'

const readSource = (relativePath: string) =>
  fs.readFileSync(path.join(process.cwd(), relativePath), 'utf8')

describe('AUTH-SIGNUP-NAVIGATION', () => {
  it('keeps legal links in same tab and preserves sign-up draft logic on route change', () => {
    const agreementSource = readSource('src/features/auth/sign-up/ui/AgreementLabel.tsx')
    const signUpModelSource = readSource('src/features/auth/sign-up/model/useSignUp.tsx')

    expect(agreementSource).not.toContain("target={'_blank'}")
    expect(signUpModelSource).toContain('let signUpDraft')
    expect(signUpModelSource).toContain('const subscription = form.watch')
  })
})
