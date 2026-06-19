import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'

import { useGetPostByIdQuery } from '@/entities/posts/api/postApi'
import { useAuthUiState } from '@/features/posts/utils/useAuthUiState'
import { showToastAlert } from '@/shared/lib'
import {
  DescriptionFormData,
  mapPostToModalData,
  PostModalData,
  PostVariant,
  PostViewModel,
} from '@/shared/types'

import { usePostComments } from './usePostComments'

type UiLanguage = 'en' | 'rus'

const postModalTextByLanguage = {
  en: {
    loadingPost: 'Loading post...',
    unavailablePost: 'Post is unavailable',
    notFoundPost: 'Post not found or unavailable',
    copySuccess: 'Link copied',
    copyError: 'Failed to copy link',
  },
  rus: {
    loadingPost: 'Загрузка поста...',
    unavailablePost: 'Пост недоступен',
    notFoundPost: 'Пост не найден или недоступен',
    copySuccess: 'Ссылка скопирована',
    copyError: 'Не удалось скопировать ссылку',
  },
} as const

export const usePostModal = (open: boolean, initialPostData?: PostViewModel, postId?: number) => {
  const [isEditingDescription, setIsEditingDescription] = useState(false)
  const [uiLanguage, setUiLanguage] = useState<UiLanguage>('en')

  const {
    control: descriptionControl,
    handleSubmit: handleDescriptionSubmit,
    reset: resetDescription,
    watch: watchDescription,
    formState: { errors },
  } = useForm<DescriptionFormData>({
    defaultValues: { description: '' },
    mode: 'onChange',
  })

  const resolvedPostId = postId

  const {
    data: postDataFromQuery,
    isError: isPostError,
    isFetching: isPostFetching,
  } = useGetPostByIdQuery(resolvedPostId as number, {
    skip: !open || !resolvedPostId || !!initialPostData,
  })

  const basePostData = initialPostData ?? postDataFromQuery
  const [localPostData, setLocalPostData] = useState<PostViewModel | undefined>(basePostData)
  const postData = localPostData
  const commentsPostId = postData?.id ?? postId

  const {
    comments,
    commentControl,
    handleCommentSubmit,
    watchComment,
    handlePublish,
    isCommentPublishing,
    commentMaxLength,
  } = usePostComments({
    postId: commentsPostId,
    enabled: open,
  })

  const hasPostData = Boolean(postData)
  const isPostLoading = Boolean(open && resolvedPostId && !initialPostData && isPostFetching)
  const uiText = postModalTextByLanguage[uiLanguage]

  const { user, isAuthUiLoading, isAuthenticatedUi } = useAuthUiState()

  const isOwnProfile = Boolean(
    isAuthenticatedUi && postData?.ownerId && user?.userId && postData.ownerId === user.userId
  )

  let variant: PostVariant = 'public'

  if (isAuthenticatedUi) {
    variant = isOwnProfile ? 'myPost' : 'userPost'
  }

  const postModalData: PostModalData = postData
    ? mapPostToModalData(postData)
    : {
        images: [],
        userName: '',
        avatar: '',
        description: '',
        createdAt: new Date().toISOString(),
        postId: '',
        ownerId: undefined,
      }

  const formattedCreatedAt = new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(postModalData.createdAt))

  useEffect(() => {
    resetDescription({ description: postModalData.description })
  }, [postModalData.description, resetDescription])

  useEffect(() => {
    setLocalPostData(basePostData)
  }, [basePostData, resolvedPostId])

  useEffect(() => {
    const savedLanguage = localStorage.getItem('language')

    if (savedLanguage === 'en' || savedLanguage === 'rus') {
      setUiLanguage(savedLanguage)
    }
  }, [])

  const handleEditPost = () => {
    setIsEditingDescription(true)
  }

  const handleCancelEdit = () => {
    resetDescription({ description: postModalData.description })
    setIsEditingDescription(false)
  }

  const applyLocalDescription = (description: string) => {
    setLocalPostData(previousPostData => {
      if (!previousPostData) {
        return previousPostData
      }

      return {
        ...previousPostData,
        description,
        updatedAt: new Date().toISOString(),
      }
    })
  }

  const handleCopyLink = async () => {
    const url = window.location.href

    try {
      if (!window.isSecureContext || !navigator.clipboard?.writeText) {
        throw new Error('Clipboard API unavailable')
      }

      await navigator.clipboard.writeText(url)
      showToastAlert({ message: uiText.copySuccess, type: 'success' })
    } catch {
      showToastAlert({ message: uiText.copyError, type: 'error' })
    }
  }

  return {
    comments,
    isEditingDescription,
    setIsEditingDescription,
    commentControl,
    handleCommentSubmit,
    watchComment,
    descriptionControl,
    handleDescriptionSubmit,
    watchDescription,
    errors,
    postData: postModalData,
    variant,
    isAuthLoading: isAuthUiLoading,
    isCreateCommentLoading: isCommentPublishing,
    commentMaxLength,
    isAuthenticated: isAuthenticatedUi,
    isOwnProfile,
    hasPostData,
    isPostLoading,
    isPostError,
    uiText,
    formattedCreatedAt,
    handlePublish,
    handleEditPost,
    handleCancelEdit,
    handleCopyLink,
    applyLocalDescription,
  }
}
