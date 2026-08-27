/**
 * Secure token storage
 *
 * Access Token: stored in memory (cleared on page reload)
 * Refresh Token: stored in httpOnly cookie on backend
 *
 * Security:
 * - XSS protection (token not accessible via JavaScript)
 * - Access token short-lived (15-30 min)
 * - Automatic refresh on page reload
 *
 * Full logout requires calling POST /auth/logout to clear cookies
 */
import { logger } from '@/shared/lib/logger'

// Access Token is stored in memory (closure)
let accessToken: string | null = null
let migrated = false

export const authTokenStorage = {
  /**
   * Save access token in memory
   * Called after successful login or token refresh
   */
  setAccessToken(token: string) {
    migrateFromLocalStorage()
    accessToken = token
    logger.debug('[authTokenStorage] Access token updated')
  },

  /**
   * Get access token from memory
   * Returns null if user not authenticated or page reloaded
   */
  getAccessToken(): string | null {
    return accessToken
  },

  hasToken(): boolean {
    return accessToken !== null
  },

  /**
   * Clear access token from memory
   * Note: Does not remove refresh token cookie
   * For full logout use POST /auth/logout
   */
  clear() {
    accessToken = null
  },
}

/**
 * Clean up legacy tokens from localStorage
 * Run once during app initialization to migrate users
 */
export function migrateFromLocalStorage() {
  if (migrated || typeof window === 'undefined') {
    return
  }

  const legacyKeys = ['accessToken', 'refreshToken']

  legacyKeys.forEach(key => {
    if (localStorage.getItem(key)) {
      logger.info(`[authTokenStorage] Removing legacy token from localStorage: ${key}`)
      localStorage.removeItem(key)
    }
  })

  migrated = true
}
