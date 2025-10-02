'use client'
import { useGetPostsByUserQuery } from '@/entities/posts/api'
import { useGetPublicProfileQuery } from '@/entities/profile'
import { Profile } from '@/entities/profile/ui'
import { Loading } from '@/shared/composites'
import { useParams } from 'next/navigation'

export default function PublicUser() {
  const { id } = useParams()

  const profileId = typeof id === 'string' ? id : ''

  const { data: publicProfile, isLoading: isProfileLoading } = useGetPublicProfileQuery(
    { profileId },
    {
      skip: !profileId,
    }
  )

  const { data: postsData, isLoading: isPostsLoading } = useGetPostsByUserQuery(
    { userId: +profileId },
    {
      skip: !profileId,
    }
  )

  const isLoading = isProfileLoading || isPostsLoading

  if (isLoading) return <Loading />

  if (!publicProfile) {
    return <div>User not found</div>
  }

  return <Profile profile={publicProfile} posts={postsData?.items} />
}
