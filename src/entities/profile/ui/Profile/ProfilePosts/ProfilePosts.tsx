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

const POST_MODAL_RETURN_KEY = 'post-modal-return-to'

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
    onDeleted: () => {
      handleClosePost()
    },
  })

  const syncUrlWithoutNavigation = useCallback((url: string, mode: 'push' | 'replace') => {
    if (typeof window === 'undefined') {
      return false
    }

    if (mode === 'push') {
      window.history.pushState(window.history.state, '', url)
    } else {
      window.history.replaceState(window.history.state, '', url)
    }

    return true
  }, [])

  const handleOpenPost = useCallback(
    (postId: number, href: string) => {
      if (typeof window !== 'undefined') {
        window.sessionStorage.removeItem(POST_MODAL_RETURN_KEY)
      }

      setModalUrlState({
        postId,
        source: 'profile',
      })

      if (!syncUrlWithoutNavigation(href, 'push')) {
        router.push(href, { scroll: false })
      }
    },
    [router, syncUrlWithoutNavigation]
  )

  const handleClosePost = useCallback(() => {
    setModalUrlState(prev => ({ ...prev, postId: null }))

    if (modalSource === 'home') {
      if (typeof window !== 'undefined') {
        const returnTo = window.sessionStorage.getItem(POST_MODAL_RETURN_KEY)

        window.sessionStorage.removeItem(POST_MODAL_RETURN_KEY)
        if (returnTo === 'home' && window.history.length > 1) {
          window.history.back()

          return
        }
      }

      router.replace(APP_ROUTES.ROOT, { scroll: false })

      return
    }

    const profileUrl = APP_ROUTES.PROFILE.ID(userId)
    const params = new URLSearchParams(typeof window === 'undefined' ? '' : window.location.search)

    params.delete('postId')
    params.delete('from')

    const queryString = params.toString()
    const nextUrl = queryString ? `${profileUrl}?${queryString}` : profileUrl

    if (!syncUrlWithoutNavigation(nextUrl, 'replace')) {
      router.replace(nextUrl, { scroll: false })
    }
  }, [modalSource, router, syncUrlWithoutNavigation, userId])

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
          <PostCard key={post.id} post={post} onOpen={handleOpenPost} />
        ))}
      </ul>

      {isPostModalOpen && (
        <>
          <PostModal
            key={currentPostIdNumber}
            open={isPostModalOpen && !isDeleteModalOpen}
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
