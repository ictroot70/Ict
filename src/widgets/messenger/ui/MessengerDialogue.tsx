'use client'

import type { ReactNode } from 'react'

import { ChatWindow } from '@/entities/messenger/ui/ChatWindow'
import {
  useVoiceMessageDraft,
  VoicePreview,
  VoiceProcessingPanel,
  VoiceRecordButton,
  VoiceRecordingPanel,
} from '@/features/messenger/voice-message'
import { useTranslations } from 'next-intl'

import { useMessengerDialogueData } from '../model'

interface MessengerDialogueProps {
  partnerId: number
}

export function MessengerDialogue({ partnerId }: MessengerDialogueProps) {
  const t = useTranslations('messenger.voice')
  const {
    currentUserId,
    messages,
    messageWaveforms,
    firstItemIndex,
    hasOlderMessages,
    isLoadingOlderMessages,
    partnerAvatarUrl,
    isLoading,
    error,
    loadOlderMessages,
    upsertSentMessage,
    replaceSentMessage,
    removeSentMessage,
  } = useMessengerDialogueData(partnerId)
  const voice = useVoiceMessageDraft({
    receiverId: partnerId,
    senderId: currentUserId,
    onSendStarted: upsertSentMessage,
    onSent: replaceSentMessage,
    onSendFailed: removeSentMessage,
  })
  const voiceError = voice.error ? t(`errors.${voice.error}`) : null
  const isVoiceMode =
    voice.status === 'recording' || voice.status === 'processing' || voice.status === 'preview'
  let voiceContent: ReactNode = null

  if (voice.status === 'recording') {
    voiceContent = (
      <VoiceRecordingPanel
        duration={voice.duration}
        waveform={voice.waveform}
        onCancel={voice.discard}
        onStop={voice.stopRecording}
      />
    )
  } else if (voice.status === 'processing') {
    voiceContent = <VoiceProcessingPanel />
  } else if (voice.previewUrl && voice.status === 'preview') {
    voiceContent = (
      <VoicePreview
        source={voice.previewUrl}
        recordedDuration={voice.duration}
        waveform={voice.waveform}
        onDelete={voice.discard}
        onSend={() => void voice.send()}
      />
    )
  }

  return (
    <ChatWindow
      key={partnerId}
      currentUserId={currentUserId}
      messages={messages}
      voiceWaveforms={messageWaveforms}
      firstItemIndex={firstItemIndex}
      hasOlderMessages={hasOlderMessages}
      isLoadingOlderMessages={isLoadingOlderMessages}
      partnerAvatarUrl={partnerAvatarUrl}
      isLoading={isLoading}
      error={error}
      onLoadOlderMessages={() => void loadOlderMessages()}
      composerError={voiceError}
      composerActionsSlot={
        !isVoiceMode ? (
          <VoiceRecordButton
            disabled={voice.status === 'requesting'}
            onClick={() => void voice.startRecording()}
          />
        ) : null
      }
      composerContentSlot={voiceContent}
    />
  )
}
