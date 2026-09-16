import { APP_ROUTES } from '@/shared/constant'
import { renderHook, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { consumeGoogleOAuthState, createGoogleOAuthRedirectUrl } from '../lib/google-oauth-state'
import { useGoogleAuth } from './useGoogleAuth'

const mocks = vi.hoisted(() => ({
  googleAuth: vi.fn(),
  params: new URLSearchParams(),
  replace: vi.fn(),
  showToastAlert: vi.fn(),
}))

vi.mock('@/features/auth', () => ({
  useGoogleAuthMutation: () => [mocks.googleAuth, { isLoading: false }],
}))

vi.mock('@/shared/lib', () => ({
  showToastAlert: mocks.showToastAlert,
}))

vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace: mocks.replace }),
  useSearchParams: () => mocks.params,
}))

describe('useGoogleAuth callback', () => {
  beforeEach(() => {
    sessionStorage.clear()
    mocks.googleAuth.mockReset()
    mocks.googleAuth.mockReturnValue({ unwrap: () => Promise.resolve() })
    mocks.params = new URLSearchParams()
    mocks.replace.mockReset()
    mocks.showToastAlert.mockReset()
  })

  it('authorizes and redirects home for a valid callback', async () => {
    const authorizationUrl = new URL(createGoogleOAuthRedirectUrl('https://app.example.com'))
    const state = authorizationUrl.searchParams.get('state') ?? ''

    mocks.params = new URLSearchParams({ code: 'google-code', state })

    renderHook(() => useGoogleAuth({ enabled: true, redirectUrl: 'https://app.example.com' }))

    await waitFor(() => {
      expect(mocks.googleAuth).toHaveBeenCalledWith({
        code: 'google-code',
        redirectUrl: 'https://app.example.com',
      })
      expect(mocks.replace).toHaveBeenCalledWith(APP_ROUTES.ROOT)
    })
  })

  it('rejects an invalid state without calling the backend', async () => {
    createGoogleOAuthRedirectUrl('https://app.example.com')
    mocks.params = new URLSearchParams({ code: 'google-code', state: 'invalid-state' })

    renderHook(() => useGoogleAuth({ enabled: true }))

    await waitFor(() => {
      expect(mocks.googleAuth).not.toHaveBeenCalled()
      expect(mocks.showToastAlert).toHaveBeenCalledOnce()
      expect(mocks.replace).toHaveBeenCalledWith(APP_ROUTES.AUTH.LOGIN)
    })
  })

  it('handles authorization cancellation without calling the backend', async () => {
    const authorizationUrl = new URL(createGoogleOAuthRedirectUrl('https://app.example.com'))
    const state = authorizationUrl.searchParams.get('state') ?? ''

    mocks.params = new URLSearchParams({ error: 'access_denied', state })

    renderHook(() => useGoogleAuth({ enabled: true }))

    await waitFor(() => {
      expect(mocks.googleAuth).not.toHaveBeenCalled()
      expect(mocks.showToastAlert).toHaveBeenCalledOnce()
      expect(mocks.replace).toHaveBeenCalledWith(APP_ROUTES.AUTH.LOGIN)
    })
  })

  it('does not react when the hook is mounted outside the callback page', async () => {
    const authorizationUrl = new URL(createGoogleOAuthRedirectUrl('https://app.example.com'))
    const state = authorizationUrl.searchParams.get('state') ?? ''

    mocks.params = new URLSearchParams({ code: 'google-code', state })

    renderHook(() => useGoogleAuth())

    await waitFor(() => {
      expect(mocks.googleAuth).not.toHaveBeenCalled()
      expect(mocks.showToastAlert).not.toHaveBeenCalled()
      expect(mocks.replace).not.toHaveBeenCalled()
      expect(consumeGoogleOAuthState(state)).toBe(true)
    })
  })
})
