'use client'

import type { CurrentPostLikeUser } from '@/features/postLikes/model/useLike'

import { PostViewModel } from '@/entities/posts/api'
import { Button } from '@/shared/ui'

import s from './FeedPostFooter.module.scss'

import { useFeedPostFooter } from './model/useFeedPostFooter'
import { FeedPostActionBar } from './ui/FeedPostActionBar'
import { FeedPostCommentForm } from './ui/FeedPostCommentForm'
import { FeedPostCommentsPanel } from './ui/FeedPostCommentsPanel'
import { FeedPostDescription } from './ui/FeedPostDescription'
import { FeedPostLikesSummary } from './ui/FeedPostLikesSummary'

type Props = {
  currentUser?: CurrentPostLikeUser
  post: PostViewModel
}

export function FeedPostFooter({ currentUser, post }: Props) {
  const footer = useFeedPostFooter({
    avatarWhoLikes: post.avatarWhoLikes,
    description: post.description,
    isAuthenticated: Boolean(currentUser),
    likesCount: post.likesCount,
    postId: post.id,
  })
  const commentsPanelId = `feed-post-comments-${post.id}`

  return (
    <footer className={s.footer}>
      <FeedPostActionBar
        currentUser={currentUser}
        isLiked={post.isLiked}
        onOpenComments={footer.comments.onOpen}
        ownerId={post.ownerId}
        postId={post.id}
      />

      <FeedPostDescription
        avatarOwner={post.avatarOwner}
        descriptionText={footer.description.text}
        isExpanded={footer.description.isExpanded}
        isLong={footer.description.isLong}
        onToggle={footer.description.onToggle}
        ownerId={post.ownerId}
        userName={post.userName}
      />

      <FeedPostLikesSummary
        avatarUrls={footer.likes.visibleAvatarUrls}
        likesCount={post.likesCount}
      />

      {footer.comments.hasComments && (
        <Button
          variant={'text'}
          type={'button'}
          className={s.commentsToggle}
          onClick={footer.comments.onToggle}
          aria-expanded={footer.comments.areOpen}
          aria-controls={commentsPanelId}
        >
          View All Comments ({footer.comments.totalCount})
        </Button>
      )}

      {footer.comments.hasComments && footer.comments.areOpen && (
        <FeedPostCommentsPanel
          ref={footer.comments.panelRef}
          id={commentsPanelId}
          comments={footer.comments.items}
          expandedAnswersCommentId={footer.comments.expandedAnswersCommentId}
          hasNextPage={footer.comments.hasNextPage}
          isAuthenticated={Boolean(currentUser)}
          isError={footer.comments.isError}
          isFetchingNextPage={footer.comments.isFetchingNextPage}
          isLoading={footer.comments.isLoading}
          loadMore={footer.comments.loadMore}
          onAnswer={footer.comments.handleStartReply}
          postId={post.id}
        />
      )}

      <FeedPostCommentForm
        ref={footer.comments.formRef}
        control={footer.comments.control}
        handleSubmit={footer.comments.handleSubmit}
        isCommentInvalid={footer.comments.isCommentInvalid}
        isPublishing={footer.comments.isPublishing}
        onSubmit={footer.comments.onSubmit}
      />
    </footer>
  )
}
