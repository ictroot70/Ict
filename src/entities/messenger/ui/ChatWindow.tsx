// 'use client'

// <<<<<<< HEAD
// import React from 'react'
// =======
// import React, { useState } from 'react'

// import { MessageStatus, MessageType, type MessageViewModel } from '@/entities/messenger/model'
// import { LinearProgress } from '@/shared/composites'
// >>>>>>> origin/messenger-media-contract-alignment

// import styles from './ChatWindow.module.scss'

// import { MessageStatus, type MessageViewModel } from '../model/messenger.types'
// import { useMessengerCenter } from '../model/useMessengerCenter'
// import { MessageBubble } from './MessageBubble'
// import { MessageComposer } from './MessageComposer'

// interface ChatWindowProps {
// <<<<<<< HEAD
//   dialoguePartnerId: number
//   partnerName: string
//   partnerAvatarUrl?: string
// }

// export const ChatWindow: React.FC<ChatWindowProps> = ({
//   dialoguePartnerId,
//   partnerName,
//   partnerAvatarUrl,
// }) => {
//   const {
//     messages,
//     isFetching,
//     draftText,
//     setDraftText,
//     sendTextMessage,
//     isSending,
//     sendError,
//     currentUserId,
//   } = useMessengerCenter(dialoguePartnerId)

//   const handleSend = () => {
//     sendTextMessage(draftText, dialoguePartnerId)
//   }

//   const renderMessages = () => {
//     if (isFetching && messages.length === 0) {
//       return <div className={styles.loading}>Загрузка сообщений...</div>
//     }

//     const reversedMessages = [...messages].reverse()

//     return reversedMessages.map((msg, index, array) => {
//       const isOutgoing = msg.ownerId === currentUserId
//       const prevMsg = array[index - 1]
//       const isPrevOutgoing = prevMsg && prevMsg.ownerId === currentUserId
//       const showAvatar = !isOutgoing && !isPrevOutgoing

//       return (
//         <MessageBubble
//           key={msg.id}
//           text={msg.messageText}
//           direction={isOutgoing ? 'outgoing' : 'incoming'}
//           timestamp={new Date(msg.createdAt).toLocaleTimeString([], {
//             hour: '2-digit',
//             minute: '2-digit',
//           })}
//           type={'text'}
//           avatarUrl={!isOutgoing ? partnerAvatarUrl : undefined}
//           showAvatar={showAvatar}
//           isRead={isOutgoing && msg.status === MessageStatus.READ}
//         />
//       )
//     })
// =======
//   currentUserId: number
//   messages?: MessageViewModel[]
//   partnerAvatarUrl?: string
//   onSend?: (message: string) => void
//   sendDisabled?: boolean
//   error?: string | null
//   isLoading?: boolean
// }

// const getBubbleType = (type: MessageType) => {
//   if (type === MessageType.IMAGE) {
//     return 'image'
//   }

//   if (type === MessageType.VOICE) {
//     return 'voice'
//   }

//   return 'text'
// }

// const formatTime = (value: string) =>
//   new Intl.DateTimeFormat('en', {
//     hour: '2-digit',
//     minute: '2-digit',
//   }).format(new Date(value))

// export const ChatWindow: React.FC<ChatWindowProps> = ({
//   currentUserId,
//   messages,
//   partnerAvatarUrl,
//   onSend,
//   sendDisabled,
//   error,
//   isLoading = false,
// }) => {
//   const [text, setText] = useState('')
//   const handleSend = () => {
//     const message = text.trim()

//     if (!message || !onSend) {
//       return
//     }

//     onSend(message)
//     setText('')
// >>>>>>> origin/messenger-media-contract-alignment
//   }

//   return (
//     <div className={styles.container}>
// <<<<<<< HEAD
//       <div className={styles.messagesArea}>{renderMessages()}</div>

//       <MessageComposer
//         value={draftText}
//         onChange={setDraftText}
//         onSend={handleSend}
//         pending={isSending}
//         error={sendError}
// =======
//       <LinearProgress active={isLoading} />
//       {/* Messages Area */}
//       <div className={styles.messagesArea}>
//         {[...(messages || [])].reverse().map((message, index, array) => {
//           const isIncoming = message.ownerId !== currentUserId
//           const prevMsg = array[index - 1]
//           const isPrevIncoming = prevMsg && prevMsg.ownerId !== currentUserId
//           const showAvatar = isIncoming && !isPrevIncoming

//           return (
//             <MessageBubble
//               key={message.id}
//               text={message.messageText ?? ''}
//               direction={isIncoming ? 'incoming' : 'outgoing'}
//               timestamp={formatTime(message.createdAt)}
//               type={getBubbleType(message.messageType)}
//               url={message.mediaContent?.fileUrl}
//               avatarUrl={partnerAvatarUrl}
//               showAvatar={showAvatar}
//               isRead={message.status === MessageStatus.READ}
//             />
//           )
//         })}
//       </div>

//       {/* Message Composer */}
//       <MessageComposer
//         value={text}
//         onChange={setText}
//         onSend={handleSend}
//         disabled={!onSend || sendDisabled}
//         error={error}
// >>>>>>> origin/messenger-media-contract-alignment
//       />
//     </div>
//   )
// }

'use client'

import React from 'react'

import { LinearProgress } from '@/shared/composites'

import styles from './ChatWindow.module.scss'

import { MessageStatus, MessageType, type MessageViewModel } from '../model/messenger.types'
import { useMessengerCenter } from '../model/useMessengerCenter'
import { MessageBubble } from './MessageBubble'
import { MessageComposer } from './MessageComposer'

interface ChatWindowProps {
  dialoguePartnerId: number
  partnerName: string
  partnerAvatarUrl?: string
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

const formatTime = (value: string) =>
  new Intl.DateTimeFormat('en', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value))

export const ChatWindow: React.FC<ChatWindowProps> = ({
  dialoguePartnerId,
  partnerName,
  partnerAvatarUrl,
}) => {
  const {
    messages,
    isFetching,
    draftText,
    setDraftText,
    sendTextMessage,
    isSending,
    sendError,
    currentUserId,
  } = useMessengerCenter(dialoguePartnerId, {
    userName: partnerName,
    avatarUrl: partnerAvatarUrl,
  })

  const handleSend = () => {
    sendTextMessage(draftText, dialoguePartnerId)
  }

  return (
    <div className={styles.container}>
      <LinearProgress active={isFetching} />

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

      <MessageComposer
        value={draftText}
        onChange={setDraftText}
        onSend={handleSend}
        pending={isSending}
        error={sendError}
      />
    </div>
  )
}
