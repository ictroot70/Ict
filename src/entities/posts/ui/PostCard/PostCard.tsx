'use client'

import type { PostViewModel } from '@/entities/posts/api'

import React from 'react'

import { APP_ROUTES, IMAGE_LOADING_STRATEGY, IMAGE_SIZES } from '@/shared/constant'
import Image from 'next/image'
import Link from 'next/link'

import s from './PostCard.module.scss'

// Optional UC-5 feed like preview. Uncomment the LikeButton/Typography imports
// and the postStats block below if the team approves likes directly on post cards.
// import { LikeButton } from '@/features/postLikes/ui/LikeButton'
// import { Typography } from '@/shared/ui'

interface PostCardProps {
  post: PostViewModel
}

const DEFAULT_IMAGE = '/default-image.svg'

export const PostCard: React.FC<PostCardProps> = ({ post }) => {
  const href = APP_ROUTES.PROFILE.WITH_POST(post.ownerId, post.id, 'profile')

  return (
    <div className={s.postCard}>
      <Link href={href} scroll={false} prefetch={false} className={s.postImageWrapper}>
        <Image
          {...IMAGE_LOADING_STRATEGY.default}
          src={post.images[0]?.url || DEFAULT_IMAGE}
          alt={`Post by ${post.userName}`}
          fill
          sizes={IMAGE_SIZES.POST_CARD}
          className={s.postImage}
        />
      </Link>
      {/* Optional UC-5 feed like preview. Keep disabled unless the team approves this UI.
        <div className={s.postStats}>
          <LikeButton
            postId={post.id}
            ownerId={post.ownerId}
            isLiked={post.isLiked}
            className={s.likeButton}
          />
          <Typography variant={'regular_14'} color={'light'}>
            {post.likesCount}
          </Typography>
        </div>
      */}
    </div>
  )
}
