'use client'

import React from 'react'

import { PostViewModel } from '@/shared/types'
import Image from 'next/image'
import Link from 'next/link'

import styles from './PostCard.module.scss'
import { usePathname, useSearchParams } from 'next/navigation'

interface PostCardProps {
  post: PostViewModel
  modalVariant: 'public' | 'myPost' | 'userPost'
  onEditPost?: (postId: string, description: string) => void
  onDeletePost?: (postId: string) => void
  isEditing?: boolean
  userId: number
  searchParams?: Promise<{postId?: number}>
}

export const PostCard: React.FC<PostCardProps> = ({
  post,
  onEditPost,
  onDeletePost,
  isEditing,
  userId,
}) => {
  // Формируем URL для intercepting route
  // const postUrl = `?postId=${post.id}`

  const searchParams = useSearchParams();
  const pathname = usePathname();
  const postId = post.id.toString();

  const createUrl = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('postId', postId);
    return `${pathname}?${params.toString()}`;
  };

  return (
    <div className={styles.postCard}>
      <Link
        // href={`?postId=${postId}`}
        href={createUrl()}
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
