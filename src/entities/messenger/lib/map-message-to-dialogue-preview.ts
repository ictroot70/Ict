import type { LastMessageViewDto, MessageViewModel } from '@/entities/messenger/model'

export type DialoguePreviewUpdateResult =
  | {
      type: 'updated'
      dialogues: LastMessageViewDto[]
    }
  | {
      type: 'dialogue-not-found'
    }
  | {
      type: 'not-participant'
    }

export function getDialoguePartnerId(
  message: MessageViewModel,
  currentUserId: number
): number | null {
  if (message.ownerId === currentUserId) {
    return message.receiverId
  }

  if (message.receiverId === currentUserId) {
    return message.ownerId
  }

  return null
}

export function mapMessageToDialoguePreview(
  dialogues: readonly LastMessageViewDto[],
  message: MessageViewModel,
  currentUserId: number
): DialoguePreviewUpdateResult {
  const partnerId = getDialoguePartnerId(message, currentUserId)

  if (partnerId === null) {
    return { type: 'not-participant' }
  }

  const dialogueIndex = dialogues.findIndex(
    dialogue => getDialoguePartnerId(dialogue, currentUserId) === partnerId
  )

  if (dialogueIndex === -1) {
    return { type: 'dialogue-not-found' }
  }

  const currentDialogue = dialogues[dialogueIndex]
  const updatedDialogue = {
    ...currentDialogue,
    ...message,
  }

  return {
    type: 'updated',
    dialogues: [updatedDialogue, ...dialogues.filter((_, index) => index !== dialogueIndex)],
  }
}
