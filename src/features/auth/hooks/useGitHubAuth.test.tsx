import { APP_ROUTES } from '@/shared/constant'
import { act, renderHook, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { useGitHubAuth } from './useGitHubAuth'

const mocks = vi.hoisted(() => ({
  clearToken: vi.fn(),
  dispatch: vi.fn(),
  jwtDecode: vi.fn(),
  params: new URLSearchParams(),
  replace: vi.fn(),
  setAccessToken: vi.fn(),
  showToastAlert: vi.fn(),
  triggerProfile: vi.fn(),
}))

vi.mock('@/entities/profile/api/profileApi', () => ({
  useLazyGetMyProfileQuery: () => [mocks.triggerProfile],
}))

vi.mock('@/lib/hooks', () => ({
  useAppDispatch: () => mocks.dispatch,
}))

vi.mock('@/shared/auth/authSlice', () => ({
  logout: () => ({ type: 'auth/logout' }),
  setAuthenticated: () => ({ type: 'auth/setAuthenticated' }),
}))

vi.mock('@/shared/lib', () => ({
  showToastAlert: mocks.showToastAlert,
}))

vi.mock('@/shared/lib/storage/auth-token', () => ({
  authTokenStorage: {
    clear: mocks.clearToken,
    setAccessToken: mocks.setAccessToken,
  },
}))

vi.mock('jwt-decode', () => ({
  jwtDecode: mocks.jwtDecode,
}))

vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace: mocks.replace }),
  useSearchParams: () => mocks.params,
}))

describe('useGitHubAuth callback', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.params = new URLSearchParams()
    mocks.jwtDecode.mockReturnValue({ userId: 42 })
    mocks.triggerProfile.mockReturnValue({ unwrap: () => Promise.resolve() })
  })

  it('stores the token, loads the profile and redirects home for a valid callback', async () => {
    mocks.params = new URLSearchParams({ accessToken: 'github-access-token' })

    renderHook(() => useGitHubAuth({ enabled: true }))

    await waitFor(() => {
      expect(mocks.setAccessToken).toHaveBeenCalledWith('github-access-token')
      expect(mocks.dispatch).toHaveBeenCalledWith({ type: 'auth/setAuthenticated' })
      expect(mocks.triggerProfile).toHaveBeenCalledOnce()
      expect(mocks.replace).toHaveBeenCalledWith(APP_ROUTES.ROOT)
    })
  })

  it('clears auth and redirects to login for an invalid callback', async () => {
    mocks.params = new URLSearchParams({ accessToken: 'invalid-token' })
    mocks.jwtDecode.mockImplementation(() => {
      throw new Error('Invalid token')
    })

    renderHook(() => useGitHubAuth({ enabled: true }))

    await waitFor(() => {
      expect(mocks.clearToken).toHaveBeenCalledOnce()
      expect(mocks.dispatch).toHaveBeenCalledWith({ type: 'auth/logout' })
      expect(mocks.showToastAlert).toHaveBeenCalledOnce()
      expect(mocks.replace).toHaveBeenCalledWith(APP_ROUTES.AUTH.LOGIN)
    })
  })

  it('handles authorization cancellation without authenticating', async () => {
    mocks.params = new URLSearchParams({ error: 'access_denied' })

    renderHook(() => useGitHubAuth({ enabled: true }))

    await waitFor(() => {
      expect(mocks.setAccessToken).not.toHaveBeenCalled()
      expect(mocks.triggerProfile).not.toHaveBeenCalled()
      expect(mocks.showToastAlert).toHaveBeenCalledOnce()
      expect(mocks.replace).toHaveBeenCalledWith(APP_ROUTES.AUTH.LOGIN)
    })
  })

  it('does not react when the hook is mounted outside the callback page', async () => {
    mocks.params = new URLSearchParams({ accessToken: 'github-access-token' })

    renderHook(() => useGitHubAuth())

    await act(async () => Promise.resolve())

    expect(mocks.jwtDecode).not.toHaveBeenCalled()
    expect(mocks.setAccessToken).not.toHaveBeenCalled()
    expect(mocks.triggerProfile).not.toHaveBeenCalled()
    expect(mocks.replace).not.toHaveBeenCalled()
  })
})
