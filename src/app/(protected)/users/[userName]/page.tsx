'use client'

import { useGetPostsByUserQuery } from '@/entities/posts/api'
import { Profile, useGetProfileByUserNameQuery } from '@/entities/profile'
import { Loading } from '@/shared/composites'

import { useParams } from 'next/navigation'

export default function User() {
  const { userName } = useParams()

  const { data: userProfile, isLoading: isUserProfileLoading } = useGetProfileByUserNameQuery(
    { userName: (userName || '') as string },
    { skip: !userName }
  )

  const { data: userPosts, isLoading: isUserPostsLoading } = useGetPostsByUserQuery(
    { userId: userProfile?.id || 0 },
    { skip: !userProfile }
  )

  const isLoading = isUserProfileLoading || isUserPostsLoading

  if (isLoading) return <Loading />

  if (!userProfile) {
    return <div>User not found</div>
  }

  return <Profile profile={userProfile} posts={userPosts?.items} isAuthenticated />
}
