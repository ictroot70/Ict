import React from 'react'

import { AccountTypeSection } from '@/features/profile/settings/ui/AccountManagement/AccountTypeSection/AccountTypeSection'

import { AccountTypeValue } from '../../model/types'

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
