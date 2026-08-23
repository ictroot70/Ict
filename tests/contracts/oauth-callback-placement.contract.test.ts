import fs from 'node:fs'
import path from 'node:path'

import { describe, expect, it } from 'vitest'

const readSource = (relativePath: string) =>
  fs.readFileSync(path.join(process.cwd(), relativePath), 'utf8')

describe('OAuth callback placement', () => {
  it('mounts the GitHub callback handler only on the dedicated callback route', () => {
    const homePageSource = readSource('src/app/page.tsx')
    const rootLayoutSource = readSource('src/app/RootLayoutClient.tsx')
    const callbackPageSource = readSource('src/app/(public)/auth/github/callback/page.tsx')
    const callbackComponentSource = readSource(
      'src/app/(public)/auth/github/callback/GitHubOAuthCallback.tsx'
    )

    expect(homePageSource).not.toContain('GitHubOAuth')
    expect(rootLayoutSource).not.toContain('useGitHubAuth')
    expect(callbackPageSource).toContain('<GitHubOAuthCallback />')
    expect(callbackComponentSource).toContain('useGitHubAuth({ enabled: true })')
  })
})
