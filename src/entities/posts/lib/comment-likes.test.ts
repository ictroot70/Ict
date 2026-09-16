import { LikeStatus } from '@/shared/types'
import { describe, expect, it } from 'vitest'

import { getNextLikeStatus, patchLikeFields } from './comment-likes'

describe('getNextLikeStatus', () => {
  it('returns LIKE when isLiked is false', () => {
    expect(getNextLikeStatus(false)).toBe(LikeStatus.LIKE)
  })

  it('returns NONE when isLiked is true', () => {
    expect(getNextLikeStatus(true)).toBe(LikeStatus.NONE)
  })
})

describe('patchLikeFields', () => {
  it('increments likeCount and sets isLiked to true when liking', () => {
    const item = { isLiked: false, likeCount: 0 }

    patchLikeFields(item, LikeStatus.LIKE)
    expect(item.isLiked).toBe(true)
    expect(item.likeCount).toBe(1)
  })

  it('decrements likeCount and sets isLiked to false when unliking', () => {
    const item = { isLiked: true, likeCount: 5 }

    patchLikeFields(item, LikeStatus.NONE)
    expect(item.isLiked).toBe(false)
    expect(item.likeCount).toBe(4)
  })

  it('does not decrement below 0', () => {
    const item = { isLiked: true, likeCount: 0 }

    patchLikeFields(item, LikeStatus.NONE)
    expect(item.likeCount).toBe(0)
  })
})
