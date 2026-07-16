import fs from 'node:fs'
import path from 'node:path'

import { describe, expect, it } from 'vitest'

const readSource = (relativePath: string) =>
  fs.readFileSync(path.join(process.cwd(), relativePath), 'utf8')

describe('AUTH-FORCED-LOCAL-LOGOUT', () => {
  it('marks forced logout on server-logout failure and clears it on successful login', () => {
    const source = readSource('src/features/auth/api/auth.api.ts')

    expect(source).toContain('markAuthForcedLogout')
    expect(source).toContain('clearAuthForcedLogout')
    expect(source).toContain('performClientLogoutCleanup({ markForcedLogout: true })')
  })

  it('blocks /auth/me and refresh endpoints while forced logout marker is active', () => {
    const source = readSource('src/shared/api/base-query.api.ts')

    expect(source).toContain('isAuthForcedLoggedOut')
    expect(source).toContain('API_ROUTES.AUTH.ME')
    expect(source).toContain('Forced local logout is active')
  })

  it('skips bootstrap token restore when forced logout marker is set', () => {
    const source = readSource('src/shared/lib/restoreAccessToken.ts')

    expect(source).toContain('isAuthForcedLoggedOut')
    expect(source).toContain('Skipping restore due to forced local logout flag')
  })
})
