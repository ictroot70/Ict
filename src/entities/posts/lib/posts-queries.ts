import { API_ROUTES } from '@/shared/api'
import { PaginatedPosts } from '../api'

async function fetchUserPosts(userId: number, pageSize: number): Promise<PaginatedPosts> {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL + API_ROUTES.POSTS.USER_POSTS(userId, 0)}?pageSize=${pageSize}`
  )
  if (!response.ok) {
    throw new Error('Failed to fetch user posts')
  }
  return response.json()
}

export { fetchUserPosts }
