import { API_ROUTES } from '@/shared/api'
import { buildApiUrl } from '@/shared/api/get-api-base-url'

import { PaginatedPosts, PostViewModel } from '../api'

const REQUEST_OPTIONS = { cache: 'no-store' as const }

const buildRouteUrl = (route: string, query?: Record<string, number | string>) => {
  const searchParams = new URLSearchParams()

  if (query) {
    Object.entries(query).forEach(([key, value]) => {
      searchParams.set(key, String(value))
    })
  }

  const serializedQuery = searchParams.toString()

  return serializedQuery ? `${buildApiUrl(route)}?${serializedQuery}` : buildApiUrl(route)
}

const normalizePaginatedPosts = (
  value: unknown,
  fallbackPageSize: number
): null | PaginatedPosts => {
  if (!value || typeof value !== 'object') {
    return null
  }

  const raw = value as {
    items?: unknown
    pageSize?: unknown
    totalCount?: unknown
  }

  if (!Array.isArray(raw.items)) {
    return null
  }

  return {
    items: raw.items as PostViewModel[],
    pageSize: typeof raw.pageSize === 'number' ? raw.pageSize : fallbackPageSize,
    totalCount: typeof raw.totalCount === 'number' ? raw.totalCount : raw.items.length,
  }
}

const fetchPaginatedPostsByRoute = async ({
  route,
  pageSize,
  query,
}: {
  route: string
  pageSize: number
  query?: Record<string, number | string>
}): Promise<{ data: null | PaginatedPosts; status: null | number }> => {
  try {
    const response = await fetch(buildRouteUrl(route, query), REQUEST_OPTIONS)

    if (!response.ok) {
      return { data: null, status: response.status }
    }

    const normalized = normalizePaginatedPosts(await response.json(), pageSize)

    if (!normalized) {
      return { data: null, status: response.status }
    }

    return { data: normalized, status: response.status }
  } catch {
    return { data: null, status: null }
  }
}

const fetchPostByParamRoute = async (postId: number): Promise<null | PostViewModel> => {
  try {
    const response = await fetch(
      buildRouteUrl(API_ROUTES.POSTS.PARAM(String(postId)), {
        pageNumber: 1,
        pageSize: 1,
        sortDirection: 'desc',
      }),
      REQUEST_OPTIONS
    )

    if (!response.ok) {
      return null
    }

    const payload = (await response.json()) as { items?: PostViewModel[] }

    if (!Array.isArray(payload.items)) {
      return null
    }

    return payload.items.find(item => item.id === postId) || null
  } catch {
    return null
  }
}

async function fetchUserPosts(
  userId: number,
  pageSize: number,
  profileUserName?: string
): Promise<PaginatedPosts> {
  const privateResult = await fetchPaginatedPostsByRoute({
    route: API_ROUTES.POSTS.USER_POSTS(userId, 0),
    pageSize,
    query: { pageSize },
  })

  if (privateResult.data) {
    return privateResult.data
  }

  if (profileUserName) {
    const byUsernameResult = await fetchPaginatedPostsByRoute({
      route: API_ROUTES.POSTS.PARAM(encodeURIComponent(profileUserName)),
      pageSize,
      query: { pageNumber: 1, pageSize, sortDirection: 'desc' },
    })

    if (byUsernameResult.data) {
      return byUsernameResult.data
    }
  }

  if (
    privateResult.status === 401 ||
    privateResult.status === 403 ||
    privateResult.status === 404
  ) {
    const legacyPublicResult = await fetchPaginatedPostsByRoute({
      route: API_ROUTES.PUBLIC_POSTS.USER(userId, 0),
      pageSize,
      query: { pageSize },
    })

    if (legacyPublicResult.data) {
      return legacyPublicResult.data
    }
  }

  throw new Error('Failed to fetch user posts')
}

const fetchPostByRoute = async (
  route: string
): Promise<{ post: PostViewModel | null; status: null | number }> => {
  try {
    const response = await fetch(buildApiUrl(route), REQUEST_OPTIONS)

    if (!response.ok) {
      return { post: null, status: response.status }
    }

    return { post: (await response.json()) as PostViewModel, status: response.status }
  } catch {
    return { post: null, status: null }
  }
}

async function fetchPostByIdForSSR(postId: number): Promise<PostViewModel | null> {
  const privatePostResult = await fetchPostByRoute(API_ROUTES.POSTS.BY_ID(postId))

  if (privatePostResult.post) {
    return privatePostResult.post
  }

  const fallbackPostByParam = await fetchPostByParamRoute(postId)

  if (fallbackPostByParam) {
    return fallbackPostByParam
  }

  if (
    privatePostResult.status === 401 ||
    privatePostResult.status === 403 ||
    privatePostResult.status === 404
  ) {
    const publicPostResult = await fetchPostByRoute(API_ROUTES.PUBLIC_POSTS.BY_ID(postId))

    if (publicPostResult.post) {
      return publicPostResult.post
    }
  }

  return null
}

export { fetchUserPosts, fetchPostByIdForSSR }
