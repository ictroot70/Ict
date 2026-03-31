'use client'
import { useMemo, useState, useEffect } from 'react'
import { useCurrentSubscription } from '@/features/subscriptions/model/hooks/useCurrentSubscription'
import { usePricing } from '@/features/subscriptions/model/hooks/usePricing'
import { resolveAccountManagementView } from '@/features/subscriptions/model/resolvers/accountManagementResolver'
import { AccountTypeSection } from './AccountManagement/AccountTypeSection/AccountTypeSection'
import { SubscriptionSection } from './AccountManagement/SubscriptionSection/SubscriptionSection'
import styles from './AccountManagement.module.scss'
import {
  AccountTypeValue,
  mapSubscriptionToUI,
  SubscriptionPlanValue,
  UISubscription,
  UISubscriptionPlan
} from '../model/types'
import { SubscriptionPricing } from '@/features/subscriptions'

const MOCK_MODE = true

export const AccountManagement = () => {
  const [selectedAccountType, setSelectedAccountType] = useState<AccountTypeValue>('business')
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlanValue>('month')
  const [isPaymentLocked, setIsPaymentLocked] = useState(false)

  const { subscriptions: apiSubscriptions, isLoading: subLoading } = useCurrentSubscription()
  const { plans: apiPlans, isLoading: plansLoading } = usePricing()

  const subscriptions = useMemo(() => {
    if (MOCK_MODE) {
      return [{
        id: 'sub_123',
        expireDate: '2026-05-30',
        nextPaymentDate: '2026-04-30',
        isActive: true,
        autoRenewal: true,
      }]
    }
    return apiSubscriptions || []
  }, [MOCK_MODE, apiSubscriptions])

  const plans = useMemo(() => {
    if (MOCK_MODE) {
      return [
        { id: 'day', value: '1day', label: '$10 per 1 Day', price: '9.99', period: 'day' },
        { id: 'week', value: '7day', label: '$50 per 7 Day', price: '49.99', period: 'week' },
        { id: 'month', value: 'month', label: '$100 per month', price: '199.99', period: 'month' },
      ] as UISubscriptionPlan[]
    }
    return (apiPlans as UISubscriptionPlan[]) || []
  }, [MOCK_MODE, apiPlans])

  const activeSubscription = useMemo(
    () => subscriptions.find(s => s.isActive),
    [subscriptions]
  )

  const accountType: AccountTypeValue = MOCK_MODE
    ? selectedAccountType
    : (activeSubscription ? 'business' : selectedAccountType)

  const uiSubscription: UISubscription | undefined = useMemo(
    () => activeSubscription ? mapSubscriptionToUI(activeSubscription) : undefined,
    [activeSubscription]
  )

  const view = resolveAccountManagementView({
    accountType,
    hasActiveSubscription: !!activeSubscription,
  })

  const isLoading = subLoading || plansLoading



  const handlePayPalClick = () => { /* TODO: T2 */ }
  const handleStripeClick = () => { /* TODO: T2 */ }
  const handlePlanChange = (plan: SubscriptionPlanValue) => {
    setSelectedPlan(plan)
  }

  const handleAccountTypeChange = (type: AccountTypeValue) => {
    if (!MOCK_MODE && activeSubscription && type === 'personal') {
      console.warn('Cannot switch to Personal while subscription is active (real data)')
      return
    }
    setSelectedAccountType(type)
  }

  if (isLoading) {
    return <div className={styles.loading}>Загрузка...</div>
  }

  return (
    <div className={styles.accountManagementPage}>

      {view === 'personal' ? (

        <AccountTypeSection
          accountTypes={[
            { value: 'personal', label: 'Personal' },
            { value: 'business', label: 'Business' },
          ]}
          selectedType={accountType}
          onTypeChange={handleAccountTypeChange}
        />

      ) : (

        <>
          {view === 'business-active-subscription' && uiSubscription && (
            <SubscriptionSection subscription={uiSubscription} />
          )}

          <AccountTypeSection
            accountTypes={[
              { value: 'personal', label: 'Personal' },
              { value: 'business', label: 'Business' },
            ]}
            selectedType={accountType}
            onTypeChange={handleAccountTypeChange}
          />

          <SubscriptionPricing
            plans={plans}
            selectedPlan={selectedPlan}
            onPlanChange={handlePlanChange}
            onPayPalClick={handlePayPalClick}
            onStripeClick={handleStripeClick}
            isPaymentLocked={isPaymentLocked}
          />
        </>

      )}
    </div>
  )
}