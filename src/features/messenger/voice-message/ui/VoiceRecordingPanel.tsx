import { VoiceWaveform } from '@/entities/messenger/ui/VoiceWaveform'
import { formatMediaDuration } from '@/shared/lib'
import { Button } from '@ictroot/ui-kit'
import { Close, PauseCircle } from '@ictroot/ui-kit/icons'
import { useTranslations } from 'next-intl'

import styles from './VoiceMessageComposer.module.scss'

interface VoiceRecordingPanelProps {
  duration: number
  waveform: readonly number[]
  onCancel: () => void
  onStop: () => void
}

export function VoiceRecordingPanel({
  duration,
  waveform,
  onCancel,
  onStop,
}: VoiceRecordingPanelProps) {
  const t = useTranslations('messenger.voice')

  return (
    <div className={styles.panel}>
      <Button
        type={'button'}
        variant={'text'}
        className={styles.iconButton}
        onClick={onCancel}
        aria-label={t('cancel')}
      >
        <Close size={24} />
      </Button>
      <Button
        type={'button'}
        variant={'text'}
        className={styles.iconButton}
        onClick={onStop}
        aria-label={t('stop')}
      >
        <PauseCircle size={26} />
      </Button>
      <VoiceWaveform active barHeights={waveform} />
      <span className={styles.recordingDot} />
      <span className={styles.timer}>{formatMediaDuration(duration, true)}</span>
      <Button type={'button'} variant={'text'} className={styles.sendButton} onClick={onStop}>
        {t('review')}
      </Button>
    </div>
  )
}
