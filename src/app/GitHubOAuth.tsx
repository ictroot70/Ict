'use client'

import { useGitHubAuth } from '@/features/auth/hooks'

export const GitHubOAuth = () => {
  useGitHubAuth({ enabled: true })

  return null
}
