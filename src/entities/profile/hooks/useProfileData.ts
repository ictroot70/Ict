import { useMemo } from 'react'
import { useParams } from 'next/navigation'
import { useGetPublicProfileQuery } from '../api'
import { useGetPostsByUserQuery } from '@/entities/posts/api'

export function useProfileData() {
  const { id } = useParams<{ id: string }>()

  const userId = useMemo(() => {
    const parsed = parseInt(id)
    return isNaN(parsed) ? null : parsed
  }, [id])

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

  const isLoading = isUserProfileLoading || isUserPostsLoading
  const error = profileError || postsError
  const posts = userPosts?.items || []

  if (!isLoading && !error && !userProfile) {
    throw new Error('Profile data is unexpectedly undefined')
  }

  return { profile: userProfile, posts, isLoading, error }
}
