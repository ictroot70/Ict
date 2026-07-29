import {
  MessageStatus,
  MessageType,
  type LastMessageViewDto,
  type MessageViewModel,
} from '@/entities/messenger/model'
import { describe, expect, it } from 'vitest'

import { mapMessageToDialoguePreview } from './map-message-to-dialogue-preview'

const CURRENT_USER_ID = 1
const DATE = '2026-07-12T10:00:00.000Z'

const createDialogue = (partnerId: number, userName: string): LastMessageViewDto => ({
  id: partnerId * 10,
  ownerId: partnerId,
  receiverId: CURRENT_USER_ID,
  messageText: `Old message from ${userName}`,
  status: MessageStatus.READ,
  messageType: MessageType.TEXT,
  createdAt: DATE,
  updatedAt: DATE,
  userName,
  avatars: [
    {
      url: `/${userName}.jpg`,
      width: 100,
      height: 100,
      fileSize: 1000,
    },
  ],
  notReadCount: 2,
})

const createMessage = (
  ownerId: number,
  receiverId: number,
  messageText: string
): MessageViewModel => ({
  id: 100,
  ownerId,
  receiverId,
  messageText,
  status: MessageStatus.RECEIVED,
  messageType: MessageType.TEXT,
  createdAt: '2026-07-12T11:00:00.000Z',
  updatedAt: '2026-07-12T11:00:00.000Z',
})

const annaDialogue = createDialogue(2, 'anna')
const ivanDialogue = createDialogue(3, 'ivan')

describe('mapMessageToDialoguePreview', () => {
  it('updates and moves an outgoing dialogue to the top', () => {
    const dialogues = [annaDialogue, ivanDialogue]
    const originalDialogues = structuredClone(dialogues)
    const message = createMessage(CURRENT_USER_ID, 3, 'New message to Ivan')

    const result = mapMessageToDialoguePreview(dialogues, message, CURRENT_USER_ID)

    expect(result.type).toBe('updated')

    if (result.type !== 'updated') {
      throw new Error('Expected updated result')
    }

    expect(result.dialogues.map(item => item.userName)).toEqual(['ivan', 'anna'])
    expect(result.dialogues[0]).toMatchObject(message)
    expect(result.dialogues[0].avatars).toBe(ivanDialogue.avatars)
    expect(result.dialogues[0].notReadCount).toBe(2)
    expect(dialogues).toEqual(originalDialogues)
    expect(result.dialogues).not.toBe(dialogues)
  })

  it('finds an incoming dialogue by ownerId', () => {
    const message = createMessage(2, CURRENT_USER_ID, 'New message from Anna')

    const result = mapMessageToDialoguePreview(
      [ivanDialogue, annaDialogue],
      message,
      CURRENT_USER_ID
    )

    expect(result.type).toBe('updated')

    if (result.type !== 'updated') {
      throw new Error('Expected updated result')
    }

    expect(result.dialogues[0].userName).toBe('anna')
    expect(result.dialogues[0].messageText).toBe('New message from Anna')
  })

  it('returns dialogue-not-found for a new partner', () => {
    const message = createMessage(4, CURRENT_USER_ID, 'Message from unknown partner')

    const result = mapMessageToDialoguePreview(
      [annaDialogue, ivanDialogue],
      message,
      CURRENT_USER_ID
    )

    expect(result).toEqual({
      type: 'dialogue-not-found',
    })
  })

  it('returns not-participant for an unrelated message', () => {
    const message = createMessage(4, 5, 'Foreign message')

    const result = mapMessageToDialoguePreview(
      [annaDialogue, ivanDialogue],
      message,
      CURRENT_USER_ID
    )

    expect(result).toEqual({
      type: 'not-participant',
    })
  })
})
