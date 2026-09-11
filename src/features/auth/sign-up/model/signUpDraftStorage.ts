import { SignUpFormData } from './validationSchemas'

const SIGN_UP_DRAFT_STORAGE_KEY = 'ict-sign-up-draft'

export type SignUpDraft = Pick<SignUpFormData, 'username' | 'email' | 'agreement'>

const isBrowser = () => typeof window !== 'undefined'

export const getSignUpDraft = (): SignUpDraft | null => {
  if (!isBrowser()) {
    return null
  }

  const rawDraft = window.sessionStorage.getItem(SIGN_UP_DRAFT_STORAGE_KEY)

  if (!rawDraft) {
    return null
  }

  try {
    const draft = JSON.parse(rawDraft) as Partial<SignUpDraft>

    return {
      username: typeof draft.username === 'string' ? draft.username : '',
      email: typeof draft.email === 'string' ? draft.email : '',
      agreement: typeof draft.agreement === 'boolean' ? draft.agreement : false,
    }
  } catch {
    window.sessionStorage.removeItem(SIGN_UP_DRAFT_STORAGE_KEY)

    return null
  }
}

export const saveSignUpDraft = (draft: SignUpDraft): void => {
  if (!isBrowser()) {
    return
  }

  window.sessionStorage.setItem(
    SIGN_UP_DRAFT_STORAGE_KEY,
    JSON.stringify({
      username: draft.username,
      email: draft.email,
      agreement: draft.agreement,
    })
  )
}

export const clearSignUpDraft = (): void => {
  if (!isBrowser()) {
    return
  }

  window.sessionStorage.removeItem(SIGN_UP_DRAFT_STORAGE_KEY)
}
