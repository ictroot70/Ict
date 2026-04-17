import { API_ROUTES } from '@/shared/api'
import { buildApiUrl } from '@/shared/api/get-api-base-url'
import { logger } from '@/shared/lib/logger'

import { PublicProfileData } from '../api'

type HttpStatusError = Error & {
  status?: number
}

const createHttpStatusError = (message: string, status?: number): HttpStatusError => {
  const error = new Error(message) as HttpStatusError

  if (typeof status === 'number') {
    error.status = status
  }

  return error
}

const REQUEST_OPTIONS = { cache: 'no-store' as const }

async function fetchProfileData(userId: number): Promise<PublicProfileData> {
  const url = buildApiUrl(API_ROUTES.PUBLIC_USER.PROFILE(userId))
  let response: Response

  try {
    response = await fetch(url, REQUEST_OPTIONS)
  } catch {
    logger.error('Failed to fetch profile data', { url })
    throw createHttpStatusError('Failed to fetch profile data')
  }

  if (!response.ok) {
    const body = await response.text().catch(() => '')
    logger.error('[fetchProfileData] non-OK response', {
      url,
      status: response.status,
      body: body.slice(0, 300),
    })
    throw createHttpStatusError('Failed to fetch profile data', response.status)
  }

  try {
    return (await response.json()) as PublicProfileData
  } catch (error) {
    const body = await response.text().catch(() => '')
    console.error('[fetchProfileData] json parse error', {
      url,
      status: response.status,
      body: body.slice(0, 300),
      error,
    })
    throw createHttpStatusError('Failed to fetch profile data', response.status)
  }

}

export { fetchProfileData }
