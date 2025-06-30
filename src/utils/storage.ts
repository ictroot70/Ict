const AUTH_STORAGE_KEYS = {
  ACCESS_TOKEN: 'access_token',
  REFRESH_TOKEN: 'refresh_token',
}

export const isBrowser = () => typeof window !== 'undefined'

export const authTokenStorage = {
  setAccessToken(token: string) {
    if (isBrowser()) {
      localStorage.setItem(AUTH_STORAGE_KEYS.ACCESS_TOKEN, token)
    }
  },

  getAccessToken(): string | null {
    return isBrowser() ? localStorage.getItem(AUTH_STORAGE_KEYS.ACCESS_TOKEN) : null
  },

  removeAccessToken() {
    if (isBrowser()) {
      localStorage.removeItem(AUTH_STORAGE_KEYS.ACCESS_TOKEN)
    }
  },

  setRefreshToken(token: string) {
    if (isBrowser()) {
      localStorage.setItem(AUTH_STORAGE_KEYS.REFRESH_TOKEN, token)
    }
  },

  getRefreshToken(): string | null {
    return isBrowser() ? localStorage.getItem(AUTH_STORAGE_KEYS.REFRESH_TOKEN) : null
  },

  removeRefreshToken() {
    if (isBrowser()) {
      localStorage.removeItem(AUTH_STORAGE_KEYS.REFRESH_TOKEN)
    }
  },

  clear() {
    if (isBrowser()) {
      localStorage.removeItem(AUTH_STORAGE_KEYS.ACCESS_TOKEN)
      localStorage.removeItem(AUTH_STORAGE_KEYS.REFRESH_TOKEN)
    }
  },
}
