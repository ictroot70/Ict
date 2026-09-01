import { describe, expect, it } from 'vitest'

import { extractDeletedMessageId } from './extract-deleted-message-id'

describe('extractDeletedMessageId', () => {
  it('accepts a bare numeric id', () => {
    expect(extractDeletedMessageId(42)).toBe(42)
  })

  it('accepts an object wrapping the id', () => {
    expect(extractDeletedMessageId({ id: 42 })).toBe(42)
  })

  it.each([
    ['null', null],
    ['undefined', undefined],
    ['a string number', '42'],
    ['a non-integer number', 4.2],
    ['an object with a non-integer id', { id: 4.2 }],
    ['an object with a string id', { id: '42' }],
    ['an object without an id field', { messageId: 42 }],
    ['an array', [42]],
  ])('rejects %s', (_, payload) => {
    expect(extractDeletedMessageId(payload)).toBeNull()
  })
})
