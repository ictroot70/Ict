import { memo } from 'react'

import { clsx } from 'clsx'
import Image, { StaticImageData } from 'next/image'

import s from './Avatar.module.scss'

type Props = {
  className?: string
  image?: null | string | StaticImageData
  alt?: string
  size?: number
}
export const Avatar = memo(function Avatar({ image, alt, className, size = 40 }: Props) {
  const DEFAULT_AVATAR = '/default-avatar.svg'
  const DEFAULT_AVATAR_ALT = 'Avatar'
  const classNames = clsx(s.avatar, className)

  return (
    <Image
      priority
      src={image || DEFAULT_AVATAR}
      width={size}
      height={size}
      alt={alt ?? DEFAULT_AVATAR_ALT}
      className={classNames}
    />
  )
})
