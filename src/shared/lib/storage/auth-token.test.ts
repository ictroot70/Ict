import { beforeEach, describe, expect, it, vi } from 'vitest'

import { authTokenStorage } from './auth-token'

describe('authTokenStorage subscriptions', () => {
  beforeEach(() => {
    authTokenStorage.clear()
  })

  it('notifies subscribers when the access token changes', () => {
    const listener = vi.fn()
    const unsubscribe = authTokenStorage.subscribe(listener)

    authTokenStorage.setAccessToken('first-token')
    authTokenStorage.setAccessToken('second-token')

    expect(listener).toHaveBeenCalledTimes(2)
    unsubscribe()
  })

  it('notifies subscribers when the access token is cleared', () => {
    authTokenStorage.setAccessToken('access-token')
    const listener = vi.fn()
    const unsubscribe = authTokenStorage.subscribe(listener)

    authTokenStorage.clear()

    expect(listener).toHaveBeenCalledOnce()
    unsubscribe()
  })
})
