import { LikeBtn } from '@/shared/composites/LikeBtn'

import { useLike } from '../model/useLike'

interface LikeButtonProps {
  postId: number
  isLiked: boolean
  className?: string
}

export const LikeButton = ({ postId, isLiked, className }: LikeButtonProps) => {
  const { toggleLike, isLikeLoading } = useLike(postId)

  return (
    <LikeBtn
      isLiked={isLiked}
      onClick={() => toggleLike(isLiked)}
      disabled={isLikeLoading}
      className={className}
    />
  )
}
