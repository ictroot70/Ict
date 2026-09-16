'use client'

import type { PostLikeActionProps } from '@/entities/posts/ui/PostModal/postModalLikeAction.types'

import { Profile, type ProfileProps } from '@/entities/profile/ui'
import { useGetUserByUserNameQuery } from '@/entities/users/api'
import { LikeButton } from '@/features/postLikes/ui/LikeButton'
import { useAuthUiState } from '@/features/posts/utils/useAuthUiState'
import { Loading } from '@/shared/composites'
import { APP_ROUTES } from '@/shared/constant'
import { Typography } from '@/shared/ui'
import Link from 'next/link'

type ProfileWithPostLikesProps = Omit<ProfileProps, 'renderPostLikeAction'>

type ProfileWithPostLikesByUserNameProps = {
  userName: string
}

const USERNAME_PROFILE_PAGE_SIZE = 8

const getErrorStatus = (error: unknown) => {
  if (typeof error === 'object' && error !== null && 'status' in error) {
    return (error as { status?: unknown }).status
  }

  return undefined
}

export const ProfileWithPostLikes = (props: Readonly<ProfileWithPostLikesProps>) => {
  const { user, isAuthUiLoading, isAuthenticatedUi } = useAuthUiState()

  const renderPostLikeAction = ({ postId, ownerId, isLiked, className }: PostLikeActionProps) => (
    <LikeButton
      postId={postId}
      ownerId={ownerId}
      isLiked={isLiked}
      className={className}
      currentUser={user ? { userId: user.userId, userName: user.name } : undefined}
    />
  )

  return (
    <Profile
      {...props}
      postModalAuthState={{ user, isAuthUiLoading, isAuthenticatedUi }}
      renderPostLikeAction={renderPostLikeAction}
    />
  )
}

export const ProfileWithPostLikesByUserName = ({
  userName,
}: Readonly<ProfileWithPostLikesByUserNameProps>) => {
  const authState = useAuthUiState()
  const { data, error, isFetching, isLoading } = useGetUserByUserNameQuery(userName, {
    skip: !authState.isAuthenticatedUi,
  })

  if (authState.isAuthUiLoading || isLoading || isFetching) {
    return <Loading />
  }

  if (!authState.isAuthenticatedUi) {
    return (
      <div>
        <Typography variant={'h2'}>Sign in to view this profile</Typography>
        <Link href={APP_ROUTES.AUTH.LOGIN}>Sign In</Link>
      </div>
    )
  }

  const status = getErrorStatus(error)

  if (status === 401) {
    return (
      <div>
        <Typography variant={'h2'}>Sign in to view this profile</Typography>
        <Link href={APP_ROUTES.AUTH.LOGIN}>Sign In</Link>
      </div>
    )
  }

  if (status === 404) {
    return (
      <div>
        <h1>Profile not found</h1>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div>
        <h1>Server unavailable</h1>
        <p>Please try again later.</p>
      </div>
    )
  }

  return (
    <ProfileWithPostLikes
      resolvedUserId={data.id}
      profileDataServer={{
        id: data.id,
        userName: data.userName,
        aboutMe: data.aboutMe,
        avatars: data.avatars,
        isFollowing: data.isFollowing,
        isFollowedBy: data.isFollowedBy,
        userMetadata: {
          followers: data.followersCount,
          following: data.followingCount,
          publications: data.publicationsCount,
        },
      }}
      postsDataServer={{
        items: [],
        pageSize: USERNAME_PROFILE_PAGE_SIZE,
        totalCount: 0,
      }}
    />
  )
}
