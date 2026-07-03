/* @vitest-environment node */

import { afterEach, describe, expect, it, vi } from 'vitest'

import { fetchProfileData } from './profile-queries'

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('fetchProfileData', () => {
  it('bypasses the Next.js cache for personalized profile data', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ id: 7 }), {
        headers: { 'Content-Type': 'application/json' },
        status: 200,
      })
    )

    vi.stubGlobal('fetch', fetchMock as typeof fetch)

    await fetchProfileData(7)

    expect(fetchMock).toHaveBeenCalledWith(expect.any(String), { cache: 'no-store' })
  })
})
