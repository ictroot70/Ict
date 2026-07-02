import type { PostLikesResponse, PostViewModel } from '@/entities/posts/api'

import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'

import {
  POST_LIKES_QUERY_ARG,
  getAvatarWhoLikes,
  useGetPostByIdQuery,
  useGetPostLikesQuery,
} from '@/entities/posts/api/postApi'
import { useFollowUserState } from '@/entities/users/hooks/useFollowUserState'
import { showToastAlert } from '@/shared/lib'
import { CommentFormData, DescriptionFormData, PostVariant } from '@/shared/types'

import { PostModalAuthState } from '../ui/PostModal/postModalLikeAction.types'
import { usePostComments } from './usePostComments'

type UiLanguage = 'en' | 'rus'

type BuildPostDataParams = {
  basePostData?: PostViewModel
  fallbackAvatarWhoLikes?: string[]
  initialPostData?: PostViewModel
  postLikesData?: PostLikesResponse
  shouldPreferInitialOptimisticFields: boolean
}

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

const buildPostData = ({
  basePostData,
  fallbackAvatarWhoLikes,
  initialPostData,
  postLikesData,
  shouldPreferInitialOptimisticFields,
}: BuildPostDataParams): PostViewModel | undefined => {
  if (!basePostData) {
    return undefined
  }

  const optimisticLikesCount = shouldPreferInitialOptimisticFields
    ? (initialPostData?.likesCount ?? basePostData.likesCount)
    : basePostData.likesCount

  return {
    ...basePostData,
    isLiked: shouldPreferInitialOptimisticFields
      ? (initialPostData?.isLiked ?? basePostData.isLiked)
      : basePostData.isLiked,
    likesCount: postLikesData?.totalCount ?? optimisticLikesCount,
    avatarWhoLikes: postLikesData
      ? getAvatarWhoLikes(postLikesData)
      : (fallbackAvatarWhoLikes ?? basePostData.avatarWhoLikes),
  }
}

const getPostVariant = (isAuthenticated: boolean, isOwnProfile: boolean): PostVariant => {
  if (!isAuthenticated) {
    return 'public'
  }

  return isOwnProfile ? 'myPost' : 'userPost'
}

export const usePostModal = (
  open: boolean,
  initialPostData?: PostViewModel,
  postId?: number,
  authState?: PostModalAuthState
) => {
  const [isEditingDescription, setIsEditingDescription] = useState(false)
  const [uiLanguage, setUiLanguage] = useState<UiLanguage>('en')
  const [expandedAnswersCommentId, setExpandedAnswersCommentId] = useState<number | null>(null)

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

  const user = authState?.user
  const isAuthUiLoading = authState?.isAuthUiLoading ?? false
  const isAuthenticatedUi = authState?.isAuthenticatedUi ?? false
  const queryPostId = postId ?? 0

  const {
    data: postDataFromQuery,
    isError: isPostError,
    isFetching: isPostFetching,
  } = useGetPostByIdQuery(queryPostId, {
    skip: !open || !postId || isAuthUiLoading,
    refetchOnMountOrArgChange: true,
  })

  const { data: postLikesData } = useGetPostLikesQuery(
    { postId: queryPostId, ...POST_LIKES_QUERY_ARG },
    {
      skip: !open || !postId || isAuthUiLoading || !isAuthenticatedUi,
      refetchOnMountOrArgChange: true,
    }
  )

  const isSameInitialPost = Boolean(initialPostData && postId && initialPostData.id === postId)
  const basePostData = postDataFromQuery ?? initialPostData
  const shouldPreferInitialOptimisticFields = Boolean(isPostFetching && isSameInitialPost)
  const fallbackAvatarWhoLikes =
    isAuthenticatedUi && isSameInitialPost
      ? initialPostData?.avatarWhoLikes
      : basePostData?.avatarWhoLikes

  const postData = buildPostData({
    basePostData,
    fallbackAvatarWhoLikes,
    initialPostData,
    postLikesData,
    shouldPreferInitialOptimisticFields,
  })

  const hasPostData = Boolean(postData)

  const isPostLoading = Boolean(open && postId && !hasPostData && isPostFetching)
  const uiText = postModalTextByLanguage[uiLanguage]

  const isOwnProfile = Boolean(
    isAuthenticatedUi && postData?.ownerId && user?.userId && postData.ownerId === user.userId
  )

  const ownerUserName = postData?.userName
  const variant = getPostVariant(isAuthenticatedUi, isOwnProfile)

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

  const commentsPostId = postData?.id ?? postId

  const {
    comments,
    totalCount: commentsTotalCount,
    loadMore: loadMoreComments,
    hasNextPage: hasNextCommentsPage,
    isFetchingNextPage: isFetchingNextCommentsPage,
    isLoading: isCommentsLoading,
    isError: isCommentsError,
    commentControl,
    handleCommentSubmit,
    watchComment,
    handlePublish,
    handleStartReply,
    replyTarget,
    isCommentPublishing,
    commentMaxLength,
  } = usePostComments({
    postId: commentsPostId,
    enabled: open && !isAuthUiLoading,
  })

  const handlePublishComment = async (data: CommentFormData) => {
    if (replyTarget) {
      setExpandedAnswersCommentId(replyTarget.commentId)
    }

    return handlePublish(data)
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

  const {
    isFollowing,
    isFollowPending,
    handleFollow: followOrUnfollow,
  } = useFollowUserState(ownerUserName || '', postData?.ownerId ?? 0)

  const handleFollow = async () => {
    if (isFollowPending) {
      return
    }
    await followOrUnfollow()
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
    actions: {
      handleCopyLink,
    },
    auth: {
      isAuthenticated: isAuthenticatedUi,
      isLoading: isAuthUiLoading,
    },
    comments: {
      control: commentControl,
      expandedAnswersCommentId,
      handlePublish: handlePublishComment,
      handleStartReply,
      handleSubmit: handleCommentSubmit,
      hasNextPage: hasNextCommentsPage,
      isError: isCommentsError,
      isFetchingNextPage: isFetchingNextCommentsPage,
      isLoading: isCommentsLoading,
      isPublishing: isCommentPublishing,
      items: comments,
      loadMore: loadMoreComments,
      maxLength: commentMaxLength,
      totalCount: commentsTotalCount,
      watch: watchComment,
    },
    description: {
      applyLocal: applyLocalDescription,
      control: descriptionControl,
      errors,
      handleCancel: handleCancelEdit,
      handleEdit: handleEditPost,
      handleSubmit: handleDescriptionSubmit,
      isEditing: isEditingDescription,
      setIsEditing: setIsEditingDescription,
      watch: watchDescription,
    },
    follow: {
      handleFollow,
      isFollowing,
      isPending: isFollowPending,
    },
    post: {
      data: postData,
      formattedCreatedAt,
      hasData: hasPostData,
      isError: isPostError,
      isLoading: isPostLoading,
      variant,
    },
    uiText,
  }
}
