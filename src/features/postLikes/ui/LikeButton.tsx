import { LikeBtn } from '@/shared/composites/LikeBtn'

import { useLike } from '../model/useLike'

interface LikeButtonProps {
  postId: number
  ownerId: number
  isLiked: boolean
  className?: string
}

export const LikeButton = ({ postId, ownerId, isLiked, className }: LikeButtonProps) => {
  const { toggleLike, isLikeLoading } = useLike(postId, ownerId)

  return (
    <LikeBtn
      isLiked={isLiked}
      onClick={() => toggleLike(isLiked)}
      disabled={isLikeLoading}
      className={className}
    />
  )
}
