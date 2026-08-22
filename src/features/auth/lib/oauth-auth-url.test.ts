import { describe, expect, it } from 'vitest'

import { buildGitHubAuthUrl, buildGoogleAuthUrl } from './oauth-auth-url'

describe('oauth-auth-url', () => {
  it('builds Google OAuth URL with expected query params', () => {
    process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID = 'google-client-id'

    const url = new URL(buildGoogleAuthUrl('https://app.example.com/', 'google-oauth-state'))

    expect(url.origin + url.pathname).toBe('https://accounts.google.com/o/oauth2/v2/auth')
    expect(url.searchParams.get('redirect_uri')).toBe('https://app.example.com')
    expect(url.searchParams.get('response_type')).toBe('code')
    expect(url.searchParams.get('client_id')).toBe('google-client-id')
    expect(url.searchParams.get('scope')).toBe('email profile')
    expect(url.searchParams.get('prompt')).toBe('consent')
    expect(url.searchParams.get('state')).toBe('google-oauth-state')
  })

  it('builds GitHub OAuth URL with canonical redirect_url query param', () => {
    const url = new URL(buildGitHubAuthUrl('https://api.example.com', 'https://app.example.com'))

    expect(url.origin + url.pathname).toBe('https://api.example.com/v1/auth/github/login')
    expect(url.searchParams.get('redirect_url')).toBe('https://app.example.com/')
    expect(url.searchParams.has('redirectUrl')).toBe(false)
  })
})
