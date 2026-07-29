import { MessageStatus, MessageType, type MessageViewModel } from '@/entities/messenger/model'
import { describe, expect, it } from 'vitest'

import { isIncomingMessagePayload } from './is-incoming-message-payload'

const validPayload = {
  id: 10,
  ownerId: 1,
  receiverId: 2,
  messageText: 'Hello',
  status: MessageStatus.SENT,
  messageType: MessageType.TEXT,
  createdAt: '2026-07-12T10:00:00.000Z',
  updatedAt: '2026-07-12T10:00:00.000Z',
} satisfies MessageViewModel

describe('validateIncomingMessagePayload', () => {
  it('accepts a valid message', () => {
    expect(isIncomingMessagePayload(validPayload)).toBe(true)
  })

  it.each([
    ['null payload', null],
    ['invalid id', { ...validPayload, id: '10' }],
    ['missing field', { ...validPayload, ownerId: undefined }],
    ['invalid type', { ...validPayload, messageType: 'GIF' }],
    ['invalid status', { ...validPayload, status: 'DELIVERED' }],
    ['invalid date', { ...validPayload, createdAt: 'invalid' }],
  ])('rejects %s', (_, payload) => {
    expect(isIncomingMessagePayload(payload)).toBe(false)
  })
})
