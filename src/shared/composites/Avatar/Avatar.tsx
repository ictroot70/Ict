import Image from 'next/image'
import s from './Avatar.module.scss'
import clsx from 'clsx'

type Props = {
  className?: string
  image?: null | string
  alt?: string
  size?: number
}
export const Avatar = ({ image, alt, className, size = 40 }: Props) => {
  const DEFAULT_AVATAR = '/default-avatar.svg'
  const DEFAULT_AVATAR_ALT = 'Avatar'
  const classNames = clsx(s.avatar, className)
  return (
    <Image
      src={image || DEFAULT_AVATAR}
      width={size}
      height={size}
      alt={alt ?? DEFAULT_AVATAR_ALT}
      className={classNames}
    />
  )
}
