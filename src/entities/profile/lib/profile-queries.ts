import { API_ROUTES } from '@/shared/api'
import { buildApiUrl } from '@/shared/api/get-api-base-url'

import { PublicProfileData } from '../api'

async function fetchProfileData(userId: number): Promise<PublicProfileData> {
  const response = await fetch(buildApiUrl(API_ROUTES.PUBLIC_USER.PROFILE(userId)))

  if (!response.ok) {
    throw new Error('Failed to fetch profile data')
  }

  return response.json()
}

export { fetchProfileData }
