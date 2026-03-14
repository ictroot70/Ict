'use client'
import { useEffect, useState } from 'react'

import { PublicPostResponse } from '@/entities/users/api/api.types'
import { useTimeAgo } from '@/entities/users/hooks/useTimeAgo'
import { Carousel } from '@/shared/composites'
import { Avatar } from '@/shared/composites/Avatar'
import { APP_ROUTES, IMAGE_LOADING_STRATEGY, IMAGE_SIZES } from '@/shared/constant'
import { SafeImage } from '@/shared/ui'
import { Typography } from '@ictroot/ui-kit'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

import s from './PublicPost.module.scss'

type Props = {
  post: PublicPostResponse
  urlProfile: string
  isPriorityPost?: boolean
}

const DEFAULT_IMAGE = '/default-image.svg'
const POST_MODAL_RETURN_KEY = 'post-modal-return-to'

export const PublicPost = ({ post, urlProfile, isPriorityPost = false }: Props) => {
  const { id, ownerId, userName, images, avatarOwner, description, createdAt } = post
  const router = useRouter()

  const timeAgo = useTimeAgo(createdAt)
  const postUrl = APP_ROUTES.PROFILE.WITH_POST(ownerId, id, 'home')
  const imageLoadingStrategy = isPriorityPost
    ? IMAGE_LOADING_STRATEGY.lcp
    : IMAGE_LOADING_STRATEGY.default

  const MAX_CHAR_COUNT = 67

  const [isExpanded, setIsExpanded] = useState(false)
  const isLongDescription = description.length >= MAX_CHAR_COUNT

  const toggleDescriptionDisplayHandler = () => {
    setIsExpanded(prev => !prev)
  }

  useEffect(() => {
    router.prefetch(postUrl)
  }, [postUrl, router])

  return (
    <div className={s.post}>
      <Link
        href={postUrl}
        scroll={false}
        className={s.post__media}
        onClick={event => {
          const target = event.target as HTMLElement

          if (target.closest('button')) {
            event.preventDefault()
            event.stopPropagation()

            return
          }

          const isPlainLeftClick =
            event.button === 0 &&
            !event.metaKey &&
            !event.ctrlKey &&
            !event.shiftKey &&
            !event.altKey

          if (isPlainLeftClick) {
            window.sessionStorage.setItem(POST_MODAL_RETURN_KEY, 'home')
          }
        }}
      >
        {images.length > 1 ? (
          <Carousel
            slides={images}
            imageSizes={IMAGE_SIZES.PUBLIC_POST}
            priorityFirstImage={isPriorityPost}
          />
        ) : (
          <SafeImage
            {...imageLoadingStrategy}
            src={images[0]?.url || DEFAULT_IMAGE}
            fallbackSrc={DEFAULT_IMAGE}
            alt={'Image'}
            fill
            sizes={IMAGE_SIZES.PUBLIC_POST}
            telemetryLabel={'PublicPost'}
            className={s.post__image}
          />
        )}
      </Link>

      <div className={s.post__user}>
        <Avatar image={avatarOwner} size={36} />
        <Link href={urlProfile}>
          <Typography variant={"h3"}>{userName}</Typography>
        </Link>
      </div>

      <div className={s.post__content}>
        <Typography className={s.post__time} variant={"small_text"}>
          {timeAgo}
        </Typography>
        <div className={s.post__description}>
          <Typography className={s.post__text} variant={"regular_14"}>
            {isExpanded || !isLongDescription
              ? description
              : description.slice(0, MAX_CHAR_COUNT) + '...'}
          </Typography>
          {isLongDescription && (
            <Typography
              asChild
              onClick={toggleDescriptionDisplayHandler}
              variant={"regular_link"}
              className={s.post__toggle}
            >
              <button type={"button"}>{isExpanded ? 'Hide' : 'ShowMore'}</button>
            </Typography>
          )}
        </div>
      </div>
    </div>
  )
}
