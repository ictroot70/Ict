import type { PaginatedPosts } from '@/entities/posts/api'
import type { PostOpenSource } from '@/shared/constant'

import { fetchPostByIdForSSR, fetchUserPosts } from '@/entities/posts/lib'
import { fetchProfileData } from '@/entities/profile/lib'
import { Profile } from '@/entities/profile/ui'

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

const getErrorStatus = (error: unknown) => {
  if (typeof error === 'object' && error !== null && 'status' in error) {
    const status = (error as { status?: unknown }).status

    return typeof status === 'number' ? status : null
  }

  return null
}

const getEmptyPosts = (pageSize: number): PaginatedPosts => ({
  items: [],
  totalCount: 0,
  pageSize,
})

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

  const [profileResult, postsResult, initialPostResult] = await Promise.allSettled([
    fetchProfileData(userId),
    fetchUserPosts(userId, pageSize),
    postId ? fetchPostByIdForSSR(postId) : Promise.resolve(null),
  ])

  if (profileResult.status === 'rejected') {
    console.error('Error fetching profile data:', profileResult.reason)
    const status = getErrorStatus(profileResult.reason)

    if (status === 404) {
      return (
        <div>
          <h1>Profile not found</h1>
        </div>
      )
    }

    return (
      <div>
        <h1>Server unavailable</h1>
        <p>Please try again later.</p>
      </div>
    )
  }

  if (postsResult.status === 'rejected') {
    console.error('Error fetching profile posts data:', postsResult.reason)
  }

  if (initialPostResult.status === 'rejected') {
    console.error('Error fetching initial post data:', initialPostResult.reason)
  }

  const postsData = postsResult.status === 'fulfilled' ? postsResult.value : getEmptyPosts(pageSize)
  const initialPostDataServer =
    initialPostResult.status === 'fulfilled' ? initialPostResult.value : null

  return (
    <Profile
      profileDataServer={profileResult.value}
      postsDataServer={postsData}
      initialPostIdServer={postId}
      initialPostDataServer={initialPostDataServer}
      initialPostSourceServer={source}
    />
  )
}
