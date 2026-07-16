'use client'

import { useEffect, useRef, useState } from 'react'

import { POST_LIKES_QUERY_ARG, getAvatarWhoLikes, useGetPostLikesQuery } from '@/entities/posts/api'
import { usePostComments } from '@/entities/posts/hooks'
import { COMMENT_CONTENT_MAX, type CommentFormData } from '@/shared/types'

type UseFeedPostFooterParams = {
  description: string
  likesCount: number
  postId: number
  avatarWhoLikes: string[]
  isAuthenticated?: boolean
}

const DESCRIPTION_MAX_CHAR_COUNT = 100

const getUniqueAvatarUrls = (avatarUrls: string[]) =>
  Array.from(new Set(avatarUrls.filter(Boolean)))

export function useFeedPostFooter({
  description,
  likesCount,
  postId,
  avatarWhoLikes,
  isAuthenticated = false,
}: UseFeedPostFooterParams) {
  const [areCommentsOpen, setAreCommentsOpen] = useState(false)
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false)
  const [shouldScrollCommentsToTop, setShouldScrollCommentsToTop] = useState(false)
  const [expandedAnswersCommentId, setExpandedAnswersCommentId] = useState<number | null>(null)
  const commentsPanelRef = useRef<HTMLDivElement>(null)
  const commentFormRef = useRef<HTMLFormElement>(null)

  const postComments = usePostComments({ postId })
  const {
    data: postLikesData,
    isFetching: isPostLikesFetching,
    isLoading: isPostLikesLoading,
  } = useGetPostLikesQuery(
    { postId, ...POST_LIKES_QUERY_ARG },
    {
      skip: !isAuthenticated || likesCount <= 0,
      refetchOnMountOrArgChange: true,
    }
  )
  const commentText = postComments.watchComment('comment') ?? ''
  const trimmedCommentText = commentText.trim()
  const isCommentInvalid =
    trimmedCommentText.length === 0 || trimmedCommentText.length > COMMENT_CONTENT_MAX
  const resolvedLikeAvatarUrls = postLikesData ? getAvatarWhoLikes(postLikesData) : avatarWhoLikes
  const visibleLikeAvatars =
    likesCount > 0 ? getUniqueAvatarUrls(resolvedLikeAvatarUrls).slice(0, 3) : []
  const shouldShowLikesSkeleton = Boolean(
    isAuthenticated &&
      likesCount > 0 &&
      !postLikesData &&
      (isPostLikesLoading || isPostLikesFetching)
  )
  const hasComments = postComments.totalCount > 0
  const isLongDescription = description.length > DESCRIPTION_MAX_CHAR_COUNT
  const descriptionText =
    isDescriptionExpanded || !isLongDescription
      ? description
      : `${description.slice(0, DESCRIPTION_MAX_CHAR_COUNT)}...`

  const handleOpenComments = () => {
    commentFormRef.current?.querySelector('input')?.focus()

    if (hasComments) {
      setAreCommentsOpen(true)
    }
  }

  const handleToggleComments = () => {
    setAreCommentsOpen(current => !current)
  }

  const handleToggleDescription = () => {
    setIsDescriptionExpanded(current => !current)
  }

  const handleSubmitComment = async (data: CommentFormData) => {
    const activeReplyTarget = postComments.replyTarget

    if (activeReplyTarget) {
      setAreCommentsOpen(true)
      setExpandedAnswersCommentId(activeReplyTarget.commentId)
    }

    const isPublished = await postComments.handlePublish(data)

    if (!isPublished) {
      return
    }

    setAreCommentsOpen(true)

    if (!activeReplyTarget) {
      setShouldScrollCommentsToTop(true)
    }
  }

  useEffect(() => {
    if (!areCommentsOpen || !shouldScrollCommentsToTop || !commentsPanelRef.current) {
      return
    }

    const scrollTimer = window.setTimeout(() => {
      commentsPanelRef.current?.scrollTo?.({ top: 0, behavior: 'smooth' })
      commentsPanelRef.current?.scrollIntoView?.({ block: 'nearest', behavior: 'smooth' })
      setShouldScrollCommentsToTop(false)
    }, 0)

    return () => window.clearTimeout(scrollTimer)
  }, [areCommentsOpen, postComments.comments.length, shouldScrollCommentsToTop])

  return {
    comments: {
      areOpen: areCommentsOpen,
      control: postComments.commentControl,
      expandedAnswersCommentId,
      handleStartReply: postComments.handleStartReply,
      handleSubmit: postComments.handleCommentSubmit,
      hasComments,
      hasNextPage: postComments.hasNextPage,
      isCommentInvalid,
      isError: postComments.isError,
      isFetchingNextPage: postComments.isFetchingNextPage,
      isLoading: postComments.isLoading,
      isPublishing: postComments.isCommentPublishing,
      items: postComments.comments,
      loadMore: postComments.loadMore,
      onOpen: handleOpenComments,
      onSubmit: handleSubmitComment,
      onToggle: handleToggleComments,
      panelRef: commentsPanelRef,
      formRef: commentFormRef,
      totalCount: postComments.totalCount,
    },
    description: {
      isExpanded: isDescriptionExpanded,
      isLong: isLongDescription,
      onToggle: handleToggleDescription,
      text: descriptionText,
    },
    likes: {
      isLoading: shouldShowLikesSkeleton,
      visibleAvatarUrls: visibleLikeAvatars,
    },
  }
}
