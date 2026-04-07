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
    </>
  )
}
