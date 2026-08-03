'use client'

import { Checkmark, DoneAll } from '@ictroot/ui-kit/icons'
import { useTranslations } from 'next-intl'

import styles from './VoiceMessageBody.module.scss'

import { VoiceMessagePlayer } from './VoiceMessagePlayer'

interface VoiceMessageBodyProps {
  source: string
  timestamp: string
  isIncoming: boolean
  isRead?: boolean
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
  isRead,
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
            {!isIncoming && (
              <span className={styles.statusIcon}>{isRead ? <DoneAll /> : <Checkmark />}</span>
            )}
          </span>
        }
      />
    </div>
  )
}
