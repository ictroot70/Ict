'use client'

import React, { useEffect, useRef, useState } from 'react'

import { useSendImageMessageMutation } from '@/entities/messenger'
import {
  ImageAttachButton,
  ImagePreview,
  type ImageValidationError,
  useImageMessageDraft,
} from '@/features/messenger/image-message'
import { LinearProgress } from '@/shared/composites'
import { formatTime } from '@/shared/lib/formatters'
import { Typography } from '@ictroot/ui-kit'

import styles from './ChatWindow.module.scss'

import { MessageStatus, MessageType } from '../model/messenger.types'
import { useMessengerCenter } from '../model/useMessengerCenter'
import { ImageMessageModal } from './ImageMessageModal'
import { MessageBubble } from './MessageBubble'
import { MessageComposer } from './MessageComposer'

interface ChatWindowProps {
  dialoguePartnerId: number
  currentUserId: number
  partnerName: string
  partnerAvatarUrl?: string
  hasAttachment?: boolean
}

const getBubbleType = (type: MessageType) => {
  if (type === MessageType.IMAGE) {
    return 'image'
  }

  if (type === MessageType.VOICE) {
    return 'voice'
  }

  return 'text'
}

const getImageErrorText = (error: ImageValidationError | null) => {
  if (error === 'invalidType') {
    return 'Only PNG or JPEG images are allowed'
  }

  if (error === 'tooLarge') {
    return 'Image is too large and could not be compressed below 1 MB'
  }

  if (error === 'processingFailed') {
    return 'Could not process image. Choose another file'
  }

  return null
}

const NEAR_BOTTOM_PX = 80

export const ChatWindow: React.FC<ChatWindowProps> = ({
  dialoguePartnerId,
  currentUserId,
  partnerName,
  partnerAvatarUrl,
  hasAttachment = false,
}) => {
  const messagesEndRef = useRef<HTMLDivElement | null>(null)
  const messagesAreaRef = useRef<HTMLDivElement | null>(null)
  const shouldStickToBottomRef = useRef(true)
  const isInitialScrollRef = useRef(true)
  const [imageSendError, setImageSendError] = useState<string | null>(null)
  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null)

  const {
    messages,
    isFetching,
    isLoading,
    historyError,
    draftText,
    setDraftText,
    sendTextMessage,
    isSending,
    sendError,
  } = useMessengerCenter(dialoguePartnerId, currentUserId, {
    userName: partnerName,
    avatarUrl: partnerAvatarUrl,
  })

  const {
    file,
    previewUrl,
    error: imageError,
    selectImage,
    removeImage,
    isCompressing,
  } = useImageMessageDraft()
  const [sendImageMessage, { isLoading: isImageSending }] = useSendImageMessageMutation()

  const isImagePending = isImageSending || isCompressing

  const imageErrorText = getImageErrorText(imageError)
  const composerError = imageErrorText ?? imageSendError ?? sendError

  const handleSend = async () => {
    const message = draftText.trim()

    if (file) {
      try {
        setImageSendError(null)

        await sendImageMessage({
          receiverId: dialoguePartnerId,
          file,
          message: message || undefined,
        }).unwrap()

        removeImage()
        setDraftText('')
      } catch {
        setImageSendError('Could not send image. Try again later')
      }

      return
    }

    sendTextMessage(draftText, dialoguePartnerId)
  }

  const addImageButton = (
    <ImageAttachButton disabled={isImagePending} onImageSelect={selectImage}>
      <span className={styles.addImageButton}>+</span>
    </ImageAttachButton>
  )

  const previewSlot = previewUrl ? (
    <ImagePreview
      previewUrl={previewUrl}
      onRemove={removeImage}
      disabled={isImagePending}
      addSlot={addImageButton}
    />
  ) : null

  const actionsSlot = previewUrl ? null : (
    <ImageAttachButton disabled={isImagePending} onImageSelect={selectImage} />
  )

  const handleMessagesScroll = () => {
    const area = messagesAreaRef.current

    if (!area) {
      return
    }

    const distanceToBottom = area.scrollHeight - area.scrollTop - area.clientHeight

    shouldStickToBottomRef.current = distanceToBottom <= NEAR_BOTTOM_PX
  }

  useEffect(() => {
    isInitialScrollRef.current = true
    shouldStickToBottomRef.current = true
  }, [dialoguePartnerId])

  useEffect(() => {
    if (!shouldStickToBottomRef.current) {
      return
    }

    messagesEndRef.current?.scrollIntoView({
      behavior: isInitialScrollRef.current ? 'auto' : 'smooth',
    })
    isInitialScrollRef.current = false
  }, [messages])

  return (
    <div className={styles.container}>
      <LinearProgress active={isFetching || isCompressing} />

      <div className={styles.messagesArea} ref={messagesAreaRef} onScroll={handleMessagesScroll}>
        {historyError && (
          <Typography variant={'regular_14'} className={styles.historyError}>
            {historyError}
          </Typography>
        )}

        {!historyError && isLoading && messages.length === 0 && (
          <Typography variant={'regular_14'} className={styles.historyStatus}>
            Loading messages...
          </Typography>
        )}

        {messages.map((message, index) => {
          const isIncoming = message.ownerId !== currentUserId
          const prevMsg = messages[index - 1]
          const isPrevIncoming = prevMsg && prevMsg.ownerId !== currentUserId
          const showAvatar = isIncoming && !isPrevIncoming

          return (
            <MessageBubble
              key={message.id}
              text={message.messageText ?? ''}
              direction={isIncoming ? 'incoming' : 'outgoing'}
              timestamp={formatTime(message.createdAt)}
              type={getBubbleType(message.messageType)}
              url={message.mediaContent?.fileUrl}
              avatarUrl={partnerAvatarUrl}
              showAvatar={showAvatar}
              isRead={message.status === MessageStatus.READ}
              onImageClick={setPreviewImageUrl}
            />
          )
        })}
        <div ref={messagesEndRef} />
      </div>

      <MessageComposer
        value={draftText}
        onChange={setDraftText}
        onSend={handleSend}
        disabled={isImagePending}
        pending={isSending || isImagePending}
        error={composerError}
        hasAttachment={hasAttachment || Boolean(file)}
        previewSlot={previewSlot}
        actionsSlot={actionsSlot}
      />
      {previewImageUrl && (
        <ImageMessageModal imageUrl={previewImageUrl} onClose={() => setPreviewImageUrl(null)} />
      )}
    </div>
  )
}
