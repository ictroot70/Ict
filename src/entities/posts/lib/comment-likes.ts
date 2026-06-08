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

export const createOptimisticId = (): number => -Date.now()

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

const MAX_LIKER_AVATARS = 3

type PostLikeableItem = {
  isLiked: boolean
  likesCount: number
  avatarWhoLikes: string[]
}

const prependLikerAvatar = (avatars: string[], avatarUrl: string): string[] =>
  [avatarUrl, ...avatars.filter(url => url !== avatarUrl)].slice(0, MAX_LIKER_AVATARS)

const removeLikerAvatar = (avatars: string[], avatarUrl: string): string[] =>
  avatars.filter(url => url !== avatarUrl)

export const patchPostLikeFields = (
  item: PostLikeableItem,
  likeStatus: LikeStatus,
  currentUserAvatar?: string
): void => {
  if (likeStatus === LikeStatus.LIKE && !item.isLiked) {
    item.isLiked = true
    item.likesCount += 1

    if (currentUserAvatar) {
      item.avatarWhoLikes = prependLikerAvatar(item.avatarWhoLikes, currentUserAvatar)
    }

    return
  }

  if (likeStatus === LikeStatus.NONE && item.isLiked) {
    item.isLiked = false
    item.likesCount = Math.max(0, item.likesCount - 1)

    if (currentUserAvatar) {
      item.avatarWhoLikes = removeLikerAvatar(item.avatarWhoLikes, currentUserAvatar)
    }
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

export const incrementCommentAnswerCount = (
  draft: InfiniteData<PaginatedCommentsResponse, number>,
  commentId: number
): void => {
  for (const page of draft.pages) {
    const comment = page.items.find(item => item.id === commentId)

    if (comment) {
      comment.answerCount += 1

      return
    }
  }
}

export const prependCommentToPages = (
  draft: InfiniteData<PaginatedCommentsResponse, number>,
  comment: PaginatedCommentsResponse['items'][number]
): void => {
  if (!draft.pages.length) {
    draft.pages.push({
      items: [comment],
      pageSize: COMMENTS_PAGE_SIZE,
      totalCount: 1,
    })

    return
  }

  const firstPage = draft.pages[0]

  if (firstPage.items.some(item => item.id === comment.id)) {
    return
  }

  firstPage.items.unshift(comment)

  for (const page of draft.pages) {
    page.totalCount += 1
  }
}

export const prependAnswerToPages = (
  draft: InfiniteData<PaginatedAnswersResponse, number>,
  answer: PaginatedAnswersResponse['items'][number]
): void => {
  if (!draft.pages.length) {
    draft.pages.push({
      items: [answer],
      pageSize: COMMENTS_PAGE_SIZE,
      totalCount: 1,
    })

    return
  }

  const firstPage = draft.pages[0]

  if (firstPage.items.some(item => item.id === answer.id)) {
    return
  }

  firstPage.items.unshift(answer)

  for (const page of draft.pages) {
    page.totalCount += 1
  }
}

export const replaceCommentInPages = (
  draft: InfiniteData<PaginatedCommentsResponse, number>,
  tempId: number,
  comment: PaginatedCommentsResponse['items'][number]
): void => {
  for (const page of draft.pages) {
    const index = page.items.findIndex(item => item.id === tempId)

    if (index !== -1) {
      page.items[index] = comment

      return
    }
  }
}

export const replaceAnswerInPages = (
  draft: InfiniteData<PaginatedAnswersResponse, number>,
  tempId: number,
  answer: PaginatedAnswersResponse['items'][number]
): void => {
  for (const page of draft.pages) {
    const index = page.items.findIndex(item => item.id === tempId)

    if (index !== -1) {
      page.items[index] = answer

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
