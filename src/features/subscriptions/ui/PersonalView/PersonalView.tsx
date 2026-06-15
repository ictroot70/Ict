import React from 'react'

import { AccountTypeSection } from '@/features/subscriptions/ui/AccountTypeSection/AccountTypeSection'

import { AccountTypeValue } from '../../model/types'

interface PersonalViewProps {
  accountType: AccountTypeValue
  onAccountTypeChange: (type: AccountTypeValue) => void
  disabled?: boolean
}

export const PersonalView: React.FC<PersonalViewProps> = ({
  accountType,
  onAccountTypeChange,
  disabled,
}) => (
  <AccountTypeSection
    accountTypes={[
      { value: 'personal', label: 'Personal' },
      { value: 'business', label: 'Business' },
    ]}
    selectedType={accountType}
    onTypeChange={onAccountTypeChange}
    disabled={disabled}
  />
)
