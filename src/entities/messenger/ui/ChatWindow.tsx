'use client'

import React, { useState } from 'react'

import { useSendImageMessageMutation } from '@/entities/messenger'
import { MessageStatus, MessageType, type MessageViewModel } from '@/entities/messenger/model'
import {
  ImageAttachButton,
  ImagePreview,
  useImageMessageDraft,
} from '@/features/messenger/image-message'
import { LinearProgress } from '@/shared/composites'
import { formatTime } from '@/shared/lib/formatters'

import styles from './ChatWindow.module.scss'

import { MessageBubble } from './MessageBubble'
import { MessageComposer } from './MessageComposer'

interface ChatWindowProps {
  currentUserId: number
  messages?: MessageViewModel[]
  partnerAvatarUrl?: string
  onSend?: (message: string) => void
  sendDisabled?: boolean
  error?: string | null
  isLoading?: boolean
  receiverId: number
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

const getImageErrorText = (error: 'invalidType' | 'tooLarge' | null) => {
  if (error === 'invalidType') {
    return 'Only PNG or JPEG images are allowed'
  }

  if (error === 'tooLarge') {
    return 'Image must be less than 1 MB'
  }

  return null
}

export const ChatWindow: React.FC<ChatWindowProps> = ({
  currentUserId,
  messages,
  partnerAvatarUrl,
  onSend,
  sendDisabled,
  error,
  isLoading = false,
  receiverId,
}) => {
  const [text, setText] = useState('')
  const [sendError, setSendError] = useState<string | null>(null)

  const { file, previewUrl, error: imageError, selectImage, removeImage } = useImageMessageDraft()

  const [sendImageMessage, { isLoading: isImageSending }] = useSendImageMessageMutation()

  const imageErrorText = getImageErrorText(imageError)
  const composerError = imageErrorText ?? sendError ?? error

  const handleSend = async () => {
    const message = text.trim()

    if (file) {
      try {
        setSendError(null)

        await sendImageMessage({
          receiverId,
          file,
          message: message || undefined,
        }).unwrap()

        removeImage()
        setText('')
      } catch {
        setSendError('Could not send image. Try again later')
      }

      return
    }

    if (!message || !onSend) {
      return
    }

    setSendError(null)
    onSend(message)
    setText('')
  }

  const addImageButton = (
    <ImageAttachButton disabled={sendDisabled || isImageSending} onImageSelect={selectImage}>
      <span className={styles.addImageButton}>+</span>
    </ImageAttachButton>
  )

  const previewSlot = previewUrl ? (
    <ImagePreview
      previewUrl={previewUrl}
      onRemove={removeImage}
      disabled={sendDisabled || isImageSending}
      addSlot={addImageButton}
    />
  ) : null

  const actionsSlot = previewUrl ? null : (
    <ImageAttachButton disabled={sendDisabled || isImageSending} onImageSelect={selectImage} />
  )

  return (
    <div className={styles.container}>
      <LinearProgress active={isLoading} />
      {/* Messages Area */}
      <div className={styles.messagesArea}>
        {[...(messages || [])].reverse().map((message, index, array) => {
          const isIncoming = message.ownerId !== currentUserId
          const prevMsg = array[index - 1]
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
            />
          )
        })}
      </div>

      {/* Message Composer */}
      <MessageComposer
        value={text}
        onChange={setText}
        onSend={handleSend}
        disabled={sendDisabled || isImageSending}
        pending={isImageSending}
        previewSlot={previewSlot}
        actionsSlot={actionsSlot}
        error={composerError}
      />
    </div>
  )
}
