'use client'

import { VoiceMessagePlayer } from '@/entities/messenger/ui/VoiceMessagePlayer'
import { Button } from '@ictroot/ui-kit'
import { Close } from '@ictroot/ui-kit/icons'
import { useTranslations } from 'next-intl'

import styles from './VoiceMessageComposer.module.scss'

interface VoicePreviewProps {
  source: string
  recordedDuration: number
  waveform: readonly number[]
  onDelete: () => void
  onSend: () => void
}

export function VoicePreview({
  source,
  recordedDuration,
  waveform,
  onDelete,
  onSend,
}: VoicePreviewProps) {
  const t = useTranslations('messenger.voice')

  return (
    <div className={styles.panel}>
      <Button
        type={'button'}
        variant={'text'}
        className={styles.iconButton}
        onClick={onDelete}
        aria-label={t('delete')}
      >
        <Close size={24} />
      </Button>
      <VoiceMessagePlayer
        source={source}
        waveform={waveform}
        fallbackDuration={recordedDuration}
        variant={'composer'}
        playLabel={t('play')}
        pauseLabel={t('pause')}
        afterWaveformSlot={<span className={styles.recordingDot} />}
      />
      <Button type={'button'} variant={'text'} className={styles.sendButton} onClick={onSend}>
        {t('send')}
      </Button>
    </div>
  )
}
