/* @vitest-environment jsdom */

import React from 'react'

import { type PostViewModel } from '@/entities/posts/api'
import { type CommentFormData } from '@/shared/types'
import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import '@testing-library/jest-dom'

import { FeedPostFooter } from './FeedPostFooter'

const usePostCommentsMock = vi.hoisted(() => vi.fn())
const handlePublishMock = vi.fn()

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
    handleCommentSubmit: createHandleCommentSubmit(),
    watchComment: vi.fn(() => comment),
    handlePublish: handlePublishMock,
    isCommentPublishing,
    isCommentsLoading: false,
    isCommentsError: false,
    commentMaxLength: 300,
  })
}

describe('FeedPostFooter', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    arrangeUsePostComments()
  })

  it('renders like data from PostViewModel', () => {
    render(<FeedPostFooter post={post} />)

    expect(screen.getByRole('button', { name: 'Like post' })).toHaveAttribute(
      'aria-pressed',
      'true'
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
})
