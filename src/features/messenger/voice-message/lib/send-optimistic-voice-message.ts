import type { MessageViewModel } from '@/entities/messenger'

import { createOptimisticVoiceMessage } from './create-optimistic-voice-message'

interface SendOptimisticVoiceMessageOptions {
  file: File
  receiverId: number
  senderId: number
  waveform: readonly number[]
  upload: () => Promise<MessageViewModel>
  clearDraft: () => void
  restoreDraft: () => void
  onSendStarted?: (message: MessageViewModel, waveform: readonly number[]) => void
  onSent?: (message: MessageViewModel, optimisticId: number) => void
  onSendFailed?: (optimisticId: number) => void
}

export async function sendOptimisticVoiceMessage({
  file,
  receiverId,
  senderId,
  waveform,
  upload,
  clearDraft,
  restoreDraft,
  onSendStarted,
  onSent,
  onSendFailed,
}: SendOptimisticVoiceMessageOptions) {
  const optimisticUrl = URL.createObjectURL(file)
  const optimisticMessage = createOptimisticVoiceMessage({
    file,
    fileUrl: optimisticUrl,
    ownerId: senderId,
    receiverId,
  })

  onSendStarted?.(optimisticMessage, waveform)
  clearDraft()

  try {
    const message = await upload()

    onSent?.(message, optimisticMessage.id)
  } catch {
    onSendFailed?.(optimisticMessage.id)
    restoreDraft()
  } finally {
    const revokeObjectUrl = URL.revokeObjectURL.bind(URL)

    window.setTimeout(() => revokeObjectUrl(optimisticUrl), 0)
  }
}
