import { API_ROUTES } from '@/shared/api'
import { buildApiUrl } from '@/shared/api/get-api-base-url'

import { PaginatedPosts, PostViewModel } from '../api'

async function fetchUserPosts(userId: number, pageSize: number): Promise<PaginatedPosts> {
  const privateResponse = await fetch(
    `${buildApiUrl(API_ROUTES.POSTS.USER_POSTS(userId, 0))}?pageSize=${pageSize}`
  )

  if (privateResponse.ok) {
    return privateResponse.json()
  }

  // SSR can be executed without auth context; fallback to public posts endpoint.
  if (privateResponse.status === 401 || privateResponse.status === 403) {
    const publicResponse = await fetch(
      `${buildApiUrl(API_ROUTES.PUBLIC_POSTS.USER(userId, 0))}?pageSize=${pageSize}`
    )

    if (publicResponse.ok) {
      return publicResponse.json()
    }
  }

  throw new Error('Failed to fetch user posts')
}

const fetchPostByRoute = async (
  route: string
): Promise<{ post: PostViewModel | null; status: null | number }> => {
  try {
    const response = await fetch(buildApiUrl(route))

    if (!response.ok) {
      return { post: null, status: response.status }
    }

    return { post: (await response.json()) as PostViewModel, status: response.status }
  } catch (error) {
    console.error('Error fetching post by route:', error)

    return { post: null, status: null }
  }
}

async function fetchPostByIdForSSR(postId: number): Promise<PostViewModel | null> {
  const privatePostResult = await fetchPostByRoute(API_ROUTES.POSTS.BY_ID(postId))

  if (privatePostResult.post) {
    return privatePostResult.post
  }

  if (privatePostResult.status === 401 || privatePostResult.status === 403) {
    const publicPostResult = await fetchPostByRoute(API_ROUTES.PUBLIC_POSTS.BY_ID(postId))

    return publicPostResult.post
  }

  return null
}

export { fetchUserPosts, fetchPostByIdForSSR }
