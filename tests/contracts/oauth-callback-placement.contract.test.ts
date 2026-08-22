import fs from 'node:fs'
import path from 'node:path'

import { describe, expect, it } from 'vitest'

const readSource = (relativePath: string) =>
  fs.readFileSync(path.join(process.cwd(), relativePath), 'utf8')

describe('OAuth callback placement', () => {
  it('mounts OAuth callback handlers only on the home callback page', () => {
    const homePageSource = readSource('src/app/page.tsx')
    const rootLayoutSource = readSource('src/app/RootLayoutClient.tsx')

    expect(homePageSource).toContain('<GoogleOAuth />')
    expect(homePageSource).toContain('<GitHubOAuth />')
    expect(rootLayoutSource).not.toContain('useGoogleAuth')
    expect(rootLayoutSource).not.toContain('useGitHubAuth')
  })
})
