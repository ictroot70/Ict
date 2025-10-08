'use client'

import React from 'react'
import Image from 'next/image'
import { timeAgo } from '@/features/posts/lib/timeAgo'
import EmblaCarousel from '@/entities/posts/ui/EmblaCarousel'
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
                                                    avatarOwner,
                                                    userName,
                                                    createdAt,
                                                    description,
                                                  }) => {
  return (
    <div key={id} className={styles.postCard}>
      <EmblaCarousel photos={images.map(i => i.url)} />

      <div className={styles.postInfo}>
        <div className={styles.userRow}>
          <Image
            src={avatarOwner || '/favicon.ico'}
            alt={userName}
            width={36}
            height={36}
            className={styles.avatar}
          />
          <span className={styles.username}>{userName}</span>
        </div>

        <span className={styles.time}>{timeAgo(createdAt)}</span>

        {description && <p className={styles.description}>{description}</p>}
      </div>
    </div>
  )
}
