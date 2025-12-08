import React from 'react'

import { PostCard } from '@/entities/posts/ui/PostCard/PostCard'
import { PostViewModel } from '@/shared/types'
import { Typography } from '@/shared/ui'

import s from '../Profile.module.scss'

interface ProfilePostsProps {
  posts?: PostViewModel[]
  isOwnProfile: boolean
  onEditPost?: (postId: string, description: string) => void
  onDeletePost?: (postId: string) => void
  isEditing: string | null
  profileId: number
}

export const ProfilePosts: React.FC<ProfilePostsProps> = ({
  posts,
  isOwnProfile,
  onEditPost,
  onDeletePost,
  isEditing,
  profileId,
}) => {
  if (!posts?.length) {
    return (
      <Typography variant={'h1'} className={s.profile__message}>
        {isOwnProfile
          ? "You haven't published any posts yet"
          : "This user hasn't published any posts yet"}
      </Typography>
    )
  }

  return (
    <ul className={s.profile__posts}>
      {posts.map(post => (
        <PostCard
          key={post.id}
          post={post}
          onEditPost={onEditPost}
          onDeletePost={onDeletePost}
          isEditing={isEditing === post.id.toString()}
          userId={profileId}
        />
      ))}
    </ul>
  )
}
