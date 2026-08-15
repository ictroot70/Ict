import type { LastMessageViewDto, MessageViewModel } from '../model/messenger.types'
import type { AvatarViewDto } from '@/shared/types/base/common'

export const DEFAULT_MESSAGES_PAGE_SIZE = 50
export const SEND_CONFIRMATION_TIMEOUT_MS = 10_000

export function sortMessagesByCreatedAtAsc(messages: MessageViewModel[]): MessageViewModel[] {
  return [...messages].sort(
    (left, right) => new Date(left.createdAt).getTime() - new Date(right.createdAt).getTime()
  )
}

export function toPreviewAvatars(avatarUrl?: string): AvatarViewDto[] {
  if (!avatarUrl) {
    return []
  }

  return [{ url: avatarUrl, width: 0, height: 0, fileSize: 0 }]
}

export function applyOptimisticDialogPreview(params: {
  currentItems: LastMessageViewDto[]
  optimisticMessage: MessageViewModel
  receiverId: number
  partnerUserName?: string
  partnerAvatarUrl?: string
}): LastMessageViewDto[] {
  const { currentItems, optimisticMessage, receiverId, partnerUserName, partnerAvatarUrl } = params
  const existingIdx = currentItems.findIndex(
    d => d.ownerId === receiverId || d.receiverId === receiverId
  )
  const existing = existingIdx >= 0 ? currentItems[existingIdx] : undefined
  const previewAvatars = existing?.avatars?.length
    ? existing.avatars
    : toPreviewAvatars(partnerAvatarUrl)

  const updatedDialog: LastMessageViewDto = {
    ...optimisticMessage,
    userName: existing?.userName ?? partnerUserName ?? `User ${receiverId}`,
    avatars: previewAvatars,
    notReadCount: 0,
  }

  if (existingIdx >= 0) {
    const updated = [...currentItems]

    updated.splice(existingIdx, 1)
    updated.unshift(updatedDialog)

    return updated
  }

  return [updatedDialog, ...currentItems]
}
