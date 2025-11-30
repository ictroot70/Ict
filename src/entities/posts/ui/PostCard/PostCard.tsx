'use client'

import React from 'react'

import { PostModal } from '@/entities/profile/ui/PostModal/PostModal'
import { PostViewModel } from '@/shared/types'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'

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
  const searchParams = useSearchParams()
  const router = useRouter()
  const isPostModalOpen = searchParams.get('postId') === String(post.id)

  const handleClosePost = () => router.replace(`/profile/${userId}`)

  const params = new URLSearchParams({ postId: String(post.id) })

  return (
    <div className={styles.postCard}>
      <Link
        href={`/profile/${userId}?${params.toString()}`}
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

      <PostModal
        open={isPostModalOpen}
        onClose={handleClosePost}
        onEditPost={onEditPost}
        onDeletePost={onDeletePost}
        isEditing={isEditing}
      />
    </div>
  )
}
