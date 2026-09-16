import type { SearchUserItem } from '@/entities/users/api/api.types'

import {
  MediaFileType,
  MessageStatus,
  MessageType,
  type LastMessageViewDto,
} from '@/entities/messenger'
import { describe, expect, it } from 'vitest'

import { appendNewContactItems, buildDialogueItems } from './messenger-list'

const dialogue = {
  id: 10,
  ownerId: 1,
  receiverId: 2,
  messageText: null,
  mediaContent: {
    fileType: MediaFileType.IMAGE,
    fileUrl: 'https://example.com/image.png',
    fileSize: 100,
  },
  status: MessageStatus.SENT,
  messageType: MessageType.IMAGE,
  createdAt: '2026-07-30T10:00:00.000Z',
  updatedAt: '2026-07-30T10:00:00.000Z',
  userName: 'receiver',
  avatars: [],
  notReadCount: 3,
} satisfies LastMessageViewDto

const user = (id: number, userName: string): SearchUserItem => ({
  id,
  userName,
  firstName: null,
  lastName: null,
  avatars: [],
})

describe('messenger list mapping', () => {
  it('maps a real dialogue to its partner and media preview', () => {
    expect(buildDialogueItems([dialogue], 1)).toEqual([
      {
        userId: 2,
        userName: 'receiver',
        avatarUrl: undefined,
        lastMessage: 'You: Image',
        updatedAt: dialogue.updatedAt,
        notReadCount: 0,
      },
    ])
  })

  it('keeps the unread count only for an incoming dialogue message', () => {
    expect(
      buildDialogueItems([{ ...dialogue, ownerId: 2, receiverId: 1 }], 1)[0].notReadCount
    ).toBe(3)
  })

  it('does not prefix You: for incoming last messages', () => {
    const incoming = { ...dialogue, ownerId: 2, receiverId: 1 }

    expect(buildDialogueItems([incoming], 1)[0]?.lastMessage).toBe('Image')
  })

  it('adds only users without an existing dialogue and excludes the current user', () => {
    const dialogueItems = buildDialogueItems([dialogue], 1)

    expect(
      appendNewContactItems(dialogueItems, [user(1, 'me'), user(2, 'receiver'), user(3, 'new')], 1)
    ).toEqual([
      ...dialogueItems,
      {
        userId: 3,
        userName: 'new',
        avatarUrl: undefined,
        lastMessage: 'Start a conversation',
        updatedAt: null,
        notReadCount: 0,
      },
    ])
  })
})
