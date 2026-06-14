import { Heart, HeartOutline } from '@/shared/ui'
import { Button } from '@ictroot/ui-kit'

interface LikeBtnProps {
  isLiked: boolean
  onClick: () => void
  disabled?: boolean
  className?: string
}

export const LikeBtn = ({ isLiked, onClick, className, disabled }: LikeBtnProps) => {
  return (
    <Button
      variant={'text'}
      className={className}
      onClick={onClick}
      aria-label={isLiked ? 'Unlike post' : 'Like post'}
      disabled={disabled}
    >
      {isLiked && <Heart color={`var(--color-danger-500)`} className={className} />}
      {!isLiked && <HeartOutline color={`var(--color-light-100)`} className={className} />}
    </Button>
  )
}
