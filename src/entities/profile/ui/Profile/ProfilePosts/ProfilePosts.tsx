import React from 'react'

import s from '../Profile.module.scss'

import { PostViewModel } from '@/entities/posts/api'

import { Typography } from '@/shared/ui'
import { PostCard } from '@/entities/posts/ui/PostCard/PostCard'


type Props = {
  posts: PostViewModel[]
  isOwnProfile: boolean
}

export const ProfilePosts: React.FC<Props> = ({
  posts,
  isOwnProfile
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
        /*         onEditPost={onEditPost}
                onDeletePost={onDeletePost}
                isEditing={isEditing === post.id.toString()}
                userId={profileId} */
        />
      ))}
    </ul>
  )
}
