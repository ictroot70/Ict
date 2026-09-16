import { useTranslations } from 'next-intl'

import styles from './VoiceMessageComposer.module.scss'

export function VoiceProcessingPanel() {
  const t = useTranslations('messenger.voice')

  return (
    <div className={styles.processing} role={'status'}>
      {t('processing')}
    </div>
  )
}
