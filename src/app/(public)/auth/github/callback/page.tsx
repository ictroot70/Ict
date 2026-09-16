import { Suspense } from 'react'

import { GitHubOAuthCallback } from './GitHubOAuthCallback'

export default function GitHubCallbackPage() {
  return (
    <Suspense fallback={null}>
      <GitHubOAuthCallback />
    </Suspense>
  )
}
