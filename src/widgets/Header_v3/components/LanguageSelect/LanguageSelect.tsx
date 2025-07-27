import { RussiaFlag, Select, UkFlag } from '@/shared/ui'
import s from '../../Header_v3.module.scss'

export const LanguageSelect = () => (
  <div className={s.languageSelect}>
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
