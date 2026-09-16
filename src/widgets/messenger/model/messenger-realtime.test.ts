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
  applyMessageToDialogueMessages,
  applyMessageToMessengerDialogs,
  selectUnreadIncomingMessageIds,
} from './messenger-realtime'

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

const createDialogue = (overrides: Partial<LastMessageViewDto> = {}): LastMessageViewDto => ({
  ...createMessage({
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

describe('messenger realtime helpers', () => {
  it('handles text, image, and voice messages through the same realtime flow', () => {
    const dialogs = createDialogs()
    const textMessage = createMessage({
      messageText: 'Text',
      mediaContent: null,
      messageType: MessageType.TEXT,
    })
    const imageMessage = createMessage({
      id: 101,
      mediaContent: {
        fileType: MediaFileType.IMAGE,
        fileUrl: 'https://example.com/image.png',
        fileSize: 1024,
      },
      messageType: MessageType.IMAGE,
    })

    expect(
      applyMessageToMessengerDialogs(dialogs, textMessage, CURRENT_USER_ID, null).items[0]
        .messageType
    ).toBe(MessageType.TEXT)
    expect(
      applyMessageToMessengerDialogs(dialogs, imageMessage, CURRENT_USER_ID, null).items[0]
        .messageType
    ).toBe(MessageType.IMAGE)
  })

  it('ignores messages where the current user is not a participant', () => {
    const dialogs = createDialogs()
    const unrelatedMessage = createMessage({
      ownerId: 11,
      receiverId: 12,
    })

    expect(applyMessageToMessengerDialogs(dialogs, unrelatedMessage, CURRENT_USER_ID, null)).toBe(
      dialogs
    )
  })

  it('adds a message to the active dialogue history without duplicating it', () => {
    const message = createMessage()
    const history = createHistory()
    const updatedHistory = applyMessageToDialogueMessages(
      history,
      message,
      CURRENT_USER_ID,
      PARTNER_ID
    )

    expect(updatedHistory.items).toEqual([message])
    expect(updatedHistory.totalCount).toBe(1)

    const duplicateHistory = applyMessageToDialogueMessages(
      updatedHistory,
      message,
      CURRENT_USER_ID,
      PARTNER_ID
    )

    expect(duplicateHistory.items).toEqual([message])
    expect(duplicateHistory.totalCount).toBe(1)
  })

  it('increments unread count only for a new incoming message outside the active chat', () => {
    const message = createMessage()
    const dialogs = createDialogs()
    const updatedDialogs = applyMessageToMessengerDialogs(dialogs, message, CURRENT_USER_ID, null)

    expect(updatedDialogs.items[0]).toMatchObject({
      id: message.id,
      messageType: MessageType.VOICE,
      notReadCount: 3,
    })
    expect(updatedDialogs.notReadCount).toBe(3)

    const duplicateDialogs = applyMessageToMessengerDialogs(
      updatedDialogs,
      message,
      CURRENT_USER_ID,
      null
    )

    expect(duplicateDialogs.items[0].notReadCount).toBe(3)
    expect(duplicateDialogs.notReadCount).toBe(3)
  })

  it('updates the total unread count even when the cached dialog page does not include the partner', () => {
    const message = createMessage({
      ownerId: 3,
      receiverId: CURRENT_USER_ID,
    })
    const dialogs = createDialogs([createDialogue({ ownerId: 4, receiverId: CURRENT_USER_ID })])
    const updatedDialogs = applyMessageToMessengerDialogs(dialogs, message, CURRENT_USER_ID, null)

    expect(updatedDialogs.items).toEqual(dialogs.items)
    expect(updatedDialogs.notReadCount).toBe(dialogs.notReadCount + 1)
  })

  it('does not increment unread count for an incoming message in the active chat', () => {
    const message = createMessage()
    const dialogs = createDialogs()
    const updatedDialogs = applyMessageToMessengerDialogs(
      dialogs,
      message,
      CURRENT_USER_ID,
      PARTNER_ID
    )

    expect(updatedDialogs.items[0].notReadCount).toBe(0)
    expect(updatedDialogs.notReadCount).toBe(0)
  })

  it('does not add unread count for an outgoing message', () => {
    const message = createMessage({
      ownerId: CURRENT_USER_ID,
      receiverId: PARTNER_ID,
      status: MessageStatus.SENT,
    })
    const dialogs = createDialogs()
    const updatedDialogs = applyMessageToMessengerDialogs(dialogs, message, CURRENT_USER_ID, null)

    expect(updatedDialogs.items[0].notReadCount).toBe(2)
    expect(updatedDialogs.notReadCount).toBe(2)
  })

  it('selects unread incoming message ids when opening a dialogue history', () => {
    expect(
      selectUnreadIncomingMessageIds(
        [
          createMessage({ id: 101, status: MessageStatus.RECEIVED }),
          createMessage({ id: 102, status: MessageStatus.SENT }),
          createMessage({ id: 103, status: MessageStatus.READ }),
          createMessage({
            id: 104,
            ownerId: CURRENT_USER_ID,
            receiverId: PARTNER_ID,
            status: MessageStatus.SENT,
          }),
        ],
        CURRENT_USER_ID,
        new Set([102])
      )
    ).toEqual([101])
  })

  it('updates a current preview status without moving the dialogue as a new message', () => {
    const annaDialogue = createDialogue({
      id: 100,
      ownerId: CURRENT_USER_ID,
      receiverId: PARTNER_ID,
      status: MessageStatus.SENT,
      userName: 'anna',
    })
    const ivanDialogue = createDialogue({
      id: 200,
      ownerId: 3,
      receiverId: CURRENT_USER_ID,
      userName: 'ivan',
    })
    const statusUpdate = createMessage({
      id: annaDialogue.id,
      ownerId: CURRENT_USER_ID,
      receiverId: PARTNER_ID,
      status: MessageStatus.READ,
      updatedAt: '2026-07-31T10:01:00.000Z',
    })
    const updatedDialogs = applyMessageToMessengerDialogs(
      createDialogs([ivanDialogue, annaDialogue]),
      statusUpdate,
      CURRENT_USER_ID,
      null
    )

    expect(updatedDialogs.items.map(item => item.userName)).toEqual(['ivan', 'anna'])
    expect(updatedDialogs.items[1].status).toBe(MessageStatus.READ)
  })

  it('uses the new message status when replacing the preview with another message id', () => {
    const currentDialogue = createDialogue({
      id: 99,
      createdAt: '2026-07-31T10:00:00.000Z',
      status: MessageStatus.READ,
    })
    const newMessage = createMessage({
      id: 100,
      ownerId: CURRENT_USER_ID,
      receiverId: PARTNER_ID,
      createdAt: '2026-07-31T10:01:00.000Z',
      status: MessageStatus.SENT,
    })
    const updatedDialogs = applyMessageToMessengerDialogs(
      createDialogs([currentDialogue]),
      newMessage,
      CURRENT_USER_ID,
      null
    )

    expect(updatedDialogs.items[0]).toMatchObject({
      id: newMessage.id,
      status: MessageStatus.SENT,
    })
  })

  it('does not replace the dialog preview with an older status update', () => {
    const currentDialogue = createDialogue({
      id: 200,
      createdAt: '2026-07-31T10:02:00.000Z',
      messageText: 'Newest message',
    })
    const olderStatusUpdate = createMessage({
      id: 100,
      createdAt: '2026-07-31T10:01:00.000Z',
      updatedAt: '2026-07-31T10:03:00.000Z',
      status: MessageStatus.READ,
    })
    const updatedDialogs = applyMessageToMessengerDialogs(
      createDialogs([currentDialogue]),
      olderStatusUpdate,
      CURRENT_USER_ID,
      null
    )

    expect(updatedDialogs.items[0]).toMatchObject({
      id: currentDialogue.id,
      messageText: 'Newest message',
    })
  })
})
