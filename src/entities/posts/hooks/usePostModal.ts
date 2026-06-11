/* eslint-disable max-lines */
import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'

import {
  useCreateCommentMutation,
  useGetPostByIdQuery,
  useGetPostCommentsQuery,
} from '@/entities/posts/api/postApi'
import { useAuthUiState } from '@/features/posts/utils/useAuthUiState'
import { showToastAlert } from '@/shared/lib'
import {
  mapPostToModalData,
  PostModalData,
  PostVariant,
  CommentFormData,
  DescriptionFormData,
  PostViewModel,
  CommentsViewModel,
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
  const hasPostData = Boolean(postData)
  const isPostLoading = Boolean(open && resolvedPostId && !initialPostData && isPostFetching)
  const uiText = postModalTextByLanguage[uiLanguage]

  const { user, isAuthUiLoading, isAuthenticatedUi } = useAuthUiState()

  const [createComment, { isLoading: isCreateCommentLoading }] = useCreateCommentMutation()

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

  const numericPostId = Number(postModalData.postId)

  const { data: commentsData } = useGetPostCommentsQuery(
    {
      postId: numericPostId,
      pageSize: 12,
      pageNumber: 1,
      sortDirection: 'desc',
    },
    {
      skip: !open || !Number.isInteger(numericPostId),
    }
  )

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
  const comments = [...optimisticComments, ...serverComments]

  const handlePublish = async (data: CommentFormData) => {
    const trimmed = data.comment.trim()

    const isCommentValid = trimmed.length > 0 && trimmed.length <= COMMENT_MAX_LENGTH

    if (!isCommentValid || !Number.isInteger(numericPostId) || isCreateCommentLoading) {
      return
    }

    const optimisticId = `local-comment-${Date.now()}`

    const optimisticComment: CommentThreadItem = {
      id: optimisticId,
      content: trimmed,
      createdAt: new Date().toISOString(),
      userName: user?.name ?? 'UserName',
      isOptimistic: true,
    }

    setOptimisticComments(prev => [optimisticComment, ...prev])
    resetComment()

    try {
      await createComment({
        postId: numericPostId,
        body: { content: trimmed },
      }).unwrap()

      setOptimisticComments(prev => prev.filter(comment => comment.id !== optimisticId))
    } catch {
      setOptimisticComments(prev => prev.filter(comment => comment.id !== optimisticId))
      showToastAlert({ message: 'Failed to publish comment', type: 'error' })
    }
  }

  const handleEditPost = () => {
    setIsEditingDescription(true)
  }

  const handleCancelEdit = () => {
    resetDescription({ description: postModalData.description })
    setIsEditingDescription(false)
  }

  const applyLocalDescription = (description: string) => {
    setLocalPostData(prev => {
      if (!prev) {
        return prev
      }

      return {
        ...prev,
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
    isCreateCommentLoading,
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
