import {
  MediaFileType,
  MessageStatus,
  MessageType,
  type DialogueMessagesResponseDto,
  type LastMessageViewDto,
  type MessageViewModel,
  type MessengerDialogsResponseDto,
} from '@/entities/messenger'
import { describe, expect, it } from 'vitest'

import {
  applyVoiceMessageToDialogueMessages,
  applyVoiceMessageToMessengerDialogs,
  shouldMarkVoiceMessageAsRead,
} from './messenger-voice-realtime'

const CURRENT_USER_ID = 1
const PARTNER_ID = 2
const DATE = '2026-07-31T10:00:00.000Z'

const createVoiceMessage = (overrides: Partial<MessageViewModel> = {}): MessageViewModel => ({
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

const createDialogue = (overrides: Partial<LastMessageViewDto> = {}): LastMessageViewDto => ({
  ...createVoiceMessage({
    id: 10,
    messageType: MessageType.TEXT,
    messageText: 'Old message',
    mediaContent: null,
    status: MessageStatus.READ,
  }),
  userName: 'partner',
  avatars: [],
  notReadCount: 2,
  ...overrides,
})

const createDialogs = (
  items: LastMessageViewDto[] = [createDialogue()]
): MessengerDialogsResponseDto => ({
  pageSize: 50,
  totalCount: items.length,
  notReadCount: items.reduce((count, item) => count + item.notReadCount, 0),
  items,
})

const createHistory = (items: MessageViewModel[] = []): DialogueMessagesResponseDto => ({
  pageSize: 50,
  totalCount: items.length,
  notReadCount: 0,
  items,
})

describe('messenger voice realtime helpers', () => {
  it('ignores text and image messages to preserve other feature contracts', () => {
    const dialogs = createDialogs()
    const textMessage = createVoiceMessage({
      messageText: 'Text',
      mediaContent: null,
      messageType: MessageType.TEXT,
    })
    const imageMessage = createVoiceMessage({
      mediaContent: {
        fileType: MediaFileType.IMAGE,
        fileUrl: 'https://example.com/image.png',
        fileSize: 1024,
      },
      messageType: MessageType.IMAGE,
    })

    expect(applyVoiceMessageToMessengerDialogs(dialogs, textMessage, CURRENT_USER_ID, null)).toBe(
      dialogs
    )
    expect(applyVoiceMessageToMessengerDialogs(dialogs, imageMessage, CURRENT_USER_ID, null)).toBe(
      dialogs
    )
  })

  it('adds a voice message to the active dialogue history without duplicating it', () => {
    const message = createVoiceMessage()
    const history = createHistory()
    const updatedHistory = applyVoiceMessageToDialogueMessages(
      history,
      message,
      CURRENT_USER_ID,
      PARTNER_ID
    )

    expect(updatedHistory.items).toEqual([message])
    expect(updatedHistory.totalCount).toBe(1)

    const duplicateHistory = applyVoiceMessageToDialogueMessages(
      updatedHistory,
      message,
      CURRENT_USER_ID,
      PARTNER_ID
    )

    expect(duplicateHistory.items).toEqual([message])
    expect(duplicateHistory.totalCount).toBe(1)
  })

  it('increments unread count only for a new incoming voice message outside the active chat', () => {
    const message = createVoiceMessage()
    const dialogs = createDialogs()
    const updatedDialogs = applyVoiceMessageToMessengerDialogs(
      dialogs,
      message,
      CURRENT_USER_ID,
      null
    )

    expect(updatedDialogs.items[0]).toMatchObject({
      id: message.id,
      messageType: MessageType.VOICE,
      notReadCount: 3,
    })
    expect(updatedDialogs.notReadCount).toBe(3)

    const duplicateDialogs = applyVoiceMessageToMessengerDialogs(
      updatedDialogs,
      message,
      CURRENT_USER_ID,
      null
    )

    expect(duplicateDialogs.items[0].notReadCount).toBe(3)
    expect(duplicateDialogs.notReadCount).toBe(3)
  })

  it('does not increment unread count for an incoming voice message in the active chat', () => {
    const message = createVoiceMessage()
    const dialogs = createDialogs()
    const updatedDialogs = applyVoiceMessageToMessengerDialogs(
      dialogs,
      message,
      CURRENT_USER_ID,
      PARTNER_ID
    )

    expect(updatedDialogs.items[0].notReadCount).toBe(2)
    expect(updatedDialogs.notReadCount).toBe(2)
    expect(shouldMarkVoiceMessageAsRead(message, CURRENT_USER_ID, PARTNER_ID)).toBe(true)
  })

  it('does not add unread count for an outgoing voice message', () => {
    const message = createVoiceMessage({
      ownerId: CURRENT_USER_ID,
      receiverId: PARTNER_ID,
      status: MessageStatus.SENT,
    })
    const dialogs = createDialogs()
    const updatedDialogs = applyVoiceMessageToMessengerDialogs(
      dialogs,
      message,
      CURRENT_USER_ID,
      null
    )

    expect(updatedDialogs.items[0].notReadCount).toBe(2)
    expect(updatedDialogs.notReadCount).toBe(2)
    expect(shouldMarkVoiceMessageAsRead(message, CURRENT_USER_ID, PARTNER_ID)).toBe(false)
  })
})
