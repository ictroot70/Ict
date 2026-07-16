/* @vitest-environment jsdom */

import React from 'react'

import { type PostViewModel } from '@/entities/posts/api'
import { type CommentFormData } from '@/shared/types'
import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import '@testing-library/jest-dom'

import { FeedPostFooter } from './FeedPostFooter'

const usePostCommentsMock = vi.hoisted(() => vi.fn())
const useGetPostLikesQueryMock = vi.hoisted(() => vi.fn())
const handlePublishMock = vi.fn()

vi.mock('@/entities/posts/api', () => ({
  POST_LIKES_QUERY_ARG: {
    cursor: 0,
    pageNumber: 1,
    pageSize: 50,
  },
  getAvatarWhoLikes: (likes: { items: Array<{ avatars: Array<{ url: string }> }> }) =>
    likes.items.map(item => item.avatars[0]?.url).filter(Boolean),
  useGetPostLikesQuery: useGetPostLikesQueryMock,
}))

vi.mock('@/entities/posts/hooks', () => ({
  usePostComments: usePostCommentsMock,
}))

vi.mock('@/features/formControls', () => ({
  ControlledInput: ({
    control: _control,
    inputType,
    ...props
  }: React.InputHTMLAttributes<HTMLInputElement> & {
    control?: unknown
    inputType?: React.HTMLInputTypeAttribute
  }) => <input type={inputType} {...props} />,
}))

vi.mock('@/shared/composites', () => ({
  Avatar: ({ image }: { image: string }) => <img alt={image} src={image} />,
  InfiniteScrollTrigger: () => null,
  LinearProgress: ({ active }: { active: boolean }) => (
    <div data-testid={'linear-progress'} data-active={active} />
  ),
}))

vi.mock('@/shared/ui', () => ({
  BookmarkOutline: () => null,
  Button: ({
    children,
    type = 'button',
    variant: _variant,
    ...props
  }: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: string }) => (
    <button type={type === 'submit' ? 'submit' : 'button'} {...props}>
      {children}
    </button>
  ),
  HeartOutline: () => null,
  MessageCircleOutline: () => null,
  PaperPlane: () => null,
  Typography: ({ children }: React.PropsWithChildren) => <div>{children}</div>,
}))

vi.mock('@/features/postLikes/ui/LikeButton', () => ({
  LikeButton: ({
    currentUser,
    isLiked,
  }: {
    currentUser?: { userId: number; userName: string }
    isLiked: boolean
  }) => (
    <button
      type={'button'}
      aria-label={isLiked ? 'Unlike post' : 'Like post'}
      aria-pressed={isLiked}
      data-current-user-id={currentUser?.userId}
    />
  ),
}))

const post: PostViewModel = {
  id: 1,
  ownerId: 7,
  userName: 'user-7',
  description: 'post',
  location: '',
  images: [],
  createdAt: '2026-06-10T00:00:00.000Z',
  updatedAt: '2026-06-10T00:00:00.000Z',
  avatarOwner: '/owner.svg',
  owner: { firstName: '', lastName: '' },
  likesCount: 2243,
  isLiked: true,
  avatarWhoLikes: ['/liked-1.svg', '/liked-2.svg'],
}

const createHandleCommentSubmit = () =>
  vi.fn(
    (callback: (data: CommentFormData) => void) => (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault()
      callback({ comment: 'new comment' })
    }
  )

const arrangeUsePostComments = ({
  comment = '',
  isCommentPublishing = false,
}: {
  comment?: string
  isCommentPublishing?: boolean
} = {}) => {
  usePostCommentsMock.mockReturnValue({
    comments: [],
    totalCount: 2,
    commentControl: {},
    handleStartReply: vi.fn(),
    handleCommentSubmit: createHandleCommentSubmit(),
    watchComment: vi.fn(() => comment),
    handlePublish: handlePublishMock,
    replyTarget: null,
    isCommentPublishing,
    isLoading: false,
    isError: false,
    hasNextPage: false,
    isFetchingNextPage: false,
    loadMore: vi.fn(),
    commentMaxLength: 300,
  })
}

describe('FeedPostFooter', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    useGetPostLikesQueryMock.mockReturnValue({ data: undefined })
    arrangeUsePostComments()
  })

  it('renders like data from PostViewModel', () => {
    render(<FeedPostFooter post={post} currentUser={{ userId: 30, userName: 'current-user' }} />)

    expect(screen.getByRole('button', { name: 'Unlike post' })).toHaveAttribute(
      'aria-pressed',
      'true'
    )
    expect(screen.getByRole('button', { name: 'Unlike post' })).toHaveAttribute(
      'data-current-user-id',
      '30'
    )
    expect(
      screen.getByText((_, element) => element?.textContent === '2\u00a0243')
    ).toBeInTheDocument()
    expect(screen.getByAltText('/liked-1.svg')).toBeInTheDocument()
    expect(screen.getByAltText('/liked-2.svg')).toBeInTheDocument()
  })

  it('uses the post id and renders comments count from the hook', () => {
    render(<FeedPostFooter post={post} />)

    expect(usePostCommentsMock).toHaveBeenCalledWith({ postId: post.id })
    expect(screen.getByText('View All Comments (2)')).toBeInTheDocument()
  })

  it('disables Publish for an empty comment', () => {
    render(<FeedPostFooter post={post} />)

    expect(screen.getByRole('button', { name: 'Publish' })).toBeDisabled()
  })

  it('disables Publish while a comment is publishing', () => {
    arrangeUsePostComments({
      comment: 'new comment',
      isCommentPublishing: true,
    })

    render(<FeedPostFooter post={post} />)

    expect(screen.getByRole('button', { name: 'Publish' })).toBeDisabled()
  })

  it('submits a valid comment', () => {
    arrangeUsePostComments({ comment: 'new comment' })

    render(<FeedPostFooter post={post} />)

    fireEvent.click(screen.getByRole('button', { name: 'Publish' }))

    expect(handlePublishMock).toHaveBeenCalledWith({
      comment: 'new comment',
    })
  })

  it('renders duplicate like avatar URLs only once', () => {
    render(
      <FeedPostFooter
        post={{
          ...post,
          avatarWhoLikes: ['/liked-1.svg', '/liked-1.svg', '/liked-2.svg'],
        }}
      />
    )

    expect(screen.getAllByAltText('/liked-1.svg')).toHaveLength(1)
    expect(screen.getByAltText('/liked-2.svg')).toBeInTheDocument()
  })

  it('does not render like avatars when the like count is zero', () => {
    render(
      <FeedPostFooter
        post={{
          ...post,
          avatarWhoLikes: ['/liked-1.svg'],
          likesCount: 0,
        }}
      />
    )

    expect(screen.queryByAltText('/liked-1.svg')).not.toBeInTheDocument()
    expect(screen.getByText((_, element) => element?.textContent === '0')).toBeInTheDocument()
  })
})
