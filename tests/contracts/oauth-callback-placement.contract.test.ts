import fs from 'node:fs'
import path from 'node:path'

import { describe, expect, it } from 'vitest'

const readSource = (relativePath: string) =>
  fs.readFileSync(path.join(process.cwd(), relativePath), 'utf8')

const findAppSourceFilesUsing = (needle: string) => {
  const appDirectory = path.join(process.cwd(), 'src', 'app')

  return fs
    .readdirSync(appDirectory, { recursive: true })
    .filter((entry): entry is string => typeof entry === 'string' && /\.(ts|tsx)$/.test(entry))
    .map(entry => path.join(appDirectory, entry))
    .filter(absolutePath => fs.readFileSync(absolutePath, 'utf8').includes(needle))
    .map(absolutePath => path.relative(process.cwd(), absolutePath))
}

describe('OAuth callback placement', () => {
  it('mounts the GitHub callback handler only on the dedicated callback route', () => {
    const callbackComponentPath = path.join(
      'src',
      'app',
      '(public)',
      'auth',
      'github',
      'callback',
      'GitHubOAuthCallback.tsx'
    )
    const callbackPageSource = readSource('src/app/(public)/auth/github/callback/page.tsx')

    expect(callbackPageSource).toContain('<GitHubOAuthCallback />')
    expect(findAppSourceFilesUsing('useGitHubAuth')).toEqual([callbackComponentPath])
  })
})
