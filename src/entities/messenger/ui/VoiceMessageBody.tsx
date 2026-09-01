'use client'

import { MessageStatus } from '@/entities/messenger/model'
import { useTranslations } from 'next-intl'

import styles from './VoiceMessageBody.module.scss'

import { MessageDeliveryStatus } from './MessageDeliveryStatus'
import { VoiceMessagePlayer } from './VoiceMessagePlayer'

interface VoiceMessageBodyProps {
  source: string
  timestamp: string
  isIncoming: boolean
  status?: MessageStatus
  waveform?: readonly number[]
  isPlaybackRequested?: boolean
  onPlaybackEnded?: () => void
  onPlaybackPause?: () => void
  onPlaybackStart?: () => void
}

export function VoiceMessageBody({
  source,
  timestamp,
  isIncoming,
  status,
  waveform,
  isPlaybackRequested,
  onPlaybackEnded,
  onPlaybackPause,
  onPlaybackStart,
}: VoiceMessageBodyProps) {
  const t = useTranslations('messenger.voice')

  return (
    <div className={styles.content}>
      <VoiceMessagePlayer
        source={source}
        waveform={waveform}
        isPlaybackRequested={isPlaybackRequested}
        onPlaybackEnded={onPlaybackEnded}
        onPlaybackPause={onPlaybackPause}
        onPlaybackStart={onPlaybackStart}
        playLabel={t('playMessage')}
        pauseLabel={t('pauseMessage')}
        afterTimeSlot={
          <span className={styles.delivery}>
            <span>{timestamp}</span>
            {!isIncoming && status && <MessageDeliveryStatus status={status} />}
          </span>
        }
      />
    </div>
  )
}
