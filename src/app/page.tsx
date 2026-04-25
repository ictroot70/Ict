import { GetPublicPostsResponse } from '@/entities/users/api/api.types'
import { Public } from '@/entities/users/ui'
import { API_ROUTES } from '@/shared/api'
import { buildApiUrl } from '@/shared/api/get-api-base-url'
import { logger } from '@/shared/lib/logger'
import { safeSsrFetchJson } from '@/shared/lib/ssr/safeSsrFetch'

const PUBLIC_POSTS_PAGE_SIZE = 4
const INITIAL_PUBLIC_POST_CURSOR = 0
const PUBLIC_SSR_REVALIDATE_SECONDS = 60

export const revalidate = 60

const fetchPublicPostsForSSR = async () => {
  const url = `${buildApiUrl(API_ROUTES.POSTS.ALL(INITIAL_PUBLIC_POST_CURSOR))}?pageSize=${PUBLIC_POSTS_PAGE_SIZE}`

  const result = await safeSsrFetchJson<GetPublicPostsResponse>(url, {
    next: {
      revalidate: PUBLIC_SSR_REVALIDATE_SECONDS,
    },
  })

  if (!result.ok) {
    logger.error('[HomePage] fetchPublicPostsForSSR failed', {
      bodyPreview: result.error.bodyPreview,
      kind: result.error.kind,
      status: result.error.status,
      url,
    })

    return null
  }

  return result.data
}

export default async function HomePage() {
  const data = await fetchPublicPostsForSSR()

  return <Public postsData={data} />
}
