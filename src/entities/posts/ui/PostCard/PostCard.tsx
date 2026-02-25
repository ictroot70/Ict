'use client'

import React from 'react'

import Link from 'next/link'
import Image from 'next/image'

import { PostViewModel } from '@/shared/types'

import s from './PostCard.module.scss'

interface PostCardProps {
  post: PostViewModel
  onOpenModal?: (postId: number) => void
}

const DEFAULT_IMAGE = '/default-image.svg'

export const PostCard: React.FC<PostCardProps> = ({ post, onOpenModal }) => {
  const params = new URLSearchParams({ postId: String(post.id) })

  return (
    <div className={s.postCard}>
      <Link
        href={`/profile/${post.ownerId}?${params.toString()}`}
        scroll={false}
        prefetch={false}
        className={s.postImageWrapper}
        onClick={e => {
          if (onOpenModal) {
            e.preventDefault()
            onOpenModal(post.id)
          }
        }}
      >
        <Image
          src={post.images[0]?.url || DEFAULT_IMAGE}
          alt={`Post by ${post.userName}`}
          width={342}
          height={228}
          className={s.postImage}
          priority
        />
      </Link>
    </div>
  )
}
