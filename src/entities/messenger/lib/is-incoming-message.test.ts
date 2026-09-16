import { describe, expect, it } from 'vitest'

import { MediaFileType, MessageStatus, MessageType, type MessageViewModel } from '../model'
import { isIncomingMessage } from './is-incoming-message'

const voiceMessage = {
  id: 1,
  ownerId: 10,
  receiverId: 20,
  messageText: null,
  mediaContent: null,
  status: MessageStatus.SENT,
  messageType: MessageType.VOICE,
  createdAt: '2026-07-31T10:00:00.000Z',
  updatedAt: '2026-07-31T10:00:00.000Z',
} satisfies MessageViewModel

describe('isIncomingMessage', () => {
  it('keeps the original owner-based contract for text messages', () => {
    const textMessage = {
      ...voiceMessage,
      messageText: 'Hello',
      messageType: MessageType.TEXT,
    } satisfies MessageViewModel

    expect(isIncomingMessage(textMessage, textMessage.ownerId)).toBe(false)
    expect(isIncomingMessage(textMessage, textMessage.receiverId)).toBe(true)
  })

  it('keeps the original owner-based contract for image messages', () => {
    const imageMessage = {
      ...voiceMessage,
      mediaContent: {
        fileType: MediaFileType.IMAGE,
        fileUrl: 'https://example.com/image.png',
        fileSize: 1024,
      },
      messageType: MessageType.IMAGE,
    } satisfies MessageViewModel

    expect(isIncomingMessage(imageMessage, imageMessage.ownerId)).toBe(false)
    expect(isIncomingMessage(imageMessage, imageMessage.receiverId)).toBe(true)
  })

  it('uses the receiver-based contract for voice messages', () => {
    expect(isIncomingMessage(voiceMessage, voiceMessage.ownerId)).toBe(false)
    expect(isIncomingMessage(voiceMessage, voiceMessage.receiverId)).toBe(true)
  })

  it('does not classify a message before the current user is loaded', () => {
    expect(isIncomingMessage(voiceMessage, 0)).toBe(false)
  })
})
