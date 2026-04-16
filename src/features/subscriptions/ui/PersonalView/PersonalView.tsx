import React from 'react'

import { AccountTypeSection } from '@/features/subscriptions/ui'

import { AccountTypeValue } from '../../model/payments.types'

interface PersonalViewProps {
  accountType: AccountTypeValue
  onAccountTypeChange: (type: AccountTypeValue) => void
  disabled?: boolean
}

export const PersonalView: React.FC<PersonalViewProps> = ({
  accountType,
  onAccountTypeChange,
  disabled,
}) => {
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
