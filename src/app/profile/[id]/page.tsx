import type { PaginatedPosts } from '@/entities/posts/api'
import type { PostOpenSource } from '@/shared/constant'

import { fetchPostByIdForSSR, fetchUserPosts } from '@/entities/posts/lib'
import { fetchProfileData } from '@/entities/profile/lib'
import { Profile } from '@/entities/profile/ui'
import { logger } from '@/shared/lib/logger'
import { getSsrFetchErrorStatus } from '@/shared/lib/ssr/safeSsrFetch'

type Props = {
  params: Promise<{ id: string }>
  searchParams: Promise<{
    from?: string | string[]
    postId?: string | string[]
  }>
}

const PAGE_SIZE = 8

const POST_SOURCES: ReadonlySet<PostOpenSource> = new Set(['home', 'profile', 'direct'])

const getSingleSearchParam = (value?: string | string[]) =>
  Array.isArray(value) ? value[0] : value

const isPostSource = (value: string): value is PostOpenSource =>
  POST_SOURCES.has(value as PostOpenSource)

const parsePostId = (raw?: string) => {
  const parsed = raw ? Number(raw) : Number.NaN

  return Number.isInteger(parsed) && parsed > 0 ? parsed : null
}

const parsePostSource = (raw?: string): PostOpenSource =>
  raw && isPostSource(raw) ? raw : 'direct'

const getEmptyPosts = (pageSize: number): PaginatedPosts => ({
  items: [],
  totalCount: 0,
  pageSize,
})

const NotFoundView = () => (
  <div>
    <h1>Profile not found</h1>
  </div>
)

const ServerUnavailableView = () => (
  <div>
    <h1>Server unavailable</h1>
    <p>Please try again later.</p>
  </div>
)

const renderProfileError = (error: unknown, userId: number) => {
  const status = getSsrFetchErrorStatus(error)

  logger.error('[ProfilePage] fetchProfileData failed', {
    userId,
    status,
    errorMessage: error instanceof Error ? error.message : 'Unknown error',
  })

  if (status === 404) {
    return <NotFoundView />
  }

  return <ServerUnavailableView />
}

export const revalidate = 60

export default async function ProfilePage({ params, searchParams }: Readonly<Props>) {
  const [{ id }, query] = await Promise.all([params, searchParams])
  const userId = Number(id)

  if (!Number.isInteger(userId) || userId <= 0) {
    return <NotFoundView />
  }

  const initialPostId = parsePostId(getSingleSearchParam(query.postId))
  const initialPostSource = parsePostSource(getSingleSearchParam(query.from))

  let profileDataServer

  try {
    profileDataServer = await fetchProfileData(userId)
  } catch (error) {
    return renderProfileError(error, userId)
  }

  const [postsResult, initialPostResult] = await Promise.allSettled([
    fetchUserPosts(userId, PAGE_SIZE, profileDataServer.userName),
    initialPostId ? fetchPostByIdForSSR(initialPostId) : Promise.resolve(null),
  ])

  const postsData =
    postsResult.status === 'fulfilled' ? postsResult.value : getEmptyPosts(PAGE_SIZE)
  const initialPostDataServer =
    initialPostResult.status === 'fulfilled' ? initialPostResult.value : null

  return (
    <Profile
      profileDataServer={profileDataServer}
      postsDataServer={postsData}
      initialPostIdServer={initialPostId}
      initialPostDataServer={initialPostDataServer}
      initialPostSourceServer={initialPostSource}
    />
  )
}
