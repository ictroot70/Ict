'use client'
import Image from 'next/image'
import { PublicPostResponse } from '@/entities/users/api/api.types'
import { useTimeAgo } from '@/entities/users/hooks/useTimeAgo'
import { Avatar } from '@/shared/composites/Avatar'
import { Typography } from '@ictroot/ui-kit'
import Link from 'next/link'
import { useState } from 'react'
import s from './PublicPost.module.scss'
import Carousel from './Carousel/Carousel'

type Props = {
  post: PublicPostResponse
  urlProfile: string
}

const DEFAULT_IMAGE = '/default-image.svg'

export const PublicPost = ({ post, urlProfile }: Props) => {
  const { userName, images, avatarOwner, description, createdAt } = post

  const timeAgo = useTimeAgo(createdAt)

  const MAX_CHAR_COUNT = 67

  const [isExpanded, setIsExpanded] = useState(false)
  const isLongDescription = description.length >= MAX_CHAR_COUNT

  const toggleDescriptionDisplayHandler = () => {
    setIsExpanded(prev => !prev)
  }

  return (
    <div className={s.post}>
      <div className={s.post__media}>
        {images.length > 1 ? (
          <Carousel slides={images} />
        ) : (
          <Image src={images[0]?.url || DEFAULT_IMAGE} alt="Image" fill className={s.post__image} />
        )}
      </div>

      <div className={s.post__user}>
        <Avatar image={avatarOwner} size={36} />
        <Link href={urlProfile}>
          <Typography variant="h3">{userName}</Typography>
        </Link>
      </div>

      <div className={s.post__content}>
        <Typography className={s.post__time} variant="small_text">
          {timeAgo}
        </Typography>
        <div className={s.post__description}>
          <Typography className={s.post__text} variant="regular_14">
            {isExpanded || !isLongDescription
              ? description
              : description.slice(0, MAX_CHAR_COUNT) + '...'}
          </Typography>
          {isLongDescription && (
            <Typography
              asChild
              onClick={toggleDescriptionDisplayHandler}
              variant="regular_link"
              className={s.post__toggle}
            >
              <button>{isExpanded ? 'Hide' : 'ShowMore'}</button>
            </Typography>
          )}
        </div>
      </div>
    </div>
  )
}
