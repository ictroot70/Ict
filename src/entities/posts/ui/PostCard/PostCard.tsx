'use client'

import React from 'react'

import Link from 'next/link'
import Image from 'next/image'

import { PostViewModel } from '@/shared/types'
import { useRouter, useSearchParams } from 'next/navigation'

import s from './PostCard.module.scss'
import { PostModal } from '../PostModal/PostModal'
import { useEditPostLogic } from '../../hooks/useEditPostLogic'
import { useDeletePostLogic } from '../../hooks/useDeletePostLogic'
import { DeletePostModal } from '../PostModal/DeletePostModal/DeletePostModal'

interface PostCardProps {
  post: PostViewModel
}

export const PostCard: React.FC<PostCardProps> = ({ post }) => {

  const searchParams = useSearchParams()
  const router = useRouter()
  const isPostModalOpen = searchParams.get('postId') === String(post.id)
  const params = new URLSearchParams({ postId: String(post.id) })
  const handleClosePost = () => router.replace(`/profile/${post.ownerId}`)

  const { editingPostId, handleEditPost } = useEditPostLogic(post.ownerId)

  const { isDeleteModalOpen,
    isDeleting,
    handleConfirmDelete,
    handleCancelDelete,
    handleDeletePost } = useDeletePostLogic(post.ownerId)

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
        onEditPost={handleEditPost}
        onDeletePost={handleDeletePost}
        isEditing={editingPostId === post.ownerId.toString()}
      />

      <DeletePostModal
        isOpen={isDeleteModalOpen}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        isLoading={isDeleting} />

    </div>
  )
}
