import {
  PaginatedAnswersResponse,
  PaginatedCommentsResponse,
} from '@/entities/posts/api/posts.types'
import { LikeStatus } from '@/shared/types/base'
import { InfiniteData } from '@reduxjs/toolkit/query'

type LikeableItem = {
  isLiked: boolean
  likeCount: number
}

export const COMMENTS_PAGE_SIZE = 12

export const getNextLikeStatus = (isLiked: boolean): LikeStatus =>
  isLiked ? LikeStatus.NONE : LikeStatus.LIKE

export const patchLikeFields = (item: LikeableItem, likeStatus: LikeStatus): void => {
  if (likeStatus === LikeStatus.LIKE && !item.isLiked) {
    item.isLiked = true
    item.likeCount += 1

    return
  }

  if (likeStatus === LikeStatus.NONE && item.isLiked) {
    item.isLiked = false
    item.likeCount = Math.max(0, item.likeCount - 1)
  }
}

export const patchCommentLikeInPages = (
  draft: InfiniteData<PaginatedCommentsResponse, number>,
  commentId: number,
  likeStatus: LikeStatus
): void => {
  for (const page of draft.pages) {
    const comment = page.items.find(item => item.id === commentId)

    if (comment) {
      patchLikeFields(comment, likeStatus)

      return
    }
  }
}

export const patchAnswerLikeInPages = (
  draft: InfiniteData<PaginatedAnswersResponse, number>,
  answerId: number,
  likeStatus: LikeStatus
): void => {
  for (const page of draft.pages) {
    const answer = page.items.find(item => item.id === answerId)

    if (answer) {
      patchLikeFields(answer, likeStatus)

      return
    }
  }
}

export const getCommentsNextPageParam = (
  lastPage: PaginatedCommentsResponse,
  allPages: PaginatedCommentsResponse[]
): number | undefined => {
  const loadedCount = allPages.reduce((sum, page) => sum + page.items.length, 0)

  if (loadedCount >= lastPage.totalCount) {
    return undefined
  }

  return allPages.length + 1
}

export const getAnswersNextPageParam = (
  lastPage: PaginatedAnswersResponse,
  allPages: PaginatedAnswersResponse[]
): number | undefined => {
  const loadedCount = allPages.reduce((sum, page) => sum + page.items.length, 0)

  if (loadedCount >= lastPage.totalCount) {
    return undefined
  }

  return allPages.length + 1
}
