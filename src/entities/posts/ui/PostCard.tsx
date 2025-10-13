'use client'

import React from 'react'
import Image from 'next/image'
import styles from './PostCard.module.scss'

interface PostCardProps {
  id: number
  images: { url: string }[]
  avatarOwner?: string
  userName: string
  createdAt: string
  description?: string
}

export const PostCard: React.FC<PostCardProps> = ({
  id,
  images,
  description,
}) => {
  const firstImage = images?.[0]?.url || '/placeholder.png'
  return (
    <div key={id} className={styles.postCard}>
      <div className={styles.postImageWrapper}>
        <Image
          src={firstImage}
          alt={description || 'Post image'}
          width={300}
          height={300}
          className={styles.postImage}
        />
      </div>
    </div>
  )
}
