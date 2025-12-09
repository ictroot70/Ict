'use client'

import React from 'react'

import Link from 'next/link'
import Image from 'next/image'

import { PostViewModel } from '@/shared/types'
import { useRouter, useSearchParams } from 'next/navigation'

import s from './PostCard.module.scss'
import { PostModal } from '../PostModal/PostModal'

interface PostCardProps {
  post: PostViewModel
  /*   onEditPost?: (postId: string, description: string) => void
    onDeletePost?: (postId: string) => void
    isEditing?: boolean */
  /*  userId: number */
}

export const PostCard: React.FC<PostCardProps> = ({
  post,
  /*   onEditPost,
    onDeletePost,
    isEditing, */
  /*   userId, */
}) => {
  const searchParams = useSearchParams()
  const router = useRouter()
  const isPostModalOpen = searchParams.get('postId') === String(post.id)

  const handleClosePost = () => router.replace(`/profile/${post.ownerId}`)

  const params = new URLSearchParams({ postId: String(post.id) })

  return (
    <div className={s.postCard}>
      <Link
        href={`/profile/${post.ownerId}?${params.toString()}`}
        scroll={false}
        prefetch={false}
        className={s.postImageWrapper}
      >
        <Image
          src={post.images[0]?.url || '/fallback-image.jpg'}
          alt={`Post by ${post.userName}`}
          width={342}
          height={228}
          className={s.postImage}
          priority
        />
      </Link>

      <PostModal
        open={isPostModalOpen}
        onClose={handleClosePost}
      /*         onEditPost={onEditPost}
              onDeletePost={onDeletePost}
              isEditing={isEditing} */
      />
    </div>
  )
}
