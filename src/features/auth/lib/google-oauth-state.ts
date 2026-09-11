import { buildGoogleAuthUrl } from './oauth-auth-url'

const GOOGLE_OAUTH_STATE_STORAGE_KEY = 'google_oauth_state'
const GOOGLE_OAUTH_STATE_BYTES = 32

const generateGoogleOAuthState = () => {
  const randomBytes = new Uint8Array(GOOGLE_OAUTH_STATE_BYTES)

  globalThis.crypto.getRandomValues(randomBytes)

  return Array.from(randomBytes, byte => byte.toString(16).padStart(2, '0')).join('')
}

export const createGoogleOAuthRedirectUrl = (origin: string) => {
  const state = generateGoogleOAuthState()

  globalThis.sessionStorage.setItem(GOOGLE_OAUTH_STATE_STORAGE_KEY, state)

  return buildGoogleAuthUrl(origin, state)
}

export const consumeGoogleOAuthState = (returnedState: string | null) => {
  const storedState = globalThis.sessionStorage.getItem(GOOGLE_OAUTH_STATE_STORAGE_KEY)

  globalThis.sessionStorage.removeItem(GOOGLE_OAUTH_STATE_STORAGE_KEY)

  return Boolean(returnedState && storedState && returnedState === storedState)
}
