'use client'

import type { CurrentPostLikeUser } from '@/features/postLikes/model/useLike'
import type { CommentFormData } from '@/shared/types'

import { useEffect, useRef, useState } from 'react'

import { PostViewModel } from '@/entities/posts/api'
import { usePostComments } from '@/entities/posts/hooks'
import { CommentItem } from '@/entities/posts/ui/PostModal/ViewMode/ViewModeCommentsSection/CommentItem'
import { ControlledInput } from '@/features/formControls'
import { LikeButton } from '@/features/postLikes/ui/LikeButton'
import { Avatar, InfiniteScrollTrigger, LinearProgress } from '@/shared/composites'
import { APP_ROUTES } from '@/shared/constant/app-routes'
import { BookmarkOutline, Button, MessageCircleOutline, PaperPlane, Typography } from '@/shared/ui'
import Link from 'next/link'

import s from './FeedPostFooter.module.scss'

type Props = {
  currentUser?: CurrentPostLikeUser
  post: PostViewModel
}

const getUniqueAvatarUrls = (avatarUrls: string[]) =>
  Array.from(new Set(avatarUrls.filter(Boolean)))

const DESCRIPTION_MAX_CHAR_COUNT = 100

export function FeedPostFooter({ currentUser, post }: Props) {
  const [areCommentsOpen, setAreCommentsOpen] = useState(false)
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false)
  const [shouldScrollCommentsToTop, setShouldScrollCommentsToTop] = useState(false)
  const [expandedAnswersCommentId, setExpandedAnswersCommentId] = useState<number | null>(null)
  const commentsPanelRef = useRef<HTMLDivElement>(null)
  const commentFormRef = useRef<HTMLFormElement>(null)
  const {
    comments: postComments,
    totalCount,
    loadMore,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    commentControl,
    handleCommentSubmit,
    watchComment,
    handlePublish,
    handleStartReply,
    replyTarget,
    isCommentPublishing,
    commentMaxLength,
  } = usePostComments({
    postId: post.id,
  })

  const commentText = watchComment('comment') ?? ''
  const trimmedCommentText = commentText.trim()
  const isCommentInvalid =
    trimmedCommentText.length === 0 || trimmedCommentText.length > commentMaxLength

  const visibleLikeAvatars =
    post.likesCount > 0 ? getUniqueAvatarUrls(post.avatarWhoLikes).slice(0, 3) : []
  const hasComments = totalCount > 0
  const isLongDescription = post.description.length >= DESCRIPTION_MAX_CHAR_COUNT
  const descriptionText =
    isDescriptionExpanded || !isLongDescription
      ? post.description
      : `${post.description.slice(0, DESCRIPTION_MAX_CHAR_COUNT)}...`

  const handleOpenComments = () => {
    commentFormRef.current?.querySelector('input')?.focus()

    if (hasComments) {
      setAreCommentsOpen(true)
    }
  }

  const handleToggleComments = () => {
    setAreCommentsOpen(current => !current)
  }

  const handleSubmitComment = async (data: CommentFormData) => {
    const activeReplyTarget = replyTarget

    if (activeReplyTarget) {
      setAreCommentsOpen(true)
      setExpandedAnswersCommentId(activeReplyTarget.commentId)
    }

    const isPublished = await handlePublish(data)

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
  }, [areCommentsOpen, hasComments, postComments.length, shouldScrollCommentsToTop])

  return (
    <footer className={s.footer}>
      <div className={s.actions} aria-label={'Post actions'}>
        <LikeButton
          className={s.actionButton}
          postId={post.id}
          ownerId={post.ownerId}
          isLiked={post.isLiked}
          currentUser={currentUser}
        />
        <Button
          variant={'text'}
          className={s.actionButton}
          type={'button'}
          aria-label={'Comment on post'}
          onClick={handleOpenComments}
        >
          <MessageCircleOutline />
        </Button>
        <Button
          variant={'text'}
          className={s.actionButton}
          type={'button'}
          aria-label={'Share post'}
        >
          <PaperPlane />
        </Button>
        <Button
          variant={'text'}
          className={`${s.actionButton} ${s.saveButton}`}
          type={'button'}
          aria-label={'Save post'}
        >
          <BookmarkOutline />
        </Button>
      </div>

      <div className={s.description}>
        <Avatar image={post.avatarOwner} size={36} alt={`${post.userName} avatar`} />

        <Typography variant={'regular_14'} className={s.descriptionText}>
          <Link href={APP_ROUTES.PROFILE.ID(post.ownerId)}>
            <strong>{post.userName}</strong>
          </Link>
          <span>{descriptionText}</span>
          {isLongDescription && (
            <Button
              variant={'text'}
              type={'button'}
              className={s.descriptionToggle}
              onClick={() => setIsDescriptionExpanded(current => !current)}
            >
              {isDescriptionExpanded ? 'Hide' : 'Show more'}
            </Button>
          )}
        </Typography>
      </div>

      <div className={s.likes}>
        {visibleLikeAvatars.length > 0 && (
          <div className={s.likeAvatars} aria-hidden={'true'}>
            {visibleLikeAvatars.map((avatar, index) => (
              <Avatar
                className={s.likeAvatar}
                image={avatar}
                size={24}
                key={`${avatar}-${index}`}
              />
            ))}
          </div>
        )}
        <Typography variant={'regular_14'}>
          <span className={s.countComments}>{post.likesCount.toLocaleString('ru-RU')}</span>
          <span>&quot;</span>
          <strong>Like</strong>
          <span>&quot;</span>
        </Typography>
      </div>

      {hasComments && (
        <Button
          variant={'text'}
          type={'button'}
          className={s.commentsToggle}
          onClick={handleToggleComments}
          aria-expanded={areCommentsOpen}
          aria-controls={`feed-post-comments-${post.id}`}
        >
          View All Comments ({totalCount})
        </Button>
      )}

      {hasComments && areCommentsOpen && (
        <div
          ref={commentsPanelRef}
          id={`feed-post-comments-${post.id}`}
          className={s.commentsPanel}
          aria-label={'Post comments'}
        >
          <LinearProgress active={isFetchingNextPage} />

          {isLoading && (
            <Typography variant={'small_text'} className={s.commentsState}>
              Loading comments...
            </Typography>
          )}

          {isError && (
            <Typography variant={'small_text'} className={s.commentsState}>
              Failed to load comments
            </Typography>
          )}

          {!isLoading &&
            postComments.map(comment => (
              <FeedCommentItem
                key={comment.id}
                postId={post.id}
                comment={comment}
                isAuthenticated={Boolean(currentUser)}
                shouldShowAnswers={expandedAnswersCommentId === comment.id}
                onAnswer={handleStartReply}
              />
            ))}

          <InfiniteScrollTrigger hasNextPage={hasNextPage} onLoadMore={loadMore} />
        </div>
      )}

      <form
        ref={commentFormRef}
        className={s.commentForm}
        onSubmit={handleCommentSubmit(handleSubmitComment)}
      >
        <div className={s.commentInputWrapper}>
          <ControlledInput
            name={'comment'}
            control={commentControl}
            inputType={'text'}
            placeholder={'Add a Comment'}
            className={s.input}
            maxLength={commentMaxLength}
            disabled={isCommentPublishing}
          />
          {isCommentPublishing && <span className={s.replyLoader} aria-hidden={'true'} />}
        </div>

        <Button variant={'text'} type={'submit'} disabled={isCommentInvalid || isCommentPublishing}>
          Publish
        </Button>
      </form>
    </footer>
  )
}

const FeedCommentItem = CommentItem
