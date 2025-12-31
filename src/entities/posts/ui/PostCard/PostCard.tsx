'use client'

import React from 'react'

import { PostViewModel } from '@/shared/types'
import Image from 'next/image'
import Link from 'next/link'

import styles from './PostCard.module.scss'

interface PostCardProps {
  post: PostViewModel
  modalVariant: 'public' | 'myPost' | 'userPost'
  onEditPost?: (postId: string, description: string) => void
  onDeletePost?: (postId: string) => void
  isEditing?: boolean
  userId: number
}

export const PostCard: React.FC<PostCardProps> = ({
  post,
  onEditPost,
  onDeletePost,
  isEditing,
  userId,
}) => {
  // Формируем URL для intercepting route
  const postUrl = `/post/${post.id}`

  return (
    <div className={styles.postCard}>
      <Link
        href={postUrl}
        scroll={false}
        prefetch={false}
        className={styles.postImageWrapper}
      >
        <Image
          src={post.images[0]?.url || '/fallback-image.jpg'}
          alt={`Post by ${post.userName}`}
          width={342}
          height={228}
          className={styles.postImage}
          priority
        />
      </Link>
    </div>
  )
}
