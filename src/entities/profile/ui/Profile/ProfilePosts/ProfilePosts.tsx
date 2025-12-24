import React from 'react'

import s from './ProfilePosts.module.scss'

import { PostViewModel } from '@/entities/posts/api'

import { Typography } from '@/shared/ui'
import { PostCard } from '@/entities/posts/ui/PostCard/PostCard'

type Props = {
  posts: PostViewModel[]
  isOwnProfile: boolean
}

export const ProfilePosts: React.FC<Props> = ({ posts, isOwnProfile }) => {
  if (!posts?.length) {
    return (
      <Typography variant={'h1'} className={s.message}>
        {isOwnProfile
          ? "You haven't published any posts yet"
          : "This user hasn't published any posts yet"}
      </Typography>
    )
  }

  return (
    <div className={s.wrapper}>
      <ul className={s.posts}>
        {posts.map(post => (
          <PostCard key={post.id} post={post} />
        ))}
      </ul>
    </div>
  )
}
