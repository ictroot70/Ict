'use client'

import React, { useState } from 'react'

import { MessageStatus, MessageType, type MessageViewModel } from '@/entities/messenger/model'
import {
  ImageAttachButton,
  ImagePreview,
  useImageMessageDraft,
} from '@/features/messenger/image-message'
import { LinearProgress } from '@/shared/composites'

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

const formatTime = (value: string) =>
  new Intl.DateTimeFormat('en', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value))

export const ChatWindow: React.FC<ChatWindowProps> = ({
  currentUserId,
  messages,
  partnerAvatarUrl,
  onSend,
  sendDisabled,
  error,
  isLoading = false,
}) => {
  const [text, setText] = useState('')

  const { previewUrl, error: imageError, selectImage, removeImage } = useImageMessageDraft()

  const imageErrorText = getImageErrorText(imageError)
  const composerError = imageErrorText ?? error

  const handleSend = () => {
    const message = text.trim()

    if (!message || !onSend) {
      return
    }

    onSend(message)
    setText('')
  }

  const addImageButton = (
    <ImageAttachButton disabled={sendDisabled} onImageSelect={selectImage}>
      <span className={styles.addImageButton}>+</span>
    </ImageAttachButton>
  )

  const previewSlot = previewUrl ? (
    <ImagePreview
      previewUrl={previewUrl}
      onRemove={removeImage}
      disabled={sendDisabled}
      addSlot={addImageButton}
    />
  ) : null

  const actionsSlot = previewUrl ? null : (
    <ImageAttachButton disabled={sendDisabled} onImageSelect={selectImage} />
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
        disabled={!onSend || sendDisabled}
        previewSlot={previewSlot}
        actionsSlot={actionsSlot}
        error={composerError}
      />
    </div>
  )
}
