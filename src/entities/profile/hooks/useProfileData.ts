import { useMemo } from 'react'
import { useParams } from 'next/navigation'
import { useGetPublicProfileQuery } from '../api'
import { useGetPostsByUserQuery } from '@/entities/posts/api'
import { useAuth } from '@/features/posts/utils/useAuth'

export function useProfileData() {
  const { user, isAuthenticated, isLoading: isAuthLoading } = useAuth()
  const { id } = useParams<{ id: string }>()

  const userId = useMemo(() => {
    const parsed = Number(id)
    return isNaN(parsed) ? null : parsed
  }, [id])

  const isOwnProfile = userId === user?.userId

  const {
    data: userProfile,
    isLoading: isUserProfileLoading,
    error: profileError,
  } = useGetPublicProfileQuery({ profileId: userId! }, { skip: !userId })

  const {
    data: userPosts,
    isLoading: isUserPostsLoading,
    error: postsError,
  } = useGetPostsByUserQuery({ userId: userId! }, { skip: !userId || !userProfile })

  const isLoading = isUserProfileLoading || isUserPostsLoading || isAuthLoading
  const error = profileError || postsError
  const posts = userPosts?.items || []

  if (!isLoading && !error && !userProfile) {
    throw new Error('Profile data is unexpectedly undefined')
  }

  return { profile: userProfile, posts, isOwnProfile, isAuth: isAuthenticated, isLoading, error }
}
