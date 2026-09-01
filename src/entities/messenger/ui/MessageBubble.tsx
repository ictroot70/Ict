'use client'

import React from 'react'

import { MessageStatus } from '@/entities/messenger/model'
import { Avatar } from '@/shared/composites'
import { Typography } from '@ictroot/ui-kit'

import styles from './MessageBubble.module.scss'

import { MessageDeliveryStatus } from './MessageDeliveryStatus'
import { VoiceMessageBody } from './VoiceMessageBody'

interface MessageBubbleProps {
  text: string
  direction: 'incoming' | 'outgoing'
  timestamp: string
  type?: 'text' | 'image' | 'voice'
  url?: string
  avatarUrl?: string
  showAvatar?: boolean
  status?: MessageStatus
  voiceWaveform?: readonly number[]
  isVoicePlaybackRequested?: boolean
  onVoicePlaybackEnded?: () => void
  onVoicePlaybackPause?: () => void
  onVoicePlaybackStart?: () => void
  onImageClick?: (url: string) => void
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({
  text,
  direction,
  timestamp,
  type = 'text',
  url,
  avatarUrl,
  showAvatar,
  status,
  voiceWaveform,
  isVoicePlaybackRequested,
  onVoicePlaybackEnded,
  onVoicePlaybackPause,
  onVoicePlaybackStart,
  onImageClick,
}) => {
  const isIncoming = direction === 'incoming'
  const isImageOnly = type === 'image' && !text
  const isImageWithText = type === 'image' && text
  const isVoice = type === 'voice'

  return (
    <div
      className={styles.bubbleContainer + ' ' + (isIncoming ? styles.incoming : styles.outgoing)}
    >
      {isIncoming &&
        (showAvatar ? (
          <Avatar image={avatarUrl} alt={'Avatar'} size={36} className={styles.avatar} />
        ) : (
          <div className={styles.avatarSpacer} />
        ))}
      <div
        className={
          (isVoice ? styles.voiceBubble : styles.bubble) +
          ' ' +
          (isIncoming ? styles.incomingBubble : styles.outgoingBubble) +
          (isImageOnly ? ' ' + styles.imageOnly : '') +
          (isImageWithText ? ' ' + styles.imageWithText : '')
        }
      >
        {type === 'text' && <Typography variant={'regular_14'}>{text}</Typography>}
        {type === 'image' && (
          <div className={styles.image}>
            {url && (
              <button
                className={styles.imageButton}
                type={'button'}
                aria-label={'Open image preview'}
                onClick={() => onImageClick?.(url)}
              >
                <img src={url} alt={'Sent image'} className={styles.imageImg} />
              </button>
            )}
            {text && (
              <Typography variant={'regular_14'} className={styles.imageCaption}>
                {text}
              </Typography>
            )}
          </div>
        )}
        {isVoice && url && (
          <VoiceMessageBody
            source={url}
            timestamp={timestamp}
            isIncoming={isIncoming}
            status={status}
            waveform={voiceWaveform}
            isPlaybackRequested={isVoicePlaybackRequested}
            onPlaybackEnded={onVoicePlaybackEnded}
            onPlaybackPause={onVoicePlaybackPause}
            onPlaybackStart={onVoicePlaybackStart}
          />
        )}
        {!isVoice && (
          <div className={styles.footer}>
            <Typography variant={'small_text'} className={styles.timestamp}>
              {timestamp}
            </Typography>
            {!isIncoming && status && <MessageDeliveryStatus status={status} />}
          </div>
        )}
      </div>
    </div>
  )
}
