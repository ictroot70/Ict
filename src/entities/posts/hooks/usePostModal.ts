import type { PostViewModel } from '@/entities/posts/api'

import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'

import {
  POST_LIKES_QUERY_ARG,
  getAvatarWhoLikes,
  useGetPostByIdQuery,
  useGetPostLikesQuery,
} from '@/entities/posts/api/postApi'
import { PostModalAuthState } from '@/entities/posts/ui/PostModal/postModalLikeAction.types'
import { showToastAlert } from '@/shared/lib'
import {
  CommentFormData,
  DescriptionFormData,
  mapPostToModalData,
  PostModalData,
  PostVariant,
} from '@/shared/types'

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

export const usePostModal = (
  open: boolean,
  initialPostData?: PostViewModel,
  postId?: number,
  authState?: PostModalAuthState
) => {
  const [comments, setComments] = useState<string[]>([])
  const [isEditingDescription, setIsEditingDescription] = useState(false)
  const [uiLanguage, setUiLanguage] = useState<UiLanguage>('en')

  const {
    control: commentControl,
    handleSubmit: handleCommentSubmit,
    reset: resetComment,
    watch: watchComment,
  } = useForm<CommentFormData>({
    defaultValues: { comment: '' },
  })

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
  const user = authState?.user
  const isAuthUiLoading = authState?.isAuthUiLoading ?? false
  const isAuthenticatedUi = authState?.isAuthenticatedUi ?? false

  const {
    data: postDataFromQuery,
    isError: isPostError,
    isFetching: isPostFetching,
  } = useGetPostByIdQuery(resolvedPostId as number, {
    skip: !open || !resolvedPostId || isAuthUiLoading,
    refetchOnMountOrArgChange: true,
  })

  const { data: postLikesData } = useGetPostLikesQuery(
    { postId: resolvedPostId as number, ...POST_LIKES_QUERY_ARG },
    {
      skip: !open || !resolvedPostId || isAuthUiLoading || !isAuthenticatedUi,
      refetchOnMountOrArgChange: true,
    }
  )

  const isSameInitialPost = Boolean(
    initialPostData && resolvedPostId && initialPostData.id === resolvedPostId
  )
  const basePostData = postDataFromQuery ?? initialPostData
  const shouldPreferInitialOptimisticFields = Boolean(isPostFetching && isSameInitialPost)
  const fallbackAvatarWhoLikes =
    isAuthenticatedUi && isSameInitialPost
      ? initialPostData?.avatarWhoLikes
      : basePostData?.avatarWhoLikes

  const postData = basePostData
    ? {
        ...basePostData,
        isLiked: shouldPreferInitialOptimisticFields
          ? (initialPostData?.isLiked ?? basePostData.isLiked)
          : basePostData.isLiked,
        likesCount:
          postLikesData?.totalCount ??
          (shouldPreferInitialOptimisticFields
            ? (initialPostData?.likesCount ?? basePostData.likesCount)
            : basePostData.likesCount),
        avatarWhoLikes: postLikesData
          ? getAvatarWhoLikes(postLikesData)
          : (fallbackAvatarWhoLikes ?? basePostData.avatarWhoLikes),
      }
    : undefined

  const hasPostData = Boolean(postData)

  const isPostLoading = Boolean(open && resolvedPostId && !hasPostData && isPostFetching)
  const uiText = postModalTextByLanguage[uiLanguage]

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
        id: 0,
        images: [],
        userName: '',
        avatar: '',
        description: '',
        createdAt: new Date().toISOString(),
        ownerId: undefined,
        likesCount: 0,
        isLiked: false,
        avatarWhoLikes: [],
      }

  const formattedCreatedAt = new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(postData?.createdAt ?? new Date().toISOString()))

  useEffect(() => {
    resetDescription({ description: postData?.description ?? '' })
  }, [postData?.description, resetDescription])

  useEffect(() => {
    const savedLanguage = localStorage.getItem('language')

    if (savedLanguage === 'en' || savedLanguage === 'rus') {
      setUiLanguage(savedLanguage)
    }
  }, [])

  const handlePublish = (data: CommentFormData) => {
    const trimmed = data.comment.trim()

    if (!trimmed) {
      return
    }
    setComments(prev => [...prev, trimmed])
    resetComment()
  }

  const handleEditPost = () => {
    setIsEditingDescription(true)
  }

  const handleCancelEdit = () => {
    resetDescription({ description: postData?.description ?? '' })
    setIsEditingDescription(false)
  }

  const applyLocalDescription = (description: string) => {
    resetDescription({ description })
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
    postData,
    variant,
    isAuthLoading: isAuthUiLoading,
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
    resolvedPostId,
    currentUserId: user?.userId,
    currentUserName: user?.userName ?? '',
    currentUserAvatar: user?.avatarUrl ?? '',
  }
}