/* @vitest-environment jsdom */

import React from 'react'

import { type PostViewModel } from '@/entities/posts/api'
import { usePostModal } from '@/entities/posts/hooks'
import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { PostModal } from './PostModal'

vi.mock('@/entities/posts/hooks', () => ({
  usePostModal: vi.fn(),
}))

vi.mock('@/shared/composites', () => ({
  Skeleton: ({ className }: { className?: string }) => (
    <div className={className} data-testid={'skeleton'} />
  ),
}))

vi.mock('@/shared/ui', () => ({
  Close: () => <span data-testid={'close-icon'} />,
  Modal: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Typography: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}))

vi.mock('./EditMode/EditMode', () => ({
  EditMode: () => <div data-testid={'edit-mode'} />,
}))

vi.mock('./ViewMode/ViewMode', () => ({
  ViewMode: ({ postData }: { postData: PostViewModel }) => (
    <div data-testid={'view-mode'}>{postData.userName}</div>
  ),
}))

const usePostModalMock = vi.mocked(usePostModal)

const post = {
  id: 1,
  postId: 1,
  ownerId: 10,
  userName: 'ssr-user',
  description: 'SSR post',
  location: '',
  images: [],
  createdAt: '2026-06-10T00:00:00.000Z',
  updatedAt: '2026-06-10T00:00:00.000Z',
  avatarOwner: '',
  owner: { firstName: '', lastName: '' },
  likesCount: 0,
  isLiked: false,
  avatarWhoLikes: [],
} as PostViewModel & { postId: number }

const createHookResult = (partial: Partial<ReturnType<typeof usePostModal>>) =>
  ({
    isEditingDescription: false,
    setIsEditingDescription: vi.fn(),
    commentControl: {},
    handleCommentSubmit: vi.fn(),
    watchComment: vi.fn(),
    descriptionControl: {},
    handleDescriptionSubmit: vi.fn(),
    watchDescription: vi.fn(),
    errors: {},
    postData: undefined,
    variant: 'public',
    isAuthLoading: false,
    isCreateCommentLoading: false,
    commentMaxLength: 300,
    isAuthenticated: true,
    hasPostData: false,
    isPostLoading: false,
    isPostError: false,
    uiText: {
      loadingPost: 'Loading post...',
      notFoundPost: 'Post not found',
      unavailablePost: 'Post unavailable',
    },
    formattedCreatedAt: '',
    handlePublish: vi.fn(),
    handleEditPost: vi.fn(),
    handleCancelEdit: vi.fn(),
    handleCopyLink: vi.fn(),
    handleFollow: vi.fn(),
    isFollowing: false,
    isFollowPending: false,
    applyLocalDescription: vi.fn(),
    currentUserName: undefined,
    currentUserAvatar: undefined,
    ...partial,
  }) as ReturnType<typeof usePostModal>

describe('PostModal', () => {
  it('renders modal skeleton while post data is absent and loading', () => {
    usePostModalMock.mockReturnValue(createHookResult({ isPostLoading: true }))

    render(<PostModal open postId={1} onClose={vi.fn()} />)

    expect(screen.getByLabelText('Loading post')).not.toBeNull()
    expect(screen.getAllByTestId('skeleton').length).toBeGreaterThan(0)
    expect(screen.queryByText('Loading post...')).toBeNull()
  })

  it('renders real modal content when SSR initial post data is available', () => {
    usePostModalMock.mockReturnValue(
      createHookResult({
        postData: post,
        hasPostData: true,
        isPostLoading: false,
      })
    )

    render(<PostModal open postId={1} postData={post} onClose={vi.fn()} />)

    expect(screen.getByTestId('view-mode')).not.toBeNull()
    expect(screen.getByText('ssr-user')).not.toBeNull()
    expect(screen.queryByLabelText('Loading post')).toBeNull()
  })
})
