import { API_ROUTES } from '@/shared/api/api-routes'
import { refreshAuthTokens } from '@/shared/api/refresh-auth-tokens'
import { describe, expect, it } from 'vitest'

describe('AUTH-REFRESH-TOKEN-FLOW', () => {
  it('uses /update as primary refresh endpoint', async () => {
    const calls: string[] = []
    const result = await refreshAuthTokens(async endpoint => {
      calls.push(endpoint)

      if (endpoint === API_ROUTES.AUTH.UPDATE) {
        return { data: { accessToken: 'new-token' } }
      }

      return { error: { status: 500 } }
    })

    expect(calls).toEqual([API_ROUTES.AUTH.UPDATE])
    expect(result.accessToken).toBe('new-token')
    expect(result.usedFallback).toBe(false)
    expect(result.status).toBeNull()
  })

  it('falls back to deprecated /update-tokens on 404/405/501 from /update', async () => {
    const calls: string[] = []
    const result = await refreshAuthTokens(async endpoint => {
      calls.push(endpoint)

      if (endpoint === API_ROUTES.AUTH.UPDATE) {
        return { error: { status: 404 } }
      }

      return { data: { accessToken: 'fallback-token' } }
    })

    expect(calls).toEqual([API_ROUTES.AUTH.UPDATE, API_ROUTES.AUTH.UPDATE_TOKENS])
    expect(result.accessToken).toBe('fallback-token')
    expect(result.usedFallback).toBe(true)
  })

  it('returns unauthorized when refresh endpoint responds with 401', async () => {
    const calls: string[] = []
    const result = await refreshAuthTokens(async endpoint => {
      calls.push(endpoint)

      return { error: { status: 401 } }
    })

    expect(calls).toEqual([API_ROUTES.AUTH.UPDATE])
    expect(result.accessToken).toBeNull()
    expect(result.status).toBe(401)
    expect(result.usedFallback).toBe(false)
  })
})
