import { LikeBtn } from '@/shared/composites/LikeBtn'

import { type CurrentPostLikeUser, useLike } from '../model/useLike'

interface LikeButtonProps {
  postId: number
  ownerId: number
  isLiked: boolean
  currentUser?: CurrentPostLikeUser
  className?: string
}

export const LikeButton = ({
  postId,
  ownerId,
  isLiked,
  currentUser,
  className,
}: LikeButtonProps) => {
  const { toggleLike, isLikeLoading } = useLike(postId, ownerId, currentUser)

  return (
    <LikeBtn
      isLiked={isLiked}
      onClick={() => toggleLike(isLiked)}
      disabled={isLikeLoading}
      className={className}
    />
  )
}
