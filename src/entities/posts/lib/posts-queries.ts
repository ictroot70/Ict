import { PaginatedResponse, PostViewModel } from '@/entities/posts/api'
import { API_ROUTES } from '@/shared/api'

async function fetchUserPosts(
  userId: number,
  pageSize: number
): Promise<PaginatedResponse<PostViewModel>> {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL + API_ROUTES.POSTS.USER_POSTS(userId, 0)}?pageSize=${pageSize}`
  )
  if (!response.ok) {
    throw new Error('Failed to fetch user posts')
  }
  return response.json()
}

export { fetchUserPosts }
