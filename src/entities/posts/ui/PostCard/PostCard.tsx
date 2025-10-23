'use client'

import React, { useState } from 'react'
import Image from 'next/image'
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

  onEditPost?: (postId: string) => void
  onDeletePost?: (postId: string) => void
  isEditing?: boolean
  userId?: number
}

export const PostCard: React.FC<PostCardProps> = ({
  id,
  images,
  description,
  modalVariant,
  avatarOwner,
  userName,
  createdAt,
  onEditPost,
  onDeletePost,
  isEditing,
  userId,
}) => {
  const firstImage = images?.[0]?.url || '/placeholder.png'

  console.log(firstImage)

  const [isPostModalOpen, setIsPostModalOpen] = useState(false)
  const [modalImages, setModalImages] = useState<string[]>([])

  const handleOpenPost = (images: string[]) => {
    setModalImages(images)
    setIsPostModalOpen(true)
  }

  const getProcessedImageUrl = (url: string) => {
    if (!url) return '/placeholder.png';
    try {
      new URL(url);
      return url;
    } catch {

      return encodeURI(url).replace(/\s/g, '%20');
    }
  };

  const firstImageUrl = images?.[0]?.url ? getProcessedImageUrl(images[0].url) : '/placeholder.png';

  const handleClosePost = () => setIsPostModalOpen(false)

  return (
    <div
      key={id}
      onClick={() => handleOpenPost(images.map(img => img.url))}
      className={styles.postCard}
    >
      <div className={styles.postImageWrapper}>
        <img
          src={firstImage}
          alt={description || 'Post image'}
          className={styles.postImage}
          onError={(e) => {
            console.error('Failed to load image:', firstImage)
            e.currentTarget.src = '/placeholder.png'
          }}
          onLoad={() => console.log('Image loaded successfully:', firstImage)}
        />
      </div>
      <PostModal
        open={isPostModalOpen}
        onClose={handleClosePost}
        images={modalImages}
        variant={modalVariant}
        avatarOwner={avatarOwner}
        userName={userName}
        createdAt={createdAt}
        description={description}
        postId={id.toString()}
        userId={userId || 0}
        onEditPost={onEditPost}
        onDeletePost={onDeletePost}
        isEditing={isEditing}
      />
    </div>
  )
}