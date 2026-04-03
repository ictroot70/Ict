import React from 'react'

import { Card, Typography } from '@/shared/ui'
import { RadioGroupRadix } from '@ictroot/ui-kit'

import styles from './AccountTypeSection.module.scss'

interface AccountTypeSectionProps {
  accountTypes: Array<{ value: 'personal' | 'business'; label: string }>
  selectedType: 'personal' | 'business'
  onTypeChange: (type: 'personal' | 'business') => void
}

export const AccountTypeSection: React.FC<AccountTypeSectionProps> = ({
  accountTypes,
  selectedType,
  onTypeChange,
}) => {
  const radioOptions = accountTypes.map(type => ({
    value: type.value,
    label: type.label,
    id: `account-type-${type.value}`,
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
            />
          </div>
        </Card>
      </div>
    </section>
  )
}
