import React from 'react'

import { AccountTypeSection } from '@/features/subscriptions/ui/AccountTypeSection/AccountTypeSection'

import {
  AccountTypeValue,
  SubscriptionPlanValue,
  UISubscriptionPlan,
} from '../../model/payments.types'
import { SubscriptionPricing } from '../SubscriptionPricing'

interface BusinessSubscriptionViewProps {
  accountType: AccountTypeValue
  onAccountTypeChange: (type: AccountTypeValue) => void
  plans: UISubscriptionPlan[]
  selectedPlan?: SubscriptionPlanValue
  onPlanChange?: (plan: SubscriptionPlanValue) => void
  onPayPalClick?: () => void
  onStripeClick?: () => void
  isPaymentLocked?: boolean
  hasActiveSubscription?: boolean
}

export const BusinessSubscriptionView: React.FC<BusinessSubscriptionViewProps> = ({
  accountType,
  onAccountTypeChange,
  plans,
  selectedPlan,
  onPlanChange,
  onPayPalClick,
  onStripeClick,
  isPaymentLocked = false,
  hasActiveSubscription = false,
}) => {
  return (
    <div>
      <SubscriptionPricing
        plans={plans}
        selectedPlan={selectedPlan}
        onPlanChange={onPlanChange}
        onPayPalClick={onPayPalClick}
        onStripeClick={onStripeClick}
        isPaymentLocked={isPaymentLocked}
        accountTypeSlot={
          <AccountTypeSection
            accountTypes={[
              { value: 'personal', label: 'Personal', disabled: hasActiveSubscription },
              { value: 'business', label: 'Business' },
            ]}
            selectedType={accountType}
            onTypeChange={onAccountTypeChange}
          />
        }
      />
    </div>
  )
}
