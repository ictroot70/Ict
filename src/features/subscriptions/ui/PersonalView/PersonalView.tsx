import React from 'react'

import { AccountTypeValue } from '@/features/profile/settings/model/types'
import { AccountTypeSection } from '@/features/profile/settings/ui/AccountManagement/AccountTypeSection/AccountTypeSection'
import { Card, Typography } from '@/shared/ui'

import styles from './PersonalView.module.scss'

interface PersonalViewProps {
  accountType: AccountTypeValue
  onAccountTypeChange: (type: AccountTypeValue) => void
}

export const PersonalView: React.FC<PersonalViewProps> = ({ accountType, onAccountTypeChange }) => {
  return (
    <>
      <AccountTypeSection
        accountTypes={[
          { value: 'personal', label: 'Personal' },
          { value: 'business', label: 'Business' },
        ]}
        selectedType={accountType}
        onTypeChange={onAccountTypeChange}
      />

      <div className={styles.personalView}>
        <Card className={styles.infoCard}>
          <Typography variant={'h3'} className={styles.title}>
            Personal Account
          </Typography>
          <Typography variant={'regular_16'} className={styles.description}>
            You are currently using a free Personal account. Upgrade to Business to unlock advanced
            features.
          </Typography>
        </Card>
      </div>
    </>
  )
}
