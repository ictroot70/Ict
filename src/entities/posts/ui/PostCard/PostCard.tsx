'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import styles from './PostCard.module.scss'
import PostModal from '@/entities/profile/ui/PostModal/PostModal'
import { PostImageViewModel } from '@/entities/posts/api'

interface PostCardProps {
  id: number
  // images: { url: string }[]
  images: PostImageViewModel[]
  avatarOwner?: string
  userName: string
  createdAt: string
  description?: string
  modalVariant: 'public' | 'myPost' | 'userPost'
}

export const PostCard: React.FC<PostCardProps> = ({
  id,
  images,
  description,
  modalVariant,
  avatarOwner,
  userName,
  createdAt,
}) => {
  const firstImage = images?.[0]?.url || '/placeholder.png'

  const [isPostModalOpen, setIsPostModalOpen] = useState(false)

  const handleOpenPost = () => {
    setIsPostModalOpen(true)
  }
  const handleClosePost = () => setIsPostModalOpen(false)

  return (
    <div
      key={id}
      className={styles.postCard}
    >
      <div className={styles.postImageWrapper}>
        <Image
          src={firstImage}
          alt={description || 'Post image'}
          width={342}
          height={228}
          className={styles.postImage}
          onClick={() => handleOpenPost()}
        />
      </div>
      <PostModal
        open={isPostModalOpen}
        onClose={handleClosePost}
        images={images}
        variant={modalVariant}
        avatarOwner={avatarOwner}
        userName={userName}
        createdAt={createdAt}
        description={description}
      />
    </div>
  )
}
