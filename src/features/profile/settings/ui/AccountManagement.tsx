'use client'

import { useMemo, useState } from 'react'

import { useCurrentSubscription } from '@/features/subscriptions/model/hooks/useCurrentSubscription'
import { usePricing } from '@/features/subscriptions/model/hooks/usePricing'
import { resolveAccountManagementView } from '@/features/subscriptions/model/resolvers/accountManagementResolver'
import { BusinessActiveSubscriptionView } from '@/features/subscriptions/ui/BusinessActiveSubscriptionView/BusinessActiveSubscriptionView'
import { BusinessNoSubscriptionView } from '@/features/subscriptions/ui/BusinessNoSubscriptionView/BusinessNoSubscriptionView'
import { PersonalView } from '@/features/subscriptions/ui/PersonalView/PersonalView'

import styles from './AccountManagement.module.scss'

import { AccountTypeValue, SubscriptionPlanValue, mapSubscriptionToUI } from '../model/types'
import { AccountTypeSection } from './AccountManagement/AccountTypeSection/AccountTypeSection'

export const AccountManagement = () => {
  const [selectedAccountType, setSelectedAccountType] = useState<AccountTypeValue>('personal')
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlanValue>('month')
  const [isPaymentLocked, setIsPaymentLocked] = useState(false)

  const { subscriptions, isLoading: subLoading } = useCurrentSubscription()
  const { plans, isLoading: plansLoading } = usePricing()

  const accountTypes = useMemo(
    () => [
      { value: 'personal' as AccountTypeValue, label: 'Personal' },
      { value: 'business' as AccountTypeValue, label: 'Business' },
    ],
    []
  )

  const activeSubscription = useMemo(() => subscriptions.find(s => s.isActive), [subscriptions])

  // Маппим в UI тип для PersonalView
  const uiSubscription = useMemo(
    () => activeSubscription ? mapSubscriptionToUI(activeSubscription) : undefined,
    [activeSubscription]
  )

  const view = resolveAccountManagementView({
    accountType: selectedAccountType,
    hasActiveSubscription: !!activeSubscription,
  })

  const isLoading = subLoading || plansLoading

  const handlePayPalClick = () => {
    console.log('PayPal clicked with plan:', selectedPlan)
  }

  const handleStripeClick = () => {
    console.log('Stripe clicked with plan:', selectedPlan)
  }

  const handlePlanChange = (plan: SubscriptionPlanValue) => {
    setSelectedPlan(plan)
  }

  if (isLoading) {
    return <div className={styles.loading}>Загрузка...</div>
  }

  const renderView = () => {
    switch (view) {
      case 'personal':
        return <PersonalView subscription={uiSubscription} />

      case 'business-no-subscription':
        return (
          <BusinessNoSubscriptionView
            plans={plans}
            selectedPlan={selectedPlan}
            onPlanChange={handlePlanChange}
            onPayPalClick={handlePayPalClick}
            onStripeClick={handleStripeClick}
            isPaymentLocked={isPaymentLocked}
          />
        )

      case 'business-active-subscription':
        return (
          <BusinessActiveSubscriptionView
            subscription={activeSubscription!}
            plans={plans}
            selectedPlan={selectedPlan}
            onPlanChange={handlePlanChange}
            onPayPalClick={handlePayPalClick}
            onStripeClick={handleStripeClick}
            isPaymentLocked={isPaymentLocked}
          />
        )

      default:
        return null
    }
  }

  return (
    <div className={styles.accountManagementPage}>
      <AccountTypeSection
        accountTypes={accountTypes}
        selectedType={selectedAccountType}
        onTypeChange={setSelectedAccountType}
      />

      {renderView()}
    </div>
  )
}