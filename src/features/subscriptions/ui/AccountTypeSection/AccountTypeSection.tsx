import React from 'react'

import { Card, RadioGroupRadix, Typography } from '@/shared/ui'

import styles from './AccountTypeSection.module.scss'

interface AccountTypeSectionProps {
  accountTypes: Array<{ value: 'personal' | 'business'; label: string; disabled?: boolean }>
  selectedType: 'personal' | 'business'
  onTypeChange: (type: 'personal' | 'business') => void
  disabled?: boolean
}

export const AccountTypeSection: React.FC<AccountTypeSectionProps> = ({
  accountTypes,
  selectedType,
  onTypeChange,
  disabled,
}) => {
  const radioOptions = accountTypes.map(type => ({
    value: type.value,
    label: type.label,
    id: `account-type-${type.value}`,
    disabled: type.disabled,
  }))

  return (
    <section className={styles.section}>
      <Typography variant={'h3'} className={styles.section__title}>
        Account type:
      </Typography>
      <div className={styles.accountTypeList}>
        <Card className={styles.accountTypeCard}>
          <div className={styles.accountTypeCard__content}>
            <RadioGroupRadix
              label={'Account type'}
              value={selectedType}
              onValueChange={value => onTypeChange(value as 'personal' | 'business')}
              options={radioOptions}
              orientation={'vertical'}
              disabled={disabled}
            />
          </div>
        </Card>
      </div>
    </section>
  )
}
