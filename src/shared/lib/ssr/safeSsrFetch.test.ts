import { describe, expect, it, vi } from 'vitest'

import { safeSsrFetchJson } from './safeSsrFetch'

describe('safeSsrFetchJson', () => {
  it('returns success result for valid JSON payload', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(new Response(JSON.stringify({ ok: true }), { status: 200 }))

    vi.stubGlobal('fetch', fetchMock as typeof fetch)

    const result = await safeSsrFetchJson<{ ok: boolean }>('https://example.com/resource')

    expect(result.ok).toBe(true)

    if (result.ok) {
      expect(result.data.ok).toBe(true)
      expect(result.status).toBe(200)
    }
  })

  it('returns http error for non-ok responses', async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response('Forbidden', { status: 403 }))

    vi.stubGlobal('fetch', fetchMock as typeof fetch)

    const result = await safeSsrFetchJson('https://example.com/forbidden')

    expect(result.ok).toBe(false)

    if (!result.ok) {
      expect(result.error.kind).toBe('http')
      expect(result.error.status).toBe(403)
      expect(result.error.bodyPreview).toContain('Forbidden')
    }
  })

  it('returns parse error when response body is not valid JSON', async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response('not-json', { status: 200 }))

    vi.stubGlobal('fetch', fetchMock as typeof fetch)

    const result = await safeSsrFetchJson('https://example.com/broken')

    expect(result.ok).toBe(false)

    if (!result.ok) {
      expect(result.error.kind).toBe('parse')
      expect(result.error.status).toBe(200)
      expect(result.error.bodyPreview).toContain('not-json')
    }
  })

  it('returns network error when fetch throws', async () => {
    const fetchMock = vi.fn().mockRejectedValue(new Error('getaddrinfo ENOTFOUND'))

    vi.stubGlobal('fetch', fetchMock as typeof fetch)

    const result = await safeSsrFetchJson('https://example.com/network')

    expect(result.ok).toBe(false)

    if (!result.ok) {
      expect(result.error.kind).toBe('network')
      expect(result.error.status).toBeUndefined()
      expect(result.error.message).toContain('ENOTFOUND')
    }
  })
})
