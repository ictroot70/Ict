import React from 'react'

import { AccountTypeSection } from '@/features/profile/settings/ui/AccountManagement/AccountTypeSection/AccountTypeSection'
import { SubscriptionSection } from '@/features/profile/settings/ui/AccountManagement/SubscriptionSection/SubscriptionSection'

import {
  AccountTypeValue,
  SubscriptionPlanValue,
  UISubscription,
  UISubscriptionPlan,
} from '../../model/types'
import { SubscriptionPricing } from '../SubscriptionPricing'

interface BusinessActiveSubscriptionViewProps {
  subscription?: UISubscription
  accountType: AccountTypeValue
  onAccountTypeChange: (type: AccountTypeValue) => void
  plans: UISubscriptionPlan[]
  selectedPlan?: SubscriptionPlanValue
  onPlanChange?: (plan: SubscriptionPlanValue) => void
  onPayPalClick?: () => void
  onStripeClick?: () => void
  isPaymentLocked?: boolean
}

export const BusinessActiveSubscriptionView: React.FC<BusinessActiveSubscriptionViewProps> = ({
  subscription,
  accountType,
  onAccountTypeChange,
  plans,
  selectedPlan,
  onPlanChange,
  onPayPalClick,
  onStripeClick,
  isPaymentLocked = false,
}) => {
  return (
    <div>
      {subscription && <SubscriptionSection subscription={subscription} />}

      <AccountTypeSection
        accountTypes={[
          { value: 'personal', label: 'Personal' },
          { value: 'business', label: 'Business' },
        ]}
        selectedType={accountType}
        onTypeChange={onAccountTypeChange}
      />

      <SubscriptionPricing
        plans={plans}
        selectedPlan={selectedPlan}
        onPlanChange={onPlanChange}
        onPayPalClick={onPayPalClick}
        onStripeClick={onStripeClick}
        isPaymentLocked={isPaymentLocked}
      />
    </div>
  )
}
