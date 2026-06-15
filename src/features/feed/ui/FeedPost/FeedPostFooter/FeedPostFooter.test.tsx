/* @vitest-environment jsdom */

import React from 'react'

import { type PostViewModel } from '@/entities/posts/api'
import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import '@testing-library/jest-dom'

import { FeedPostFooter } from './FeedPostFooter'

vi.mock('@/shared/composites', () => ({
  Avatar: ({ image }: { image: string }) => <img alt={image} src={image} />,
}))

vi.mock('@/shared/ui', () => ({
  BookmarkOutline: () => null,
  Button: ({
    children,
    type: _type,
    variant: _variant,
    ...props
  }: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: string }) => (
    <button type={'button'} {...props}>
      {children}
    </button>
  ),
  HeartOutline: () => null,
  Input: ({
    inputType,
    ...props
  }: React.InputHTMLAttributes<HTMLInputElement> & { inputType?: string }) => <input {...props} />,
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

describe('FeedPostFooter', () => {
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
