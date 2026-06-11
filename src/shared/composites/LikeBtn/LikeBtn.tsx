import React, { CSSProperties } from 'react'

import { Heart, HeartOutline } from '@/shared/ui'
import { Button } from '@ictroot/ui-kit'

interface LikeBtnProps {
  isLiked: boolean
  onClick: () => void
  disabled?: boolean
  // color?: CSSProperties['color']
  className?: string
}

export const LikeBtn = ({ isLiked, onClick, className, /*color,*/ disabled }: LikeBtnProps) => {
  return (
    <Button
      variant={'text'}
      className={className}
      onClick={onClick}
      aria-label={'Like'}
      disabled={disabled}
    >
      {isLiked && <Heart color={`var(--color-danger-500)`} className={className} />}
      {!isLiked && <HeartOutline color={`var(--color-light-100)`} className={className} />}
    </Button>
  )
}
