import { createAudioWaveformFromBlob } from '@/shared/lib'

import {
  isVoiceFileWithinSizeLimit,
  normalizeVoiceRecording,
  type VoiceRecordingFormat,
} from './voice-recorder'

interface VoicePreviewDraft {
  file: File
  waveform: readonly number[]
}

export async function prepareVoicePreviewDraft(
  chunks: readonly Blob[],
  format: VoiceRecordingFormat,
  fallbackWaveform: readonly number[]
): Promise<VoicePreviewDraft | null> {
  const file = await normalizeVoiceRecording(chunks, format)

  if (!isVoiceFileWithinSizeLimit(file)) {
    return null
  }

  const waveform = await createAudioWaveformFromBlob(file).catch(() => fallbackWaveform)

  return { file, waveform }
}
