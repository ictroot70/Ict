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
})
