/* @vitest-environment jsdom */

import React from 'react'

import { type PostViewModel } from '@/entities/posts/api'
import { type CommentFormData } from '@/shared/types'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import '@testing-library/jest-dom'

import { FeedPostFooter } from './FeedPostFooter'

const usePostCommentsMock = vi.hoisted(() => vi.fn())
const useCommentLikeToggleMock = vi.hoisted(() => vi.fn())
const useGetPostLikesQueryMock = vi.hoisted(() => vi.fn())
const handlePublishMock = vi.fn(),
  handleStartReplyMock = vi.fn()
const loadMoreMock = vi.fn()
const scrollToMock = vi.fn()
const toggleCommentLikeMock = vi.fn()

vi.mock('@/entities/posts/hooks', () => ({
  useCommentAnswers: () => ({
    hasNextPage: false,
    answers: [],
    loadMore: vi.fn(),
    isLoading: false,
  }),
  useCommentLikeToggle: useCommentLikeToggleMock,
  usePostComments: usePostCommentsMock,
}))

vi.mock('@/entities/posts/api', () => ({
  POST_LIKES_QUERY_ARG: { cursor: 0, pageNumber: 1, pageSize: 50 },
  getAvatarWhoLikes: () => [],
  useGetPostLikesQuery: useGetPostLikesQueryMock,
}))

vi.mock('@/entities/users/hooks/useTimeAgo', () => ({
  useTimeAgo: () => 'Just now',
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
  Avatar: ({ alt, image }: { alt?: string; image?: string }) => (
    <img alt={alt ?? image} src={image} />
  ),
  InfiniteScrollTrigger: ({
    hasNextPage,
    onLoadMore,
  }: {
    hasNextPage: boolean
    onLoadMore: () => void
  }) =>
    hasNextPage ? (
      <button type={'button'} onClick={onLoadMore}>
        Infinite comments trigger
      </button>
    ) : null,
  LinearProgress: ({ active }: { active: boolean }) => (
    <div data-testid={'comments-progress'} data-active={active} />
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
  HeartFilled: () => null,
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

const comment = {
  id: 10,
  postId: post.id,
  from: {
    id: 30,
    userName: 'comment-author',
    avatars: [{ url: '/comment-author.svg', width: 48, height: 48, fileSize: 0 }],
  },
  content: 'Great shot',
  createdAt: '2026-06-10T00:00:00.000Z',
  likeCount: 1,
  isLiked: false,
  answerCount: 0,
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
  comments = [],
  hasNextPage = false,
  isFetchingNextPage = false,
  isCommentPublishing = false,
  totalCount = 2,
}: {
  comment?: string
  comments?: unknown[]
  hasNextPage?: boolean
  isFetchingNextPage?: boolean
  isCommentPublishing?: boolean
  totalCount?: number
} = {}) => {
  usePostCommentsMock.mockReturnValue({
    comments,
    totalCount,
    loadMore: loadMoreMock,
    hasNextPage,
    isFetchingNextPage,
    isLoading: false,
    isError: false,
    commentControl: {},
    handleCommentSubmit: createHandleCommentSubmit(),
    watchComment: vi.fn(() => comment),
    handlePublish: handlePublishMock,
    handleStartReply: handleStartReplyMock,
    replyTarget: null,
    isCommentPublishing,
    isCommentsLoading: false,
    isCommentsError: false,
  })
}

describe('FeedPostFooter', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    Element.prototype.scrollTo = scrollToMock
    handlePublishMock.mockResolvedValue(true)
    useGetPostLikesQueryMock.mockReturnValue({})
    arrangeUsePostComments()
    useCommentLikeToggleMock.mockReturnValue({
      toggleCommentLike: toggleCommentLikeMock,
      isCommentLocked: vi.fn(() => false),
    })
  })

  it('renders like data from PostViewModel', () => {
    render(<FeedPostFooter post={post} currentUser={{ userId: 30, userName: 'current-user' }} />)

    const likeButton = screen.getByRole('button', { name: 'Unlike post' })

    expect(likeButton).toHaveAttribute('aria-pressed', 'true')
    expect(likeButton).toHaveAttribute('data-current-user-id', '30')
    expect(
      screen.getByText((_, element) => element?.textContent === '2\u00a0243')
    ).toBeInTheDocument()
    expect(screen.getByAltText('/liked-1.svg')).toBeInTheDocument()
    expect(screen.getByAltText('/liked-2.svg')).toBeInTheDocument()
  })

  it('uses the post id and renders comments count from the hook', () => {
    const { rerender } = render(<FeedPostFooter post={post} />)

    expect(usePostCommentsMock).toHaveBeenCalledWith({ postId: post.id })
    expect(screen.getByText('View All Comments (2)')).toBeInTheDocument()

    arrangeUsePostComments({ totalCount: 0 })
    rerender(<FeedPostFooter post={post} />)
    expect(screen.queryByText('View All Comments (0)')).not.toBeInTheDocument()
  })

  it('opens comments in a scrollable comments region', () => {
    arrangeUsePostComments({ comments: [comment] })

    render(<FeedPostFooter post={post} currentUser={{ userId: 30, userName: 'current-user' }} />)

    expect(screen.queryByText('Great shot')).not.toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Comment on post' }))

    expect(screen.getByLabelText('Post comments')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Add a Comment')).toHaveFocus()
    expect(screen.getByText('Great shot')).toBeInTheDocument()
    expect(screen.getByText('comment-author')).toBeInTheDocument()
  })

  it('loads more comments through infinite scroll trigger', () => {
    arrangeUsePostComments({
      comments: [comment],
      hasNextPage: true,
      isFetchingNextPage: true,
    })

    render(<FeedPostFooter post={post} />)

    fireEvent.click(screen.getByText('View All Comments (2)'))
    expect(screen.getByTestId('comments-progress')).toHaveAttribute('data-active', 'true')

    fireEvent.click(screen.getByText('Infinite comments trigger'))
    expect(loadMoreMock).toHaveBeenCalledTimes(1)
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
    expect(screen.getByPlaceholderText('Add a Comment')).toBeDisabled()
  })

  it('submits a valid comment, opens comments, and scrolls to the top', async () => {
    arrangeUsePostComments({ comment: 'new comment', comments: [comment] })

    render(<FeedPostFooter post={post} />)

    fireEvent.click(screen.getByRole('button', { name: 'Publish' }))

    expect(handlePublishMock).toHaveBeenCalledWith({
      comment: 'new comment',
    })
    await waitFor(() => expect(screen.getByLabelText('Post comments')).toBeInTheDocument())
    await waitFor(() => expect(scrollToMock).toHaveBeenCalledWith({ top: 0, behavior: 'smooth' }))
  })

  it('renders unique like avatar URLs and hides them when likes count is zero', () => {
    const duplicatedLikesPost = { ...post, avatarWhoLikes: ['/liked-1.svg', '/liked-1.svg'] }
    const postWithoutVisibleLikes = { ...post, avatarWhoLikes: ['/liked-1.svg'], likesCount: 0 }
    const { rerender } = render(<FeedPostFooter post={duplicatedLikesPost} />)

    expect(screen.getAllByAltText('/liked-1.svg')).toHaveLength(1)

    rerender(<FeedPostFooter post={postWithoutVisibleLikes} />)

    expect(screen.queryByAltText('/liked-1.svg')).not.toBeInTheDocument()
    expect(screen.getByText((_, element) => element?.textContent === '0')).toBeInTheDocument()
  })
})
