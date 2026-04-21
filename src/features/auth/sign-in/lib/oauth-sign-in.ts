import { API_ROUTES } from '@/shared/api'

export const buildGoogleAuthUrl = (origin: string) => {
  const params = new URLSearchParams({
    redirect_uri: `${origin.replace(/\/+$/, '')}`,
    response_type: 'code',
    client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? '',
    scope: 'email profile',
    prompt: 'consent',
  })

  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`
}

export const buildGitHubAuthUrl = (apiBaseUrl: string, origin: string) => {
  const redirectUrl = `${origin}/`
  const params = new URLSearchParams({ redirectUrl })

  return `${apiBaseUrl}${API_ROUTES.AUTH.GITHUB_LOGIN}?${params.toString()}`
}
