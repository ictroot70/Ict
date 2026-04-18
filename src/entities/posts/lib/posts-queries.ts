import { API_ROUTES } from '@/shared/api'
import { buildApiUrl } from '@/shared/api/get-api-base-url'
import { logger } from '@/shared/lib/logger'
import { safeSsrFetchJson } from '@/shared/lib/ssr/safeSsrFetch'

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
  const url = buildRouteUrl(route, query)
  const result = await safeSsrFetchJson<unknown>(url, REQUEST_OPTIONS)

  if (!result.ok) {
    logger.warn('[fetchPaginatedPostsByRoute] request failed', {
      bodyPreview: result.error.bodyPreview,
      kind: result.error.kind,
      route,
      status: result.error.status,
      url,
    })

    return { data: null, status: result.error.status ?? null }
  }

  const normalized = normalizePaginatedPosts(result.data, pageSize)

  if (!normalized) {
    logger.warn('[fetchPaginatedPostsByRoute] unexpected payload shape', {
      route,
      status: result.status,
      url,
    })

    return { data: null, status: result.status }
  }

  return { data: normalized, status: result.status }
}

const fetchPostByParamRoute = async (postId: number): Promise<null | PostViewModel> => {
  const url = buildRouteUrl(API_ROUTES.POSTS.PARAM(String(postId)), {
    pageNumber: 1,
    pageSize: 1,
    sortDirection: 'desc',
  })
  const result = await safeSsrFetchJson<{ items?: PostViewModel[] }>(url, REQUEST_OPTIONS)

  if (!result.ok) {
    logger.warn('[fetchPostByParamRoute] request failed', {
      kind: result.error.kind,
      postId,
      status: result.error.status,
      url,
    })

    return null
  }

  if (!Array.isArray(result.data.items)) {
    logger.warn('[fetchPostByParamRoute] unexpected payload shape', { postId, url })

    return null
  }

  return result.data.items.find(item => item.id === postId) || null
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
  const url = buildApiUrl(route)
  const result = await safeSsrFetchJson<PostViewModel>(url, REQUEST_OPTIONS)

  if (!result.ok) {
    logger.warn('[fetchPostByRoute] request failed', {
      kind: result.error.kind,
      route,
      status: result.error.status,
      url,
    })

    return { post: null, status: result.error.status ?? null }
  }

  return { post: result.data, status: result.status }
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
