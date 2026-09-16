/* @vitest-environment jsdom */

import { showToastAlert } from '@/shared/lib'
import { act, renderHook } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { useFeedActions } from './useFeedActions'

vi.mock('@/shared/lib', () => ({
  showToastAlert: vi.fn(),
}))

const showToastAlertMock = vi.mocked(showToastAlert)

beforeEach(() => {
  vi.clearAllMocks()
})

describe('useFeedActions', () => {
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

  it('shows an error when the clipboard is unavailable', async () => {
    Object.defineProperty(window, 'isSecureContext', { configurable: true, value: false })
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: undefined,
    })

    const { result } = renderHook(() => useFeedActions())

    await act(async () => {
      await result.current.copyPostLink(4, 12)
    })

    expect(showToastAlertMock).toHaveBeenCalledWith({
      message: 'Failed to copy link',
      type: 'error',
    })
  })
})
