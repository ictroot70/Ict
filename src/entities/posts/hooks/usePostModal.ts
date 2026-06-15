import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'

import {
  useUpdateLikeStatusMutation,
  useGetPostByIdQuery,
  PostViewModel,
} from '@/entities/posts/api'
import { getNextLikeStatus, patchPostLikeFields } from '@/entities/posts/lib/comment-likes'
import { useGetMyProfileQuery } from '@/entities/profile/api'
import { useAuthUiState } from '@/features/posts/utils/useAuthUiState'
import { showToastAlert } from '@/shared/lib'
import { COMMENT_CONTENT_MAX, commentFormSchema } from '@/shared/types/comments'
import {
  CommentFormData,
  DescriptionFormData,
  PostVariant,
  PostModalData,
  mapPostToModalData,
} from '@/shared/types/posts/models'
import { UserBase } from '@/shared/types/user/models'
import { zodResolver } from '@hookform/resolvers/zod'

import { useCreateCommentMutation } from '../api/postCommentsApi'

type UiLanguage = 'en' | 'rus'

const postModalTextByLanguage = {
  en: {
    loadingPost: 'Loading post...',
    unavailablePost: 'Post is unavailable',
    notFoundPost: 'Post not found or unavailable',
    copySuccess: 'Link copied',
    copyError: 'Failed to copy link',
    commentError: 'Failed to publish comment',
  },
  rus: {
    loadingPost: 'Загрузка поста...',
    unavailablePost: 'Пост недоступен',
    notFoundPost: 'Пост не найден или недоступен',
    copySuccess: 'Ссылка скопирована',
    copyError: 'Не удалось скопировать ссылку',
    commentError: 'Не удалось опубликовать комментарий',
  },
} as const

export const usePostModal = (open: boolean, initialPostData?: PostViewModel, postId?: number) => {
  const [isEditingDescription, setIsEditingDescription] = useState(false)
  const [uiLanguage, setUiLanguage] = useState<UiLanguage>('en')

  const {
    control: commentControl,
    handleSubmit: handleCommentSubmit,
    reset: resetComment,
    watch: watchComment,
  } = useForm<CommentFormData>({
    defaultValues: { comment: '' },
    resolver: zodResolver(commentFormSchema),
    mode: 'onChange',
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
    skip: !open || !resolvedPostId,
  })

  const basePostData = initialPostData ?? postDataFromQuery
  const [localPostData, setLocalPostData] = useState<PostViewModel | undefined>(basePostData)
  const postData = localPostData
  const hasPostData = Boolean(postData)

  const { user, isAuthUiLoading, isAuthenticatedUi } = useAuthUiState()
  const { data: myProfile } = useGetMyProfileQuery(undefined, { skip: !isAuthenticatedUi })
  const currentUserAvatar = myProfile?.avatars?.[0]?.url
  const [createComment, { isLoading: isPublishingComment }] = useCreateCommentMutation()
  const [updatePostLike, { isLoading: isPostLikeLoading }] = useUpdateLikeStatusMutation()

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
    if (basePostData) {
      setLocalPostData(prev => {
        if (!prev || prev.id !== basePostData.id) {
          return basePostData
        }

        return prev
      })
    }
  }, [basePostData])

  useEffect(() => {
    if (postDataFromQuery && localPostData?.id === postDataFromQuery.id) {
      setLocalPostData(prev => {
        if (!prev) {
          return prev
        }

        return {
          ...prev,
          isLiked: postDataFromQuery.isLiked,
          likesCount: postDataFromQuery.likesCount,
          avatarWhoLikes: postDataFromQuery.avatarWhoLikes,
        }
      })
    }
  }, [postDataFromQuery, localPostData?.id])

  useEffect(() => {
    const savedLanguage = localStorage.getItem('language')

    if (savedLanguage === 'en' || savedLanguage === 'rus') {
      setUiLanguage(savedLanguage)
    }
  }, [])

  const handleTogglePostLike = async () => {
    if (!localPostData || !resolvedPostId) {
      return
    }

    const previousPost = localPostData
    const likeStatus = getNextLikeStatus(previousPost.isLiked)
    const optimisticPost = { ...previousPost }

    patchPostLikeFields(optimisticPost, likeStatus, currentUserAvatar)
    setLocalPostData(optimisticPost)

    try {
      await updatePostLike({
        postId: resolvedPostId,
        userId: previousPost.ownerId,
        data: { likeStatus },
        currentUserAvatar,
      }).unwrap()
    } catch {
      setLocalPostData(previousPost)
      showToastAlert({ message: 'Failed to update like', type: 'error' })
    }
  }

  const currentUser: UserBase | undefined = user
    ? {
        id: user.userId,
        userName: user.name,
        avatars: myProfile?.avatars ?? [],
      }
    : undefined

  const handlePublish = async (data: CommentFormData) => {
    if (!resolvedPostId) {
      return
    }

    const content = data.comment.trim()

    const cleaned = content.replace(/@\S+\s*/g, '').trim()

    if (cleaned.length === 0) {
      return
    }

    resetComment()

    try {
      await createComment({
        postId: resolvedPostId,
        body: { content },
        optimisticFrom: currentUser,
      }).unwrap()
    } catch {
      showToastAlert({ message: postModalTextByLanguage[uiLanguage].commentError, type: 'error' })
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
      showToastAlert({ message: postModalTextByLanguage[uiLanguage].copySuccess, type: 'success' })
    } catch {
      showToastAlert({ message: postModalTextByLanguage[uiLanguage].copyError, type: 'error' })
    }
  }

  return {
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
    isAuthenticated: isAuthenticatedUi,
    isOwnProfile,
    hasPostData,
    isPostLoading: Boolean(open && resolvedPostId && !hasPostData && isPostFetching),
    isPostError,
    uiText: postModalTextByLanguage[uiLanguage],
    formattedCreatedAt,
    handlePublish,
    handleEditPost,
    handleCancelEdit,
    handleCopyLink,
    applyLocalDescription,
    isPublishingComment,
    currentUserId: user?.userId,
    currentUser,
    resolvedPostId,
    commentMaxLength: COMMENT_CONTENT_MAX,
    handleTogglePostLike,
    isPostLikeLoading,
  }
}
