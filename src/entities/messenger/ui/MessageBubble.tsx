'use client'

import React from 'react'

import { Avatar } from '@/shared/composites'
import { Typography } from '@ictroot/ui-kit'
import { Checkmark, DoneAll } from '@ictroot/ui-kit/icons'

import styles from './MessageBubble.module.scss'

import { VoiceMessageBody } from './VoiceMessageBody'

interface MessageBubbleProps {
  text: string
  direction: 'incoming' | 'outgoing'
  timestamp: string
  type?: 'text' | 'image' | 'voice'
  url?: string
  avatarUrl?: string
  showAvatar?: boolean
  isRead?: boolean
  voiceWaveform?: readonly number[]
  isVoicePlaybackRequested?: boolean
  onVoicePlaybackEnded?: () => void
  onVoicePlaybackPause?: () => void
  onVoicePlaybackStart?: () => void
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({
  text,
  direction,
  timestamp,
  type = 'text',
  url,
  avatarUrl,
  showAvatar,
  isRead,
  voiceWaveform,
  isVoicePlaybackRequested,
  onVoicePlaybackEnded,
  onVoicePlaybackPause,
  onVoicePlaybackStart,
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
        (avatarUrl && showAvatar ? (
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
            <img src={url} alt={'Sent image'} className={styles.imageImg} />
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
            isRead={isRead}
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
            {!isIncoming && (
              <span className={styles.statusIcon}>{isRead ? <DoneAll /> : <Checkmark />}</span>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
