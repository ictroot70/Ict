'use client'

import React from 'react'

import { APP_ROUTES, IMAGE_LOADING_STRATEGY, IMAGE_SIZES } from '@/shared/constant'
import { PostViewModel } from '@/shared/types'
import { SafeImage } from '@/shared/ui'
import Link from 'next/link'

import s from './PostCard.module.scss'

interface PostCardProps {
  post: PostViewModel
}

const DEFAULT_IMAGE = '/default-image.svg'

export const PostCard: React.FC<PostCardProps> = ({ post }) => {
  const href = APP_ROUTES.PROFILE.WITH_POST(post.ownerId, post.id, 'profile')

  return (
    <div className={s.postCard}>
      <Link href={href} scroll={false} prefetch={false} className={s.postImageWrapper}>
        <SafeImage
          {...IMAGE_LOADING_STRATEGY.default}
          src={post.images[0]?.url || DEFAULT_IMAGE}
          fallbackSrc={DEFAULT_IMAGE}
          alt={`Post by ${post.userName}`}
          fill
          sizes={IMAGE_SIZES.POST_CARD}
          telemetryLabel={'PostCard'}
          className={s.postImage}
        />
      </Link>
    </div>
  )
}
