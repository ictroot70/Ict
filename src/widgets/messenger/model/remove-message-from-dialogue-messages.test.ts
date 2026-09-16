import {
  MediaFileType,
  MessageStatus,
  MessageType,
  type DialogueMessagesResponseDto,
  type MessageViewModel,
} from '@/entities/messenger'
import { describe, expect, it } from 'vitest'

import { removeMessageFromDialogueMessages } from './messenger-realtime'

const CURRENT_USER_ID = 1
const PARTNER_ID = 2
const DATE = '2026-07-31T10:00:00.000Z'

const createMessage = (overrides: Partial<MessageViewModel> = {}): MessageViewModel => ({
  id: 100,
  ownerId: PARTNER_ID,
  receiverId: CURRENT_USER_ID,
  messageText: null,
  mediaContent: {
    fileType: MediaFileType.VOICE,
    fileUrl: 'https://example.com/message.wav',
    fileSize: 2048,
  },
  status: MessageStatus.RECEIVED,
  messageType: MessageType.VOICE,
  createdAt: DATE,
  updatedAt: DATE,
  ...overrides,
})

const createHistory = (items: MessageViewModel[] = []): DialogueMessagesResponseDto => ({
  pageSize: 50,
  totalCount: items.length,
  notReadCount: 0,
  items,
})

describe('removeMessageFromDialogueMessages', () => {
  it('removes the message and decrements totalCount when it exists', () => {
    const message = createMessage({ id: 100 })
    const otherMessage = createMessage({ id: 101 })
    const history = createHistory([message, otherMessage])

    const updatedHistory = removeMessageFromDialogueMessages(history, 100)

    expect(updatedHistory.items).toEqual([otherMessage])
    expect(updatedHistory.totalCount).toBe(1)
  })

  it('returns the same history reference when the message id is not present', () => {
    const history = createHistory([createMessage({ id: 100 })])

    const updatedHistory = removeMessageFromDialogueMessages(history, 999)

    expect(updatedHistory).toBe(history)
  })

  it('never lets totalCount go negative', () => {
    const message = createMessage({ id: 100 })
    const history = { ...createHistory([message]), totalCount: 0 }

    const updatedHistory = removeMessageFromDialogueMessages(history, 100)

    expect(updatedHistory.totalCount).toBe(0)
    expect(updatedHistory.items).toEqual([])
  })
})
