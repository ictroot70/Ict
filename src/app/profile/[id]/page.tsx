'use client'

import { useGetPostsByUserQuery } from '@/entities/posts/api'
import { Profile, useGetPublicProfileQuery } from '@/entities/profile'
import { useAuth } from '@/features/posts/utils/useAuth'
import { Loading } from '@/shared/composites'
import { useParams } from 'next/navigation'

export default function ProfilePage() {
  const { id } = useParams<{ id: string }>()
  const userId = Number(id)

  const { user, isAuthenticated, isLoading: isAuthLoading } = useAuth()

  const { data: userProfile, isLoading: isUserProfileLoading } = useGetPublicProfileQuery({
    profileId: userId,
  })

  const { data: userPosts, isLoading: isUserPostsLoading } = useGetPostsByUserQuery({ userId })


  const isLoading = isAuthLoading || isUserProfileLoading || isUserPostsLoading

  if (isLoading) {
    return <Loading />
  }

  if (!userProfile) {
    return <div>User not found</div>
  }

  return <Profile profile={userProfile} posts={userPosts?.items || []} isOwnProfile={userId === user?.userId} isAuthenticated={isAuthenticated} />
}
