'use client'
import { useMemo, useState } from 'react'

import { useCurrentSubscription } from '@/features/subscriptions/model/hooks/useCurrentSubscription'
import { usePricing } from '@/features/subscriptions/model/hooks/usePricing'
import { resolveAccountManagementView } from '@/features/subscriptions/model/resolvers/accountManagementResolver'
import {
  AccountTypeValue,
  mapSubscriptionToUI,
  SubscriptionPlanValue,
  UISubscription,
} from '@/features/subscriptions/model/types'
import { BusinessActiveSubscriptionView } from '@/features/subscriptions/ui/BusinessActiveSubscriptionView/BusinessActiveSubscriptionView'
import { BusinessNoSubscriptionView } from '@/features/subscriptions/ui/BusinessNoSubscriptionView/BusinessNoSubscriptionView'
import { PersonalView } from '@/features/subscriptions/ui/PersonalView/PersonalView'

import styles from './AccountManagement.module.scss'

export const AccountManagement = () => {
  const [selectedAccountType, setSelectedAccountType] = useState<AccountTypeValue>('personal')
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlanValue>('month')
  const [isPaymentLocked, setIsPaymentLocked] = useState(false)

  const { subscriptions: apiSubscriptions, isLoading: subLoading } = useCurrentSubscription()
  const { plans: apiPlans, isLoading: plansLoading } = usePricing()

  const subscriptions = apiSubscriptions || []
  const plans = apiPlans || []

  const activeSubscription = useMemo(() => subscriptions.find(s => s.isActive), [subscriptions])

  const accountType: AccountTypeValue = activeSubscription?.isActive
    ? 'business'
    : selectedAccountType

  const uiSubscription: UISubscription | undefined = useMemo(
    () => (activeSubscription ? mapSubscriptionToUI(activeSubscription) : undefined),
    [activeSubscription]
  )

  const view = resolveAccountManagementView({
    accountType,
    hasActiveSubscription: !!activeSubscription,
  })

  const isLoading = subLoading || plansLoading

  const handlePayPalClick = () => {
    setIsPaymentLocked(true)
  }

  const handleStripeClick = () => {
    setIsPaymentLocked(true)
  }

  const handlePlanChange = (plan: SubscriptionPlanValue) => {
    setSelectedPlan(plan)
  }

  const handleAccountTypeChange = (type: AccountTypeValue) => {
    if (activeSubscription && type === 'personal') {
      return
    }
    setSelectedAccountType(type)
  }

  if (isLoading) {
    return <div className={styles.loading}>Загрузка...</div>
  }

  switch (view) {
    case 'personal':
      return (
        <div className={styles.accountManagementPage}>
          <PersonalView accountType={accountType} onAccountTypeChange={handleAccountTypeChange} />
        </div>
      )

    case 'business-no-subscription':
      return (
        <div className={styles.accountManagementPage}>
          <BusinessNoSubscriptionView
            accountType={accountType}
            onAccountTypeChange={handleAccountTypeChange}
            plans={plans}
            selectedPlan={selectedPlan}
            onPlanChange={handlePlanChange}
            onPayPalClick={handlePayPalClick}
            onStripeClick={handleStripeClick}
            isPaymentLocked={isPaymentLocked}
          />
        </div>
      )

    case 'business-active-subscription':
      return (
        <div className={styles.accountManagementPage}>
          <BusinessActiveSubscriptionView
            subscription={uiSubscription}
            accountType={accountType}
            onAccountTypeChange={handleAccountTypeChange}
            plans={plans}
            selectedPlan={selectedPlan}
            onPlanChange={handlePlanChange}
            onPayPalClick={handlePayPalClick}
            onStripeClick={handleStripeClick}
            isPaymentLocked={isPaymentLocked}
          />
        </div>
      )

    default:
      return null
  }
}
