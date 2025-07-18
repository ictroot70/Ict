import { RussiaFlag, Select, UkFlag } from '@/shared/ui'
import styles from '../../AppHeader.module.scss'

export const LanguageSelect = () => (
  <div className={styles.languageSelect}>
    <Select
      defaultValue="en"
      placeholder="Select..."
      items={[
        { value: 'en', label: 'English', icon: <UkFlag /> },
        { value: 'rus', label: 'Russian', icon: <RussiaFlag /> },
      ]}
      onValueChange={() => {}}
    />
  </div>
)
