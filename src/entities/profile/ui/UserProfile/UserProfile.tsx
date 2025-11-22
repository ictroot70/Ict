'use client'

import { useGetPostsByUserQuery } from '@/entities/posts/api'
import { Profile, useGetPublicProfileQuery } from '@/entities/profile'
import { Loading } from '@/shared/composites'

type Props = {
  id: number
}

export default function UserProfile({ id }: Props) {
  const { data: userProfile, isLoading: isUserProfileLoading } = useGetPublicProfileQuery({
    profileId: id,
  })

  const { data: userPosts, isLoading: isUserPostsLoading } = useGetPostsByUserQuery({ userId: id })

  const isLoading = isUserProfileLoading || isUserPostsLoading

  if (isLoading) return <Loading />

  if (!userProfile) {
    return <div>User not found</div>
  }

  return <Profile profile={userProfile} posts={userPosts?.items} isAuthenticated />
}
