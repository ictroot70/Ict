'use client'
import React, { Suspense, useCallback, useState } from 'react'

import { PostViewModel } from '@/entities/posts/api'
import { useDeletePostLogic } from '@/entities/posts/hooks/useDeletePostLogic'
import { useEditPostLogic } from '@/entities/posts/hooks/useEditPostLogic'
import { PostCard } from '@/entities/posts/ui/PostCard/PostCard'
import { DeletePostModal } from '@/entities/posts/ui/PostModal/DeletePostModal/DeletePostModal'
import { PostModal } from '@/entities/posts/ui/PostModal/PostModal'
import { APP_ROUTES, type PostOpenSource } from '@/shared/constant'
import { Typography } from '@/shared/ui'
import { useRouter, useSearchParams } from 'next/navigation'

import s from './ProfilePosts.module.scss'

type Props = {
  posts: PostViewModel[]
  isOwnProfile: boolean
  userId: number
  initialPostIdServer?: null | number
  initialPostDataServer?: null | PostViewModel
  initialPostSourceServer?: PostOpenSource
}

const isPostSource = (value: string): value is PostOpenSource =>
  value === 'home' || value === 'profile' || value === 'direct'

type ModalUrlState = {
  postId: null | number
  source: PostOpenSource
}

const getPostIdFromParam = (value: null | string): null | number => {
  const parsedPostId = value ? Number(value) : NaN

  return Number.isInteger(parsedPostId) && parsedPostId > 0 ? parsedPostId : null
}

const getModalStateFromSearchParams = (
  searchParams: URLSearchParams,
  initialSource: PostOpenSource
): ModalUrlState => {
  const sourceParam = searchParams.get('from')
  const source = sourceParam && isPostSource(sourceParam) ? sourceParam : initialSource

  return {
    postId: getPostIdFromParam(searchParams.get('postId')),
    source,
  }
}

const ProfilePostsSearchParamsSync = ({
  initialSource,
  onChange,
}: {
  initialSource: PostOpenSource
  onChange: (value: ModalUrlState) => void
}) => {
  const searchParams = useSearchParams()

  React.useEffect(() => {
    onChange(getModalStateFromSearchParams(searchParams, initialSource))
  }, [searchParams, initialSource, onChange])

  return null
}

export const ProfilePosts: React.FC<Props> = ({
  posts,
  isOwnProfile,
  userId,
  initialPostIdServer = null,
  initialPostDataServer = null,
  initialPostSourceServer = 'direct',
}) => {
  const [modalUrlState, setModalUrlState] = useState<ModalUrlState>({
    postId: initialPostIdServer,
    source: initialPostSourceServer,
  })
  const router = useRouter()
  const currentPostIdNumber = modalUrlState.postId
  const isPostModalOpen = currentPostIdNumber !== null
  const currentPost = currentPostIdNumber
    ? posts.find(p => p.id === currentPostIdNumber)
    : undefined
  const modalSource = modalUrlState.source
  // SSR payload is preferred for initial direct/profile open; otherwise fallback to list item.
  const modalPostData =
    initialPostDataServer && initialPostIdServer === currentPostIdNumber
      ? initialPostDataServer
      : currentPost
  const handleModalStateFromUrl = useCallback((value: ModalUrlState) => {
    setModalUrlState(prev =>
      prev.postId === value.postId && prev.source === value.source ? prev : value
    )
  }, [])

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

  const handleClosePost = () => {
    setModalUrlState(prev => ({ ...prev, postId: null }))

    if (modalSource === 'home') {
      router.replace(APP_ROUTES.ROOT, { scroll: false })

      return
    }

    router.replace(APP_ROUTES.PROFILE.ID(userId), { scroll: false })
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
      <Suspense fallback={null}>
        <ProfilePostsSearchParamsSync
          initialSource={initialPostSourceServer}
          onChange={handleModalStateFromUrl}
        />
      </Suspense>
      <ul className={s.posts}>
        {posts.map(post => (
          <PostCard key={post.id} post={post} />
        ))}
      </ul>

      {isPostModalOpen && (
        <>
          <PostModal
            key={currentPostIdNumber}
            open={isPostModalOpen}
            onClose={handleClosePost}
            onEditPost={isOwnProfile ? handleEditPost : undefined}
            onDeletePost={isOwnProfile ? handleDeletePost : undefined}
            isEditing={editingPostId === String(currentPostIdNumber)}
            postId={currentPostIdNumber ?? undefined}
            postData={modalPostData}
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
