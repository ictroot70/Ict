/* @vitest-environment jsdom */

import React from 'react'

import { type PostViewModel, useGetFollowersFeedInfiniteQuery } from '@/entities/posts/api'
import { useFeedActions } from '@/features/feed/model'
import { useAuthUiState } from '@/features/posts/utils/useAuthUiState'
import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import '@testing-library/jest-dom'

import { Feed } from './Feed'

vi.mock('@/entities/posts/api', () => ({
  FOLLOWERS_FEED_QUERY_ARGS: { pageSize: 10 },
  useGetFollowersFeedInfiniteQuery: vi.fn(),
}))

vi.mock('@/features/feed/model', () => ({
  useFeedActions: vi.fn(),
}))

vi.mock('@/features/posts/utils/useAuthUiState', () => ({
  useAuthUiState: vi.fn(),
}))

vi.mock('@/shared/composites', () => ({
  InfiniteScrollTrigger: ({
    hasNextPage,
    onLoadMore,
  }: {
    hasNextPage: boolean
    onLoadMore: () => void
  }) =>
    hasNextPage
      ? React.createElement(
          'button',
          { 'data-testid': 'load-more', onClick: onLoadMore, type: 'button' },
          'Load more'
        )
      : null,
  LinearProgress: ({ active }: { active: boolean }) =>
    React.createElement('div', { 'data-active': active, 'data-testid': 'linear-progress' }),
  Skeleton: ({ className }: { className?: string }) =>
    React.createElement('div', { className, 'data-testid': 'skeleton' }),
}))

vi.mock('./FeedEmptyState', () => ({
  FeedEmptyState: () => React.createElement('div', { 'data-testid': 'empty-state' }),
}))

vi.mock('./FeedPost', () => ({
  FeedPost: ({
    currentUser,
    isFollowing,
    isFollowPending,
    onCopyLink,
    onToggleFollow,
    post,
  }: {
    currentUser?: { userId: number; userName: string }
    isFollowing: boolean
    isFollowPending: boolean
    onCopyLink: () => void
    onToggleFollow: () => void
    post: PostViewModel
  }) =>
    React.createElement(
      'article',
      { 'data-testid': `post-${post.id}` },
      React.createElement('span', null, post.userName),
      React.createElement('span', { 'data-testid': `following-${post.id}` }, String(isFollowing)),
      React.createElement('span', { 'data-testid': `pending-${post.id}` }, String(isFollowPending)),
      React.createElement(
        'span',
        { 'data-testid': `current-user-${post.id}` },
        currentUser?.userName
      ),
      React.createElement(
        'button',
        { onClick: onToggleFollow, type: 'button' },
        `Toggle ${post.id}`
      ),
      React.createElement('button', { onClick: onCopyLink, type: 'button' }, `Copy ${post.id}`)
    ),
}))

const useFollowersFeedMock = vi.mocked(useGetFollowersFeedInfiniteQuery)
const useFeedActionsMock = vi.mocked(useFeedActions)
const useAuthUiStateMock = vi.mocked(useAuthUiState)

const fetchNextPage = vi.fn()
const toggleFollow = vi.fn()
const copyPostLink = vi.fn()

const createPost = (id: number, ownerId: number = id): PostViewModel => ({
  id,
  ownerId,
  userName: `user-${ownerId}`,
  description: `post-${id}`,
  location: '',
  images: [],
  createdAt: '2026-06-10T00:00:00.000Z',
  updatedAt: '2026-06-10T00:00:00.000Z',
  avatarOwner: '',
  owner: { firstName: '', lastName: '' },
  likesCount: 0,
  isLiked: false,
  avatarWhoLikes: [],
})

const createQueryResult = ({
  items = [],
  secondPageItems,
  isError = false,
  isFetchingNextPage = false,
  isLoading = false,
  hasNextPage = false,
}: {
  items?: PostViewModel[]
  secondPageItems?: PostViewModel[]
  isError?: boolean
  isFetchingNextPage?: boolean
  isLoading?: boolean
  hasNextPage?: boolean
} = {}) =>
  ({
    data: {
      pages: [{ items }, ...(secondPageItems ? [{ items: secondPageItems }] : [])],
    },
    fetchNextPage,
    hasNextPage,
    isError,
    isFetchingNextPage,
    isLoading,
  }) as unknown as ReturnType<typeof useGetFollowersFeedInfiniteQuery>

beforeEach(() => {
  vi.clearAllMocks()
  useFeedActionsMock.mockReturnValue({
    copyPostLink,
    isFollowing: userId => userId !== 2,
    isFollowPending: userId => userId === 3,
    toggleFollow,
  })
  useFollowersFeedMock.mockReturnValue(createQueryResult())
  useAuthUiStateMock.mockReturnValue({
    isAuthUiLoading: false,
    isAuthenticatedUi: true,
    status: 'authenticated',
    user: {
      email: 'current@example.com',
      isBlocked: false,
      name: 'current-user',
      userId: 30,
    },
  })
})

describe('Feed', () => {
  it('renders skeleton, error and empty states', () => {
    useFollowersFeedMock.mockReturnValue(createQueryResult({ isLoading: true }))
    const { rerender } = render(<Feed />)

    expect(screen.getByLabelText('Loading feed')).toBeInTheDocument()
    expect(screen.getAllByTestId('skeleton').length).toBeGreaterThan(0)

    useFollowersFeedMock.mockReturnValue(createQueryResult({ isError: true }))
    rerender(<Feed />)
    expect(screen.getByText('Failed to load posts')).toBeInTheDocument()

    useFollowersFeedMock.mockReturnValue(createQueryResult())
    rerender(<Feed />)
    expect(screen.getByTestId('empty-state')).toBeInTheDocument()
  })

  it('renders posts from all pages without duplicates', () => {
    useFollowersFeedMock.mockReturnValue(
      createQueryResult({
        items: [createPost(1), createPost(2)],
        secondPageItems: [createPost(2), createPost(3)],
      })
    )

    render(<Feed />)

    expect(screen.getAllByTestId('post-1')).toHaveLength(1)
    expect(screen.getAllByTestId('post-2')).toHaveLength(1)
    expect(screen.getAllByTestId('post-3')).toHaveLength(1)
  })

  it('loads the next page only when another request is not pending', () => {
    useFollowersFeedMock.mockReturnValue(
      createQueryResult({ items: [createPost(1)], hasNextPage: true })
    )
    const { rerender } = render(<Feed />)

    fireEvent.click(screen.getByTestId('load-more'))
    expect(fetchNextPage).toHaveBeenCalledTimes(1)

    useFollowersFeedMock.mockReturnValue(
      createQueryResult({
        items: [createPost(1)],
        hasNextPage: true,
        isFetchingNextPage: true,
      })
    )
    rerender(<Feed />)
    fireEvent.click(screen.getByTestId('load-more'))

    expect(fetchNextPage).toHaveBeenCalledTimes(1)
    expect(screen.getByTestId('linear-progress')).toHaveAttribute('data-active', 'true')
  })

  it('passes author state and actions to every post', () => {
    useFollowersFeedMock.mockReturnValue(
      createQueryResult({ items: [createPost(1, 2), createPost(2, 3)] })
    )

    render(<Feed />)

    expect(screen.getByTestId('following-1')).toHaveTextContent('false')
    expect(screen.getByTestId('pending-2')).toHaveTextContent('true')
    expect(screen.getByTestId('current-user-1')).toHaveTextContent('current-user')

    fireEvent.click(screen.getByText('Toggle 1'))
    fireEvent.click(screen.getByText('Copy 2'))

    expect(toggleFollow).toHaveBeenCalledWith(2)
    expect(copyPostLink).toHaveBeenCalledWith(3, 2)
  })
})
