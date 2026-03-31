const AUTH_FORCED_LOGOUT_KEY = 'auth_forced_logout'
const AUTH_FORCED_LOGOUT_VALUE = '1'

function canUseStorage(): boolean {
  return typeof window !== 'undefined'
}

export function isAuthForcedLoggedOut(): boolean {
  if (!canUseStorage()) {
    return false
  }

  return window.localStorage.getItem(AUTH_FORCED_LOGOUT_KEY) === AUTH_FORCED_LOGOUT_VALUE
}

export function markAuthForcedLogout(): void {
  if (!canUseStorage()) {
    return
  }

  window.localStorage.setItem(AUTH_FORCED_LOGOUT_KEY, AUTH_FORCED_LOGOUT_VALUE)
}

export function clearAuthForcedLogout(): void {
  if (!canUseStorage()) {
    return
  }

  window.localStorage.removeItem(AUTH_FORCED_LOGOUT_KEY)
}
