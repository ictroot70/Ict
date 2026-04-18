import type { PaginatedPosts } from '@/entities/posts/api'
import type { PostOpenSource } from '@/shared/constant'

import { fetchPostByIdForSSR, fetchUserPosts } from '@/entities/posts/lib'
import { fetchProfileData, resolveProfileSsrFailureMode } from '@/entities/profile/lib'
import { Profile, ProfileClientRecovery } from '@/entities/profile/ui'
import { logger } from '@/shared/lib/logger'

type Props = {
  params: Promise<{ id: string }>
  searchParams: Promise<{
    from?: string | string[]
    postId?: string | string[]
  }>
}

const getSingleSearchParam = (value?: string | string[]) => {
  if (Array.isArray(value)) {
    return value[0]
  }

  return value
}

const isPostSource = (value: string): value is PostOpenSource => {
  return value === 'home' || value === 'profile' || value === 'direct'
}

const getEmptyPosts = (pageSize: number): PaginatedPosts => ({
  items: [],
  totalCount: 0,
  pageSize,
})

export const dynamic = 'force-dynamic'

export default async function ProfilePage({ params, searchParams }: Props) {
  const { id } = await params
  const query = await searchParams
  const userId = Number(id)
  const pageSize = 8

  if (!Number.isInteger(userId) || userId <= 0) {
    return (
      <div>
        <h1>Profile not found</h1>
      </div>
    )
  }

  const postIdRaw = getSingleSearchParam(query.postId)
  const parsedPostId = postIdRaw ? Number(postIdRaw) : NaN
  const postId = Number.isInteger(parsedPostId) && parsedPostId > 0 ? parsedPostId : null
  const sourceRaw = getSingleSearchParam(query.from)
  const source = sourceRaw && isPostSource(sourceRaw) ? sourceRaw : 'direct'

  let profileDataServer

  try {
    profileDataServer = await fetchProfileData(userId)
  } catch (error) {
    const failureMode = resolveProfileSsrFailureMode(error)

    logger.error('[ProfilePage] fetchProfileData failed', {
      failureMode,
      userId,
      errorMessage: error instanceof Error ? error.message : 'Unknown error',
    })

    if (failureMode === 'not_found') {
      return (
        <div>
          <h1>Profile not found</h1>
        </div>
      )
    }

    return (
      <ProfileClientRecovery userId={userId} initialPostId={postId} initialPostSource={source} />
    )
  }

  const [postsResult, initialPostResult] = await Promise.allSettled([
    fetchUserPosts(userId, pageSize, profileDataServer.userName),
    postId ? fetchPostByIdForSSR(postId) : Promise.resolve(null),
  ])

  const postsData = postsResult.status === 'fulfilled' ? postsResult.value : getEmptyPosts(pageSize)
  const initialPostDataServer =
    initialPostResult.status === 'fulfilled' ? initialPostResult.value : null

  return (
    <Profile
      profileDataServer={profileDataServer}
      postsDataServer={postsData}
      initialPostIdServer={postId}
      initialPostDataServer={initialPostDataServer}
      initialPostSourceServer={source}
    />
  )
}
