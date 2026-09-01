/* @vitest-environment jsdom */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { refreshAccessToken } from './refresh-access-token'
import { authTokenStorage } from './storage/auth-token'

const createResponse = (body: unknown, ok = true) =>
  ({
    json: vi.fn().mockResolvedValue(body),
    ok,
  }) as Pick<Response, 'json' | 'ok'> as Response

describe('refreshAccessToken', () => {
  beforeEach(() => {
    authTokenStorage.clear()
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('stores a refreshed access token in the shared auth storage', async () => {
    const fetchMock = vi.fn().mockResolvedValue(createResponse({ accessToken: 'fresh-token' }))

    vi.stubGlobal('fetch', fetchMock)

    await expect(refreshAccessToken()).resolves.toEqual({
      accessToken: 'fresh-token',
      isAuthenticated: true,
    })
    expect(authTokenStorage.getAccessToken()).toBe('fresh-token')
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining('/auth/update-tokens'),
      expect.objectContaining({ credentials: 'include', method: 'POST' })
    )
  })

  it('shares one refresh request between concurrent REST and socket recovery', async () => {
    const fetchMock = vi.fn().mockResolvedValue(createResponse({ accessToken: 'shared-token' }))

    vi.stubGlobal('fetch', fetchMock)

    const [firstResult, secondResult] = await Promise.all([
      refreshAccessToken(),
      refreshAccessToken(),
    ])

    expect(firstResult).toEqual(secondResult)
    expect(fetchMock).toHaveBeenCalledOnce()
  })

  it('does not authenticate when refresh cookie is rejected', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(createResponse(null, false)))

    await expect(refreshAccessToken()).resolves.toEqual({
      accessToken: null,
      isAuthenticated: false,
    })
    expect(authTokenStorage.getAccessToken()).toBeNull()
  })
})
