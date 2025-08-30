/** @prettier */
'use client'

import Image from 'next/image'
import { Typography } from '@ictroot/ui-kit'
import { useState } from 'react'
import s from './PublicPost.module.scss'
import { PublicPostResponse } from '@/entities/users/api/api.types'
import { useTimeAgo } from '@/entities/users/hooks/useTimeAgo'
import Carousel from './Carousel/Carousel'

type Props = {
  post: PublicPostResponse
}

export const PublicPost = ({ post }: Props) => {
  const { userName, images, avatarOwner, description, createdAt } = post

  const timeAgo = useTimeAgo(createdAt)

  const MAX_CHAR_COUNT = 70

  const [isExpanded, setIsExpanded] = useState(false)
  const isLongDescription = description.length >= MAX_CHAR_COUNT

  const toggleDescriptionDisplayHandler = () => {
    setIsExpanded(prev => !prev)
  }

  return (
    <div className={s.wrapper}>
      <div className={s.imageContainer}>
        {images.length > 1 ? (
          <Carousel slides={images} />
        ) : (
          <Image src={images[0].url} alt="Image" fill className={s.image} />
        )}
      </div>

      <div className={s.user}>
        <div className={s.avatar}>
          <Image
            src={avatarOwner ?? '/avatar-default.svg'}
            alt="User avatar"
            width={36}
            height={36}
            className={s.image}
          />
        </div>
        <Typography variant="h3">{userName}</Typography>
      </div>

      <div className={s.content}>
        <Typography className={s.time} variant="small_text">
          {timeAgo}
        </Typography>
        <div className={s.descriptionWrapper}>
          <Typography
            className={`${s.description} ${isExpanded ? s.descriptionExpanded : s.descriptionCollapsed}`}
            variant="regular_14"
          >
            {isExpanded || !isLongDescription
              ? description
              : description.slice(0, MAX_CHAR_COUNT) + '...'}
          </Typography>
          {isLongDescription && (
            <Typography
              asChild
              onClick={toggleDescriptionDisplayHandler}
              variant="regular_link"
              className={s.link}
            >
              <button>{isExpanded ? 'Hide' : 'ShowMore'}</button>
            </Typography>
          )}
        </div>
      </div>
    </div>
  )
}
