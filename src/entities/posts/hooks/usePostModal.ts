/* eslint-disable max-lines */
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'

import {
  POST_LIKES_QUERY_ARG,
  getAvatarWhoLikes,
  useCreateCommentMutation,
  useGetPostByIdQuery,
  useGetPostCommentsQuery,
  useGetPostLikesQuery,
} from '@/entities/posts/api/postApi'
import { useGetPublicProfileQuery } from '@/entities/profile/api'
import { useAuthUiState } from '@/features/posts/utils/useAuthUiState'
import { showToastAlert } from '@/shared/lib'
import {
  CommentFormData,
  CommentsViewModel,
  DescriptionFormData,
  PostVariant,
  PostViewModel,
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

const COMMENT_MAX_LENGTH = 300

export type CommentThreadItem = {
  id: number | string
  content: string
  createdAt: string
  userName: string
  avatar?: string
  isOptimistic?: boolean
}

export const usePostModal = (open: boolean, initialPostData?: PostViewModel, postId?: number) => {
  const [optimisticComments, setOptimisticComments] = useState<CommentThreadItem[]>([])
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
  const { user, isAuthUiLoading, isAuthenticatedUi } = useAuthUiState()

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

  // Показываем лоадер только если нет вообще никаких данных (ни из кэша, ни переданных)
  const isPostLoading = Boolean(open && resolvedPostId && !hasPostData && isPostFetching)
  const uiText = postModalTextByLanguage[uiLanguage]

  const { data: currentUserProfile, isLoading: isCurrentUserProfileLoading } =
    useGetPublicProfileQuery({ profileId: user?.userId ?? 0 }, { skip: !user?.userId })

  const currentUserName = user?.name ?? currentUserProfile?.userName ?? 'UserName'
  const currentUserAvatar =
    currentUserProfile?.avatars.find(avatar => avatar.width === 45)?.url ??
    currentUserProfile?.avatars[0]?.url

  const [createComment, { isLoading: isCreateCommentLoading }] = useCreateCommentMutation()

  const isOwnProfile = Boolean(
    isAuthenticatedUi && postData?.ownerId && user?.userId && postData.ownerId === user.userId
  )

  let variant: PostVariant = 'public'

  if (isAuthenticatedUi) {
    variant = isOwnProfile ? 'myPost' : 'userPost'
  }

  const numericPostId = Number(postData?.id ?? resolvedPostId)

  const { data: commentsData } = useGetPostCommentsQuery(
    {
      postId: numericPostId,
      pageSize: 12,
      pageNumber: 1,
      sortDirection: 'desc',
    },
    {
      skip: !open || !Number.isInteger(numericPostId) || numericPostId <= 0,
    }
  )

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

  const mapCommentToThreadItem = (comment: CommentsViewModel): CommentThreadItem => {
    const author = comment.from as CommentsViewModel['from'] & { username?: string }

    return {
      id: comment.id,
      content: comment.content,
      createdAt: comment.createdAt,
      userName: author.userName ?? author.username ?? 'UserName',
      avatar: author.avatars?.[0]?.url,
      isOptimistic: false,
    }
  }

  const serverComments = commentsData?.items.map(mapCommentToThreadItem) ?? []
  const serverCommentIds = new Set(serverComments.map(comment => comment.id))
  const visibleOptimisticComments = optimisticComments.filter(
    comment => !serverCommentIds.has(comment.id)
  )
  const comments = [...visibleOptimisticComments, ...serverComments]

  const handlePublish = async (data: CommentFormData) => {
    const trimmed = data.comment.trim()

    const isCommentValid = trimmed.length > 0 && trimmed.length <= COMMENT_MAX_LENGTH

    if (
      !isCommentValid ||
      !Number.isInteger(numericPostId) ||
      numericPostId <= 0 ||
      isCreateCommentLoading ||
      isCurrentUserProfileLoading
    ) {
      return
    }

    const optimisticId = `local-comment-${Date.now()}`

    const optimisticComment: CommentThreadItem = {
      id: optimisticId,
      content: trimmed,
      createdAt: new Date().toISOString(),
      userName: currentUserName,
      avatar: currentUserAvatar,
      isOptimistic: true,
    }

    setOptimisticComments(prev => [optimisticComment, ...prev])
    resetComment()

    try {
      const createdComment = await createComment({
        postId: numericPostId,
        body: { content: trimmed },
      }).unwrap()

      setOptimisticComments(prev =>
        prev.map(comment =>
          comment.id === optimisticId ? mapCommentToThreadItem(createdComment) : comment
        )
      )
    } catch {
      setOptimisticComments(prev => prev.filter(comment => comment.id !== optimisticId))
      showToastAlert({ message: 'Failed to publish comment', type: 'error' })
    }
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
    isCreateCommentLoading: isCreateCommentLoading || isCurrentUserProfileLoading,
    commentMaxLength: COMMENT_MAX_LENGTH,
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
