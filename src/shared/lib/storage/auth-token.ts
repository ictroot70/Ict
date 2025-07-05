import { AUTH_STORAGE_KEYS } from '@/shared/constant/authStorageKeys'

export const authTokenStorage = {
  setAccessToken(token: string) {
    localStorage.setItem(AUTH_STORAGE_KEYS.ACCESS_TOKEN, token)
  },

  getAccessToken(): string | null {
    return localStorage.getItem(AUTH_STORAGE_KEYS.ACCESS_TOKEN)
  },

  removeAccessToken() {
    localStorage.removeItem(AUTH_STORAGE_KEYS.ACCESS_TOKEN)
  },

  setRefreshToken(token: string) {
    localStorage.setItem(AUTH_STORAGE_KEYS.REFRESH_TOKEN, token)
  },

  getRefreshToken(): string | null {
    return localStorage.getItem(AUTH_STORAGE_KEYS.REFRESH_TOKEN)
  },

  removeRefreshToken() {
    localStorage.removeItem(AUTH_STORAGE_KEYS.REFRESH_TOKEN)
  },

  clear() {
    localStorage.removeItem(AUTH_STORAGE_KEYS.ACCESS_TOKEN)
    localStorage.removeItem(AUTH_STORAGE_KEYS.REFRESH_TOKEN)
  },
}
