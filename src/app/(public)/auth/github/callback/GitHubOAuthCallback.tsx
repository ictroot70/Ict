'use client'

import { useGitHubAuth } from '@/features/auth/hooks'

export const GitHubOAuthCallback = () => {
  useGitHubAuth({ enabled: true })

  return null
}
