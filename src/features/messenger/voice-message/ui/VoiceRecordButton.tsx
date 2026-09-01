import { Button } from '@ictroot/ui-kit'
import { MicOutline } from '@ictroot/ui-kit/icons'
import { useTranslations } from 'next-intl'

import styles from './VoiceMessageComposer.module.scss'

interface VoiceRecordButtonProps {
  disabled?: boolean
  onClick: () => void
}

export function VoiceRecordButton({ disabled, onClick }: VoiceRecordButtonProps) {
  const t = useTranslations('messenger.voice')

  return (
    <Button
      type={'button'}
      variant={'text'}
      className={styles.iconButton}
      disabled={disabled}
      onClick={onClick}
      aria-label={t('record')}
    >
      <MicOutline size={24} />
    </Button>
  )
}
