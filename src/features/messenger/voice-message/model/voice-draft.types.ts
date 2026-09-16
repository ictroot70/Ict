import type { MessageViewModel } from '@/entities/messenger'

export type VoiceDraftError =
  | 'permissionDenied'
  | 'recordingFailed'
  | 'sizeExceeded'
  | 'unsupported'
  | 'sendFailed'

export type VoiceDraftStatus = 'idle' | 'requesting' | 'recording' | 'processing' | 'preview'

export interface UseVoiceMessageDraftOptions {
  receiverId: number
  senderId: number
  onSendStarted?: (message: MessageViewModel, waveform: readonly number[]) => void
  onSent?: (message: MessageViewModel, optimisticId: number) => void
  onSendFailed?: (optimisticId: number) => void
}
