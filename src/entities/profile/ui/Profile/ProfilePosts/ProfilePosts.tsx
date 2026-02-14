'use client'
import { useRouter, useSearchParams } from 'next/navigation'
import React from 'react'
import s from './ProfilePosts.module.scss'

import { PostViewModel } from '@/entities/posts/api'
import { useDeletePostLogic } from '@/entities/posts/hooks/useDeletePostLogic'
import { useEditPostLogic } from '@/entities/posts/hooks/useEditPostLogic'

import { PostCard } from '@/entities/posts/ui/PostCard/PostCard'
import { DeletePostModal } from '@/entities/posts/ui/PostModal/DeletePostModal/DeletePostModal'
import { PostModal } from '@/entities/posts/ui/PostModal/PostModal'
import { Typography } from '@/shared/ui'

type Props = {
  posts: PostViewModel[]
  isOwnProfile: boolean
  userId: number
}

export const ProfilePosts: React.FC<Props> = ({ posts, isOwnProfile, userId }) => {
  const searchParams = useSearchParams()
  const router = useRouter()

  const currentPostId = searchParams.get('postId')
  const isPostModalOpen = !!currentPostId
  const currentPost = posts.find(p => p.id === Number(currentPostId))

  const { editingPostId, handleEditPost } = useEditPostLogic(userId, {
    enabled: isOwnProfile,
  })

  const {
    isDeleteModalOpen,
    isDeleting,
    handleConfirmDelete,
    handleCancelDelete,
    handleDeletePost,
  } = useDeletePostLogic(userId, {
    enabled: isOwnProfile,
  })

  const handleClosePost = () => router.replace(`/profile/${userId}`)

  const handleOpenPostModal = (postId: number) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('postId', String(postId))
    router.replace(`/profile/${userId}?${params.toString()}`, { scroll: false })
  }

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
          <PostCard key={post.id} post={post} onOpenModal={handleOpenPostModal} />
        ))}
      </ul>

      {isPostModalOpen && currentPost && (
        <>
          <PostModal
            open={isPostModalOpen}
            onClose={handleClosePost}
            onEditPost={isOwnProfile ? handleEditPost : undefined}
            onDeletePost={isOwnProfile ? handleDeletePost : undefined}
            isEditing={editingPostId === currentPost.id.toString()}
            /*   post={currentPost} */
          />

          <DeletePostModal
            isOpen={isDeleteModalOpen}
            onClose={handleCancelDelete}
            onConfirm={handleConfirmDelete}
            isLoading={isDeleting}
          />
        </>
      )}
    </div>
  )
}
