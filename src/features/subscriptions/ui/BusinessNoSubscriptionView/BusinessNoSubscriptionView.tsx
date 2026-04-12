import React from 'react'

import { AccountTypeSection } from '@/features/subscriptions/ui/AccountTypeSection/AccountTypeSection'

import styles from './BusinessNoSubscriptionView.module.scss'

import { AccountTypeValue, SubscriptionPlanValue, UISubscriptionPlan } from '../../model/types'
import { SubscriptionPricing } from '../SubscriptionPricing'

interface BusinessNoSubscriptionViewProps {
  accountType: AccountTypeValue
  onAccountTypeChange: (type: AccountTypeValue) => void
  plans: UISubscriptionPlan[]
  selectedPlan?: SubscriptionPlanValue
  onPlanChange?: (plan: SubscriptionPlanValue) => void
  onPayPalClick?: () => void
  onStripeClick?: () => void
  isPaymentLocked?: boolean
}

export const BusinessNoSubscriptionView: React.FC<BusinessNoSubscriptionViewProps> = ({
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
    <div className={styles.container}>
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
