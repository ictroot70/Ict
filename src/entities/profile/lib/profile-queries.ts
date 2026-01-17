import { API_ROUTES } from '@/shared/api'
import { PublicProfileData } from '../api'

async function fetchProfileData(userId: number): Promise<PublicProfileData> {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL + API_ROUTES.PUBLIC_USER.PROFILE(userId)}`
  )
  if (!response.ok) {
    throw new Error('Failed to fetch profile data')
  }
  return response.json()
}

export { fetchProfileData }
