import { memo } from 'react'

import { getAvatarImageSizes, IMAGE_LOADING_STRATEGY } from '@/shared/constant'
import { clsx } from 'clsx'
import Image, { StaticImageData } from 'next/image'

import s from './Avatar.module.scss'

type Props = {
  className?: string
  image?: null | string | StaticImageData
  alt?: string
  size?: number
  priority?: boolean
}
export const Avatar = memo(function Avatar({
  image,
  alt,
  className,
  size = 40,
  priority = false,
}: Props) {
  const DEFAULT_AVATAR = '/default-avatar.svg'
  const DEFAULT_AVATAR_ALT = 'Avatar'
  const classNames = clsx(s.avatar, className)
  const imageLoadingStrategy = priority ? IMAGE_LOADING_STRATEGY.lcp : IMAGE_LOADING_STRATEGY.low

  return (
    <Image
      {...imageLoadingStrategy}
      src={image || DEFAULT_AVATAR}
      width={size}
      height={size}
      sizes={getAvatarImageSizes(size)}
      alt={alt ?? DEFAULT_AVATAR_ALT}
      className={classNames}
    />
  )
})
