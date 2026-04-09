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

export default async function ProfilePage({ params, searchParams }: Props) {
  const { id } = await params
  const query = await searchParams
  const userId = Number(id)
  const pageSize = 8
  const postIdRaw = getSingleSearchParam(query.postId)
  const parsedPostId = postIdRaw ? Number(postIdRaw) : NaN
  const postId = Number.isInteger(parsedPostId) && parsedPostId > 0 ? parsedPostId : null
  const sourceRaw = getSingleSearchParam(query.from)
  const source = sourceRaw && isPostSource(sourceRaw) ? sourceRaw : 'direct'

  try {
    const [profileData, postsData, initialPostDataServer] = await Promise.all([
      fetchProfileData(userId),
      fetchUserPosts(userId, pageSize),
      postId ? fetchPostByIdForSSR(postId) : Promise.resolve(null),
    ])

    return (
      <Profile
        profileDataServer={profileData}
        postsDataServer={postsData}
        initialPostIdServer={postId}
        initialPostDataServer={initialPostDataServer}
        initialPostSourceServer={source}
      />
    )
  } catch (error) {
    console.error('Error fetching profile or posts data:', error)

    return (
      <div>
        <h1>Profile not found</h1>
      </div>
    )
  }
}
