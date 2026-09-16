import { afterEach, describe, expect, it } from 'vitest'

import { clearSignUpDraft, getSignUpDraft, saveSignUpDraft } from './signUpDraftStorage'

const SIGN_UP_DRAFT_STORAGE_KEY = 'ict-sign-up-draft'

describe('signUpDraftStorage', () => {
  afterEach(() => {
    window.sessionStorage.clear()
  })

  it('saves and restores non-sensitive sign up fields', () => {
    saveSignUpDraft({
      username: 'alex123',
      email: 'alex@example.com',
      agreement: true,
    })

    expect(getSignUpDraft()).toEqual({
      username: 'alex123',
      email: 'alex@example.com',
      agreement: true,
    })
  })

  it('does not persist password fields', () => {
    saveSignUpDraft({
      username: 'alex123',
      email: 'alex@example.com',
      agreement: true,
    })

    const rawDraft = window.sessionStorage.getItem(SIGN_UP_DRAFT_STORAGE_KEY)

    expect(rawDraft).not.toContain('password')
    expect(rawDraft).not.toContain('passwordConfirm')
  })

  it('clears the stored draft', () => {
    saveSignUpDraft({
      username: 'alex123',
      email: 'alex@example.com',
      agreement: true,
    })

    clearSignUpDraft()

    expect(getSignUpDraft()).toBeNull()
  })

  it('removes invalid stored draft data', () => {
    window.sessionStorage.setItem(SIGN_UP_DRAFT_STORAGE_KEY, '{')

    expect(getSignUpDraft()).toBeNull()
    expect(window.sessionStorage.getItem(SIGN_UP_DRAFT_STORAGE_KEY)).toBeNull()
  })
})
