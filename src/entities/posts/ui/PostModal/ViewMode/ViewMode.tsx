'use client'

import type { PostViewModel } from '@/entities/posts/api'

import { Control, UseFormHandleSubmit, UseFormWatch } from 'react-hook-form'

import { CommentFormData, PostVariant } from '@/shared/types'
import { CommentsViewModel } from '@/shared/types/comments'
import { Separator } from '@/shared/ui'

import s from './ViewMode.module.scss'

import { RenderPostLikeAction } from '../postModalLikeAction.types'
import { ViewModeCommentsSection } from './ViewModeCommentsSection/ViewModeCommentsSection'
import { ViewModePhotoSection } from './ViewModePhotoSection/ViewModePhotoSection'
import { ViewModePostFooter } from './ViewModePostFooter/ViewModePostFooter'
import { ViewModePostHeader } from './ViewModePostHeader/ViewModePostHeader'

interface ViewModeProps {
  actions: {
    handleCopyLink: () => void
  }
  auth: {
    isAuthenticated: boolean
    isLoading: boolean
  }
  comments: {
    control: Control<CommentFormData>
    expandedAnswersCommentId: number | null
    handlePublish: (data: CommentFormData) => Promise<boolean>
    handleStartReply: (target: { commentId: number; userName: string }) => void
    handleSubmit: UseFormHandleSubmit<CommentFormData>
    hasNextPage: boolean
    isError: boolean
    isFetchingNextPage: boolean
    isLoading: boolean
    isPublishing: boolean
    items: CommentsViewModel[]
    loadMore: () => void
    totalCount: number
    watch: UseFormWatch<CommentFormData>
  }
  description: {
    handleEdit: () => void
  }
  follow: {
    handleFollow: () => Promise<void>
    isFollowing: boolean
    isPending: boolean
  }
  handleDeletePost: () => void
  post: {
    formattedCreatedAt: string
    variant: PostVariant
  }
  postData: PostViewModel
  renderPostLikeAction?: RenderPostLikeAction
}

export const ViewMode = ({
  actions,
  auth,
  comments,
  description,
  follow,
  handleDeletePost,
  post,
  postData,
  renderPostLikeAction,
}: ViewModeProps) => {
  const postDataForChildren = {
    avatar: postData.avatarOwner,
    userName: postData.userName,
    description: postData.description ?? '',
    createdAt: postData.createdAt,
  }

  return (
    <div className={s.viewMode} onClick={e => e.stopPropagation()}>
      <ViewModePhotoSection postData={postData} />

      <div className={s.postSideBar}>
        <ViewModePostHeader
          actions={actions}
          auth={auth}
          description={description}
          follow={follow}
          onDelete={handleDeletePost}
          post={post}
          postData={postDataForChildren}
        />

        <ViewModeCommentsSection
          auth={auth}
          comments={comments}
          postData={postDataForChildren}
          postId={postData.id}
        />

        <Separator />

        <ViewModePostFooter
          auth={auth}
          comments={comments}
          post={post}
          postData={postData}
          renderPostLikeAction={renderPostLikeAction}
        />
      </div>
    </div>
  )
}
