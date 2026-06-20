'use client'

import type { PostLikeActionProps } from '@/entities/posts/ui/PostModal/postModalLikeAction.types'

import { Profile, type ProfileProps } from '@/entities/profile/ui'
import { LikeButton } from '@/features/postLikes/ui/LikeButton'
import { useAuthUiState } from '@/features/posts/utils/useAuthUiState'

type ProfileWithPostLikesProps = Omit<ProfileProps, 'renderPostLikeAction'>

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
