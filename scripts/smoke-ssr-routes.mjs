#!/usr/bin/env node

const SSR_BASE_URL = process.env.SSR_SMOKE_BASE_URL ?? 'https://ictroot.uk'
const RAW_PAIRS = process.env.SSR_SMOKE_PROFILE_POST_PAIRS ?? '9:1767,409:1766'

const normalizeBaseUrl = value => value.replace(/\/+$/, '')

const parsePairs = value =>
  value
    .split(',')
    .map(chunk => chunk.trim())
    .filter(Boolean)
    .map(pair => {
      const [profileId, postId] = pair.split(':')

      if (!profileId || !postId) {
        throw new Error(
          `Invalid pair "${pair}". Use SSR_SMOKE_PROFILE_POST_PAIRS like "9:1767,409:1766".`
        )
      }

      return { postId, profileId }
    })

const createRoutes = pairs => {
  const profileRoutes = pairs.flatMap(({ profileId, postId }) => [
    `/profile/${profileId}`,
    `/profile/${profileId}?postId=${postId}&from=home`,
  ])

  return ['/', ...profileRoutes]
}

const assertNoFailureMarkers = (html, url) => {
  const genericFailureMarkers = ['Server unavailable']
  const profileFailureMarkers = ['Profile not found']
  const markers = url.includes('/profile/') ? [...genericFailureMarkers, ...profileFailureMarkers] : genericFailureMarkers
  const matched = markers.find(marker => html.includes(marker))

  if (matched) {
    throw new Error(`SSR smoke failed for ${url}: marker "${matched}" is present in HTML`)
  }
}

const run = async () => {
  const baseUrl = normalizeBaseUrl(SSR_BASE_URL)
  const pairs = parsePairs(RAW_PAIRS)
  const routes = createRoutes(pairs)

  console.log(`[smoke:ssr] Base URL: ${baseUrl}`)
  console.log(`[smoke:ssr] Profile/Post pairs: ${pairs.map(pair => `${pair.profileId}:${pair.postId}`).join(', ')}`)

  for (const route of routes) {
    const url = `${baseUrl}${route}`
    const response = await fetch(url, {
      cache: 'no-store',
      headers: { 'cache-control': 'no-cache' },
    })
    const html = await response.text()

    if (!response.ok) {
      throw new Error(`[smoke:ssr] ${url} returned ${response.status}`)
    }

    assertNoFailureMarkers(html, url)
    console.log(`[smoke:ssr] OK ${url}`)
  }

  console.log('[smoke:ssr] All checks passed')
}

run().catch(error => {
  console.error('[smoke:ssr] Failed:', error instanceof Error ? error.message : String(error))
  process.exit(1)
})
