const AUTH_SESSION_HINT_KEY = 'auth_session_hint'
const AUTH_SESSION_HINT_VALUE = '1'
const AUTH_USER_ID_HINT_KEY = 'auth_user_id_hint'
const AUTH_SESSION_HINT_MAX_AGE = 60 * 60 * 24 * 30

export const AUTH_SESSION_HINT_CHANGE_EVENT = 'auth-session-hint-change'

function canUseStorage(): boolean {
  return typeof window !== 'undefined'
}

function notifyAuthSessionHintChanged(): void {
  if (typeof window === 'undefined') {
    return
  }

  window.dispatchEvent(new Event(AUTH_SESSION_HINT_CHANGE_EVENT))
}

function getCookieValue(name: string): string | null {
  if (typeof document === 'undefined') {
    return null
  }

  const prefix = `${name}=`
  const cookie = document.cookie.split('; ').find(item => item.startsWith(prefix))

  return cookie ? decodeURIComponent(cookie.slice(prefix.length)) : null
}

function setHintCookie(): void {
  if (typeof document === 'undefined') {
    return
  }

  document.cookie = `${AUTH_SESSION_HINT_KEY}=${AUTH_SESSION_HINT_VALUE}; Path=/; Max-Age=${AUTH_SESSION_HINT_MAX_AGE}; SameSite=Lax`
}

function setUserIdHintCookie(userId: number): void {
  if (typeof document === 'undefined') {
    return
  }

  document.cookie = `${AUTH_USER_ID_HINT_KEY}=${userId}; Path=/; Max-Age=${AUTH_SESSION_HINT_MAX_AGE}; SameSite=Lax`
}

function clearHintCookie(): void {
  if (typeof document === 'undefined') {
    return
  }

  document.cookie = `${AUTH_SESSION_HINT_KEY}=; Path=/; Max-Age=0; SameSite=Lax`
}

function clearUserIdHintCookie(): void {
  if (typeof document === 'undefined') {
    return
  }

  document.cookie = `${AUTH_USER_ID_HINT_KEY}=; Path=/; Max-Age=0; SameSite=Lax`
}

function parseUserId(value: null | string): number | null {
  if (!value) {
    return null
  }

  const parsed = Number(value)

  return Number.isInteger(parsed) && parsed > 0 ? parsed : null
}

function clearAuthUserIdHint(): void {
  if (!canUseStorage()) {
    return
  }

  window.localStorage.removeItem(AUTH_USER_ID_HINT_KEY)
  clearUserIdHintCookie()
}

export function getAuthUserIdHint(): number | null {
  if (!canUseStorage()) {
    return null
  }

  return (
    parseUserId(getCookieValue(AUTH_USER_ID_HINT_KEY)) ||
    parseUserId(window.localStorage.getItem(AUTH_USER_ID_HINT_KEY))
  )
}

export function setAuthUserIdHint(userId: number): void {
  if (!canUseStorage()) {
    return
  }

  if (!Number.isInteger(userId) || userId <= 0) {
    clearAuthUserIdHint()

    return
  }

  const nextValue = String(userId)

  window.localStorage.setItem(AUTH_USER_ID_HINT_KEY, nextValue)
  setUserIdHintCookie(userId)
}

export function hasAuthSessionHint(): boolean {
  if (!canUseStorage()) {
    return false
  }

  return (
    getCookieValue(AUTH_SESSION_HINT_KEY) === AUTH_SESSION_HINT_VALUE ||
    window.localStorage.getItem(AUTH_SESSION_HINT_KEY) === AUTH_SESSION_HINT_VALUE
  )
}

export function markAuthSessionHint(userId?: number): void {
  if (!canUseStorage()) {
    return
  }

  window.localStorage.setItem(AUTH_SESSION_HINT_KEY, AUTH_SESSION_HINT_VALUE)
  setHintCookie()
  if (typeof userId === 'number') {
    setAuthUserIdHint(userId)
  } else {
    clearAuthUserIdHint()
  }

  notifyAuthSessionHintChanged()
}

export function clearAuthSessionHint(): void {
  if (!canUseStorage()) {
    return
  }

  window.localStorage.removeItem(AUTH_SESSION_HINT_KEY)
  clearHintCookie()
  clearAuthUserIdHint()
  notifyAuthSessionHintChanged()
}
