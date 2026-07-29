'use client'

import React, { useState } from 'react'

import { useSendImageMessageMutation } from '@/entities/messenger'
import {
  ImageAttachButton,
  ImagePreview,
  useImageMessageDraft,
} from '@/features/messenger/image-message'
import { Chat, Message } from '@/shared/api/messenger-mocks'

import styles from './ChatWindow.module.scss'

import { MessageBubble } from './MessageBubble'
import { MessageComposer } from './MessageComposer'

interface ChatWindowProps {
  chat?: Chat
  messages?: Message[]
  receiverId: number
}

export const ChatWindow: React.FC<ChatWindowProps> = ({ chat, messages, receiverId }) => {
  const [text, setText] = useState('')

  const { file, previewUrl, error, selectImage, removeImage } = useImageMessageDraft()
  const [sendImageMessage, { isLoading: isSendingImage }] = useSendImageMessageMutation()

  const getImageErrorText = () => {
    if (error === 'invalidType') {
      return 'Only PNG or JPEG images are allowed'
    }

    if (error === 'tooLarge') {
      return 'Image must be less than 1 MB'
    }

    return null
  }

  const handleSend = async () => {
    if (!file) {
      setText('')

      return
    }

    try {
      await sendImageMessage({
        receiverId,
        file,
        message: text,
      }).unwrap()

      removeImage()
      setText('')
    } catch {
      // нормальную ошибку добавим следующим шагом
    }
  }

  const imageErrorText = getImageErrorText()

  return (
    <div className={styles.container}>
      {/* Messages Area */}
      <div className={styles.messagesArea}>
        {[...(messages || [])].reverse().map((msg, index, array) => {
          const isIncoming = msg.senderId !== 'me'
          const prevMsg = array[index - 1]
          const isPrevIncoming = prevMsg && prevMsg.senderId !== 'me'
          const showAvatar = isIncoming && !isPrevIncoming

          return (
            <MessageBubble
              key={msg.id}
              text={msg.text}
              direction={isIncoming ? 'incoming' : 'outgoing'}
              timestamp={msg.timestamp}
              type={msg.type}
              url={msg.url}
              avatarUrl={chat?.avatarUrl}
              showAvatar={showAvatar}
              isRead={index % 3 === 0}
            />
          )
        })}
      </div>

      {/* Message Composer */}
      <MessageComposer
        value={text}
        onChange={setText}
        onSend={handleSend}
        pending={isSendingImage}
        previewSlot={
          previewUrl ? <ImagePreview previewUrl={previewUrl} onRemove={removeImage} /> : null
        }
        actionsSlot={<ImageAttachButton onImageSelect={selectImage} />}
        error={imageErrorText}
      />
    </div>
  )
}
