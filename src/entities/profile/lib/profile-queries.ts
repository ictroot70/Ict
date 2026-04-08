import { API_ROUTES } from '@/shared/api'
import { buildApiUrl } from '@/shared/api/get-api-base-url'

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

async function fetchProfileData(userId: number): Promise<PublicProfileData> {
  let response: Response

  try {
    response = await fetch(buildApiUrl(API_ROUTES.PUBLIC_USER.PROFILE(userId)))
  } catch {
    throw createHttpStatusError('Failed to fetch profile data')
  }

  if (!response.ok) {
    throw createHttpStatusError('Failed to fetch profile data', response.status)
  }

  return response.json()
}

export { fetchProfileData }
