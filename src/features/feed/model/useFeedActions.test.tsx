/* @vitest-environment jsdom */

import { useFollowUserMutation, useUnfollowUserMutation } from '@/entities/users/api'
import { showToastAlert } from '@/shared/lib'
import { act, renderHook } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { useFeedActions } from './useFeedActions'

vi.mock('@/entities/users/api', () => ({
  useFollowUserMutation: vi.fn(),
  useUnfollowUserMutation: vi.fn(),
}))

vi.mock('@/shared/lib', () => ({
  showToastAlert: vi.fn(),
}))

const useFollowUserMutationMock = vi.mocked(useFollowUserMutation)
const useUnfollowUserMutationMock = vi.mocked(useUnfollowUserMutation)
const showToastAlertMock = vi.mocked(showToastAlert)

const followUser = vi.fn()
const unfollowUser = vi.fn()

const resolvedMutation = () => ({ unwrap: vi.fn().mockResolvedValue(undefined) })

beforeEach(() => {
  vi.clearAllMocks()
  followUser.mockReturnValue(resolvedMutation())
  unfollowUser.mockReturnValue(resolvedMutation())
  useFollowUserMutationMock.mockReturnValue([followUser, {}] as unknown as ReturnType<
    typeof useFollowUserMutation
  >)
  useUnfollowUserMutationMock.mockReturnValue([unfollowUser, {}] as unknown as ReturnType<
    typeof useUnfollowUserMutation
  >)
})

describe('useFeedActions', () => {
  it('unfollows and then allows following the same user again', async () => {
    const { result } = renderHook(() => useFeedActions())

    expect(result.current.isFollowing(7)).toBe(true)

    await act(async () => {
      await result.current.toggleFollow(7)
    })

    expect(unfollowUser).toHaveBeenCalledWith(7)
    expect(result.current.isFollowing(7)).toBe(false)

    await act(async () => {
      await result.current.toggleFollow(7)
    })

    expect(followUser).toHaveBeenCalledWith({ selectedUserId: 7 })
    expect(result.current.isFollowing(7)).toBe(true)
  })

  it('keeps following state unchanged when unfollow fails', async () => {
    unfollowUser.mockReturnValue({ unwrap: vi.fn().mockRejectedValue(new Error('failed')) })
    const { result } = renderHook(() => useFeedActions())

    await act(async () => {
      await result.current.toggleFollow(7)
    })

    expect(result.current.isFollowing(7)).toBe(true)
    expect(showToastAlertMock).toHaveBeenCalledWith({
      message: 'Failed to unfollow user',
      type: 'error',
    })
  })

  it('copies an absolute post link without source query parameter', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined)

    Object.defineProperty(window, 'isSecureContext', { configurable: true, value: true })
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { writeText },
    })

    const { result } = renderHook(() => useFeedActions())

    await act(async () => {
      await result.current.copyPostLink(4, 12)
    })

    expect(writeText).toHaveBeenCalledWith('http://localhost:3000/profile/4?postId=12')
    expect(showToastAlertMock).toHaveBeenCalledWith({ message: 'Link copied', type: 'success' })
  })
})
