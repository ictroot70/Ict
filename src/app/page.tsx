import { GetPublicPostsResponse } from '@/entities/users/api/api.types'
import { Public } from '@/entities/users/ui'
import { apiFetch } from '@/lib/api'
import { API_ROUTES } from '@/shared/api'
import { buildApiUrl } from '@/shared/api/get-api-base-url'

const PUBLIC_POSTS_PAGE_SIZE = 4
const INITIAL_PUBLIC_POST_CURSOR = 0
const PUBLIC_SSR_REVALIDATE_SECONDS = 60

export const revalidate = 60

const fetchPublicPostsForSSR = async () => {
  const url = `${buildApiUrl(API_ROUTES.PUBLIC_POSTS.ALL(INITIAL_PUBLIC_POST_CURSOR))}?pageSize=${PUBLIC_POSTS_PAGE_SIZE}`

  return apiFetch<GetPublicPostsResponse>(url, {
    next: {
      revalidate: PUBLIC_SSR_REVALIDATE_SECONDS,
    },
  })
}

export default async function HomePage() {
  const { data } = await fetchPublicPostsForSSR()

  return <Public postsData={data || null} />
}
