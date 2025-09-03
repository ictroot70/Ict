import Image from 'next/image'
import s from './Avatar.module.scss'
import clsx from 'clsx'

type Props = {
  className?: string
  image?: null | string
  alt?: string
}

export const Avatar = ({ image, alt, className }: Props) => {
  const DEFAULT_AVATAR = '/avatar-default.svg'
  const DEFAULT_AVATAR_ALT = 'Avatar'
  const classNames = {
    avatar: clsx(s.avatar, className),
  }
  return (
    <div className={classNames.avatar}>
      <Image
        src={image ?? DEFAULT_AVATAR}
        fill
        alt={alt ?? DEFAULT_AVATAR_ALT}
        className={s.image}
      />
    </div>
  )
}
