import { MessageStatus, MessageType, type MessageViewModel } from '@/entities/messenger/model'
import { describe, expect, it } from 'vitest'

import { upsertMessageInHistory } from './upsert-message-in-history'

const createMessage = (id: number, status: MessageStatus, text = 'Message'): MessageViewModel => ({
  id,
  ownerId: 1,
  receiverId: 2,
  messageText: text,
  mediaContent: null,
  status,
  messageType: MessageType.TEXT,
  createdAt: '2026-07-13T10:00:00.000Z',
  updatedAt: '2026-07-13T10:00:00.000Z',
})

describe('upsertMessageInHistory', () => {
  it('adds a message when its id is not in history', () => {
    const existingMessage = createMessage(1, MessageStatus.READ)
    const incomingMessage = createMessage(2, MessageStatus.SENT)
    const messages = [existingMessage]

    const result = upsertMessageInHistory(messages, incomingMessage)

    expect(result).toHaveLength(2)
    expect(result).toContainEqual(incomingMessage)
    expect(messages).toEqual([existingMessage])
    expect(result).not.toBe(messages)
  })

  it('replaces an existing message with the same id', () => {
    const sentMessage = createMessage(10, MessageStatus.SENT, 'Hello')
    const receivedMessage = {
      ...sentMessage,
      status: MessageStatus.RECEIVED,
      updatedAt: '2026-07-13T10:01:00.000Z',
    }

    const result = upsertMessageInHistory([sentMessage], receivedMessage)

    expect(result).toEqual([receivedMessage])
    expect(result[0].status).toBe(MessageStatus.RECEIVED)
  })

  it('does not change messages with different ids', () => {
    const firstMessage = createMessage(1, MessageStatus.READ)
    const targetMessage = createMessage(2, MessageStatus.SENT)
    const updatedMessage = {
      ...targetMessage,
      status: MessageStatus.RECEIVED,
    }
    const messages = [firstMessage, targetMessage]

    const result = upsertMessageInHistory(messages, updatedMessage)

    expect(result[0]).toBe(firstMessage)
    expect(result[1]).toEqual(updatedMessage)
    expect(messages[1]).toBe(targetMessage)
  })
})
