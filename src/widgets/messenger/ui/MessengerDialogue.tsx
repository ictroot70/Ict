'use client'

import { useState, type ReactNode } from 'react'

import { useSendImageMessageMutation } from '@/entities/messenger'
import { ChatWindow } from '@/entities/messenger/ui/ChatWindow'
import {
  ImageAttachButton,
  ImagePreview,
  useImageMessageDraft,
} from '@/features/messenger/image-message'
import {
  useVoiceMessageDraft,
  VoicePreview,
  VoiceProcessingPanel,
  VoiceRecordButton,
  VoiceRecordingPanel,
} from '@/features/messenger/voice-message'
import { useTranslations } from 'next-intl'

import { useMessengerDialogueData, useMessengerTextDraft } from '../model'

interface MessengerDialogueProps {
  partnerId: number
}

export function MessengerDialogue({ partnerId }: MessengerDialogueProps) {
  const voiceT = useTranslations('messenger.voice')
  const imageT = useTranslations('messenger.image')
  const textT = useTranslations('messenger.text')
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
  const text = useMessengerTextDraft({
    messages,
    receiverId: partnerId,
    senderId: currentUserId,
    onRemoveOptimistic: removeSentMessage,
    onSendStarted: upsertSentMessage,
  })
  const image = useImageMessageDraft()
  const [sendImageMessage, { isLoading: isImageSending }] = useSendImageMessageMutation()
  const [imageSendFailed, setImageSendFailed] = useState(false)
  const voice = useVoiceMessageDraft({
    receiverId: partnerId,
    senderId: currentUserId,
    onSendStarted: upsertSentMessage,
    onSent: replaceSentMessage,
    onSendFailed: removeSentMessage,
  })
  const voiceError = voice.error ? voiceT(`errors.${voice.error}`) : null
  const imageError = image.error ? imageT(`errors.${image.error}`) : null
  const textError = text.error ? textT(`errors.${text.error}`) : null
  const composerError =
    voiceError ?? imageError ?? (imageSendFailed ? imageT('errors.sendFailed') : null) ?? textError
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

  const handleImageSelect = (file: File) => {
    setImageSendFailed(false)
    image.selectImage(file)
  }

  const handleImageRemove = () => {
    setImageSendFailed(false)
    image.removeImage()
  }

  const imageAttachButton = (
    <ImageAttachButton
      disabled={isImageSending || text.isSending || voice.status === 'requesting'}
      onImageSelect={handleImageSelect}
    />
  )
  const imagePreview = image.previewUrl ? (
    <ImagePreview
      previewUrl={image.previewUrl}
      onRemove={handleImageRemove}
      disabled={isImageSending}
      addSlot={imageAttachButton}
    />
  ) : null

  const handleSend = async () => {
    if (!image.file) {
      text.send()

      return
    }

    try {
      setImageSendFailed(false)
      const message = await sendImageMessage({
        receiverId: partnerId,
        file: image.file,
        message: text.draftText.trim() || undefined,
      }).unwrap()

      upsertSentMessage(message)
      image.removeImage()
      text.setDraftText('')
    } catch {
      setImageSendFailed(true)
    }
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
      composerValue={text.draftText}
      onComposerChange={text.setDraftText}
      onSend={() => void handleSend()}
      sendDisabled={isImageSending || voice.status === 'requesting'}
      pending={text.isSending || isImageSending}
      hasAttachment={image.hasImage}
      isLoading={isLoading}
      error={error}
      onLoadOlderMessages={() => void loadOlderMessages()}
      composerError={composerError}
      composerPreviewSlot={!isVoiceMode ? imagePreview : null}
      composerActionsSlot={
        !isVoiceMode ? (
          <>
            {!image.previewUrl && imageAttachButton}
            <VoiceRecordButton
              disabled={voice.status === 'requesting' || image.hasImage || text.isSending}
              onClick={() => void voice.startRecording()}
            />
          </>
        ) : null
      }
      composerContentSlot={voiceContent}
    />
  )
}
