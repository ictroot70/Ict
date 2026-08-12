'use client'

import React, { useState, useMemo } from 'react'

import { Avatar } from '@/shared/composites'
import { Button, Typography } from '@ictroot/ui-kit'
import { Checkmark, DoneAll, PlayCircle, PauseCircle } from '@ictroot/ui-kit/icons'

import styles from './MessageBubble.module.scss'

interface MessageBubbleProps {
  text: string
  direction: 'incoming' | 'outgoing'
  timestamp: string
  type?: 'text' | 'image' | 'voice'
  url?: string
  avatarUrl?: string
  showAvatar?: boolean
  isRead?: boolean
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
  isRead,
  onImageClick,
}) => {
  const isIncoming = direction === 'incoming'
  const isImageOnly = type === 'image' && !text
  const isImageWithText = type === 'image' && text
  const [isPlaying, setIsPlaying] = useState(false)
  const waveformHeights = useMemo(() => [...Array(40)].map(() => Math.random() * 100), [])

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
          styles.bubble +
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
        {type === 'voice' && (
          <div className={styles.voiceContent}>
            <Button
              variant={'text'}
              className={styles.voiceButton}
              onClick={() => setIsPlaying(!isPlaying)}
            >
              {isPlaying ? (
                <PauseCircle className={styles.voiceIcon} size={40} />
              ) : (
                <PlayCircle className={styles.voiceIcon} size={40} />
              )}
            </Button>
            <div className={styles.voiceWaveform}>
              {waveformHeights.map((height, i) => (
                <div key={i} className={styles.waveformBar} style={{ height: `${height}%` }} />
              ))}
            </div>
            <div className={styles.voiceMeta}>
              <span className={styles.duration}>02:31</span>
            </div>
          </div>
        )}
        <div className={styles.footer}>
          <Typography variant={'small_text'} className={styles.timestamp}>
            {timestamp}
          </Typography>
          {!isIncoming && (
            <span className={styles.statusIcon}>{isRead ? <DoneAll /> : <Checkmark />}</span>
          )}
        </div>
      </div>
    </div>
  )
}
