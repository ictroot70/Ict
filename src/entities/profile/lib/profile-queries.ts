import { API_ROUTES } from '@/shared/api'
import { buildApiUrl } from '@/shared/api/get-api-base-url'
import { logger } from '@/shared/lib/logger'
import { safeSsrFetchJson, toSsrFetchException } from '@/shared/lib/ssr/safeSsrFetch'

import { PublicProfileData } from '../api'

const PROFILE_SSR_REVALIDATE_SECONDS = 60

const REQUEST_OPTIONS = {
  next: {
    revalidate: PROFILE_SSR_REVALIDATE_SECONDS,
  },
} as const

async function fetchProfileData(userId: number): Promise<PublicProfileData> {
  const url = buildApiUrl(API_ROUTES.PUBLIC_USER.PROFILE(userId))
  const result = await safeSsrFetchJson<PublicProfileData>(url, REQUEST_OPTIONS)

  if (!result.ok) {
    logger.error('[fetchProfileData] request failed', {
      bodyPreview: result.error.bodyPreview,
      causeCode: result.error.causeCode,
      kind: result.error.kind,
      message: result.error.message,
      status: result.error.status,
      url: result.error.url,
      userId,
    })

    throw toSsrFetchException(result.error)
  }

  return result.data
}

export { fetchProfileData }
