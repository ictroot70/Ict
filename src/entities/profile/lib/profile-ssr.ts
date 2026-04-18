import { getSsrFetchErrorStatus } from '@/shared/lib/ssr/safeSsrFetch'

export type ProfileSsrFailureMode = 'not_found' | 'recovery'

export const resolveProfileSsrFailureMode = (error: unknown): ProfileSsrFailureMode => {
  const status = getSsrFetchErrorStatus(error)

  return status === 404 ? 'not_found' : 'recovery'
}
