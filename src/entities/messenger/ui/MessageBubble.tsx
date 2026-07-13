import React from 'react'

import styles from './MessageBubble.module.scss'

interface MessageBubbleProps {
  text: string
  direction: 'incoming' | 'outgoing'
  timestamp: string
  type?: 'text' | 'image' | 'voice'
  url?: string
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({
  text,
  direction,
  timestamp,
  type = 'text',
  url,
}) => {
  const isIncoming = direction === 'incoming'

  return (
    <div
      className={styles.bubbleContainer + ' ' + (isIncoming ? styles.incoming : styles.outgoing)}
    >
      <div
        className={
          styles.bubble + ' ' + (isIncoming ? styles.incomingBubble : styles.outgoingBubble)
        }
      >
        {type === 'text' && <div className={'whitespace-pre-wrap'}>{text}</div>}
        {type === 'image' && (
          <div className={styles.image}>
            <img src={url} alt={'Sent image'} className={styles.imageImg} />
            <div className={'text-xs opacity-70'}>{text}</div>
          </div>
        )}
        {type === 'voice' && (
          <div className={styles.voiceContent}>
            <div className={styles.voiceIcon}>
              <span className={'text-xs'}>▶</span>
            </div>
            <div className={'text-sm'}>{text}</div>
          </div>
        )}
        <span className={styles.timestamp}>{timestamp}</span>
      </div>
    </div>
  )
}
