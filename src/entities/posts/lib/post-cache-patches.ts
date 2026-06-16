import { PaginatedPosts, PaginatedResponse, PostViewModel } from '@/entities/posts/api/posts.types'
import { InfiniteData } from '@reduxjs/toolkit/query'

export const isValidUserId = (userId: number): boolean => Number.isInteger(userId) && userId > 0

type PostTag =
  | 'Posts'
  | 'Profile'
  | { type: 'Post'; id: number | string }
  | { type: 'UserPosts'; id: number }

export const getCreatePostInvalidationTags = (userId: number): PostTag[] => [
  'Posts',
  'Profile',
  { type: 'Post', id: 'LIST' },
  ...(isValidUserId(userId)
    ? [
        { type: 'UserPosts' as const, id: userId },
        { type: 'Post' as const, id: `USER-${userId}` },
      ]
    : []),
]

export const getPostMutationInvalidationTags = (postId: number, userId: number): PostTag[] => [
  'Posts',
  'Profile',
  { type: 'Post', id: postId },
  { type: 'Post', id: 'LIST' },
  ...(isValidUserId(userId)
    ? [
        { type: 'UserPosts' as const, id: userId },
        { type: 'Post' as const, id: `USER-${userId}` },
      ]
    : []),
]

export const getUserPostsNextPageParam = (items: PostViewModel[] | undefined): number | null => {
  const expectedPageSize = 8

  if (!items || items.length < expectedPageSize) {
    return null
  }

  const lastItem = items[items.length - 1]

  return lastItem ? lastItem.id : null
}

export const mergeUserPostsCache = (
  currentCache: PaginatedResponse<PostViewModel>,
  newItems: PaginatedResponse<PostViewModel>
): void => {
  const existingIds = new Set(currentCache.items.map(item => item.id))
  const newUniqueItems = newItems.items.filter(item => !existingIds.has(item.id))

  currentCache.items.push(...newUniqueItems)
  currentCache.items.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  )
  currentCache.pageSize = newItems.pageSize
  currentCache.totalCount = newItems.totalCount
}

export const prependPostToUserFeed = (
  draft: InfiniteData<PaginatedPosts, null | number>,
  createdPost: PostViewModel
): void => {
  if (!draft.pages.length) {
    return
  }

  const firstPage = draft.pages[0]

  if (firstPage.items.some(post => post.id === createdPost.id)) {
    return
  }

  firstPage.items.unshift(createdPost)

  for (const page of draft.pages) {
    page.totalCount += 1
  }

  if (firstPage.items.length > firstPage.pageSize) {
    firstPage.items = firstPage.items.slice(0, firstPage.pageSize)
  }
}

export const patchPostDescriptionInUserFeed = (
  draft: InfiniteData<PaginatedPosts, null | number>,
  postId: number,
  description: string
): void => {
  for (const page of draft.pages) {
    const post = page.items.find(item => item.id === postId)

    if (post) {
      post.description = description
      post.updatedAt = new Date().toISOString()
      break
    }
  }
}

export const removePostFromUserFeed = (
  draft: InfiniteData<PaginatedPosts, null | number>,
  postId: number
): void => {
  let removedCount = 0

  for (const page of draft.pages) {
    const before = page.items.length

    page.items = page.items.filter(post => post.id !== postId)
    removedCount += before - page.items.length
  }

  if (removedCount > 0) {
    for (const page of draft.pages) {
      page.totalCount = Math.max(0, page.totalCount - removedCount)
    }
  }
}
