'use client'
import { useGetPostsByUserQuery } from '@/entities/posts/api'
import { useGetPublicProfileQuery } from '@/entities/profile'
import { Profile } from '@/entities/profile/ui'
import { Loading } from '@/shared/composites'

type Props = {
  id: number
}

export default function PublicUser({ id }: Props) {
  const { data: publicProfile, isLoading: isProfileLoading } = useGetPublicProfileQuery({
    profileId: id,
  })
  const { data: postsData, isLoading: isPostsLoading } = useGetPostsByUserQuery({ userId: id })

  const isLoading = isProfileLoading || isPostsLoading

  if (isLoading) return <Loading />

  if (!publicProfile) {
    return <div>User not found</div>
  }

  return <Profile profile={publicProfile} posts={postsData?.items} />
}
