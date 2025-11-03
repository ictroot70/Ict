'use client'
import { useGetPostsByUserQuery } from '@/entities/posts/api'
import { Profile, useGetMyProfileQuery, useGetProfileWithPostsQuery, useGetProfileByUserNameQuery } from '@/entities/profile'
import { Loading } from '@/shared/composites'

export default function MyProfile() {
  const { data: myProfile, isLoading: isMyProfileLoading } = useGetMyProfileQuery()

  const userName = myProfile?.userName
  const userId = myProfile?.id

  const { data: fullMyProfile, isLoading: isFullMyProfileLoading } = useGetProfileByUserNameQuery(
    { userName: userName || '' },
    { skip: !userName }
  )

  const { data: myPosts, isLoading: isPostsLoading } = useGetPostsByUserQuery(
    { userId: userId || 0 },
    { skip: !userId }
  )

  const isLoading = isMyProfileLoading || isFullMyProfileLoading || isPostsLoading

  if (isLoading) return <Loading />

  if (!fullMyProfile) {
    return <div>User not found</div>
  }

  return <Profile profile={fullMyProfile} posts={myPosts?.items} isAuthenticated isOwnProfile />
}
