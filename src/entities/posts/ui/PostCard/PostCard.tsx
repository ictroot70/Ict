'use client'

import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import styles from './PostCard.module.scss'
import PostModal from '@/entities/profile/ui/PostModal/PostModal'

interface PostCardProps {
  id: number
  images: { url: string }[]
  avatarOwner?: string
  userName: string
  createdAt: string
  description?: string
  modalVariant: 'public' | 'myPost' | 'userPost'

  onEditPost?: (postId: string, newDescription: string) => void
  onDeletePost?: (postId: string) => void
  isEditing?: boolean
  image: string
  userId: number
}

export const PostCard: React.FC<PostCardProps> = ({
  id,
  onEditPost,
  onDeletePost,
  isEditing,
  image,
  userId,
}) => {
  const searchParams = useSearchParams()
  const router = useRouter()
  const postIdParam = searchParams.get('postId')
  const isPostModalOpen = postIdParam === String(id)
  const handleClosePost = () => router.replace(`/profile/${userId}`)

  console.log('PostCard render - id:', id, 'isPostModalOpen:', isPostModalOpen)


  return (
    <div key={id} className={styles.postCard}>
      <div className={styles.postImageWrapper}>
        <Link href={`/profile/${userId}?postId=${id}`} scroll={false} prefetch={false}>
          <Image
            src={image}
            alt={id.toString() || 'Post image'}
            width={342}
            height={228}
            className={styles.postImage}
          />
        </Link>
      </div>
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