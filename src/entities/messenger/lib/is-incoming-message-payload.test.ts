import {
  MediaFileType,
  MessageStatus,
  MessageType,
  type MessageViewModel,
} from '@/entities/messenger/model'
import { describe, expect, it } from 'vitest'

import { isIncomingMessagePayload } from './is-incoming-message-payload'

const validPayload = {
  id: 10,
  ownerId: 1,
  receiverId: 2,
  messageText: 'Hello',
  mediaContent: null,
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
    [
      'image message',
      {
        ...validPayload,
        messageText: null,
        messageType: MessageType.IMAGE,
        mediaContent: {
          fileType: MediaFileType.IMAGE,
          fileUrl: 'https://example.com/message.png',
          fileSize: 1024,
        },
      },
    ],
    [
      'voice message',
      {
        ...validPayload,
        messageText: null,
        messageType: MessageType.VOICE,
        mediaContent: {
          fileType: MediaFileType.VOICE,
          fileUrl: 'https://example.com/message.webm',
          fileSize: 2048,
        },
      },
    ],
  ])('accepts a valid %s', (_, payload) => {
    expect(isIncomingMessagePayload(payload)).toBe(true)
  })

  it.each([
    ['null payload', null],
    ['invalid id', { ...validPayload, id: '10' }],
    ['missing field', { ...validPayload, ownerId: undefined }],
    ['missing mediaContent', { ...validPayload, mediaContent: undefined }],
    [
      'invalid media file type',
      {
        ...validPayload,
        mediaContent: {
          fileType: 'video',
          fileUrl: 'https://example.com/message.mp4',
          fileSize: 1024,
        },
      },
    ],
    [
      'invalid media file size',
      {
        ...validPayload,
        mediaContent: {
          fileType: MediaFileType.IMAGE,
          fileUrl: 'https://example.com/message.png',
          fileSize: -1,
        },
      },
    ],
    ['invalid type', { ...validPayload, messageType: 'GIF' }],
    ['invalid status', { ...validPayload, status: 'DELIVERED' }],
    ['invalid date', { ...validPayload, createdAt: 'invalid' }],
  ])('rejects %s', (_, payload) => {
    expect(isIncomingMessagePayload(payload)).toBe(false)
  })
})
