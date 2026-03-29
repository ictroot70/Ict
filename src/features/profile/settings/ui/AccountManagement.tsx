'use client'

import { useMemo, useState } from 'react'

import { useCurrentSubscription } from '@/features/subscriptions/model/hooks/useCurrentSubscription'
import { usePricing } from '@/features/subscriptions/model/hooks/usePricing'
import { resolveAccountManagementView } from '@/features/subscriptions/model/resolvers/accountManagementResolver'
import { PersonalView } from '@/features/subscriptions/ui/PersonalView/PersonalView'

import styles from './AccountManagement.module.scss'

import { BusinessNoSubscriptionView } from '@/features/subscriptions/ui/BusinessNoSubscriptionView/BusinessNoSubscriptionView'
import { BusinessActiveSubscriptionView } from '@/features/subscriptions/ui/BusinessActiveSubscriptionView/BusinessActiveSubscriptionView'

import { AccountTypeValue, mapSubscriptionToUI, SubscriptionPlanValue, UISubscription } from '../model/types'
import { AccountTypeSection } from './AccountManagement/AccountTypeSection/AccountTypeSection'

export const AccountManagement = () => {
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlanValue>('month')
  const [isPaymentLocked, setIsPaymentLocked] = useState(false)

  // ✅ 1. Добавляем state для выбранного типа аккаунта (реагирует на клики)
  const [selectedAccountType, setSelectedAccountType] = useState<AccountTypeValue>('personal')

  const { subscriptions, isLoading: subLoading } = useCurrentSubscription()
  const { plans, isLoading: plansLoading } = usePricing()

  const accountTypes = useMemo(
    () => [
      { value: 'personal' as AccountTypeValue, label: 'Personal' },
      { value: 'business' as AccountTypeValue, label: 'Business' },
    ],
    []
  )

  const activeSubscription = useMemo(
    () => subscriptions.find(s => s.isActive),
    [subscriptions]
  )

  // ✅ 2. accountType из API — для синхронизации с бэкендом
  const apiAccountType: AccountTypeValue = activeSubscription ? 'business' : 'personal'

  // ✅ 3. Синхронизируем selectedAccountType с API при загрузке
  useMemo(() => {
    setSelectedAccountType(apiAccountType)
  }, [apiAccountType])

  const uiSubscription: UISubscription | undefined = useMemo(
    () => activeSubscription ? mapSubscriptionToUI(activeSubscription) : undefined,
    [activeSubscription]
  )

  // ✅ 4. Resolver использует selectedAccountType (реагирует на клики!)
  const view = resolveAccountManagementView({
    accountType: selectedAccountType,  // ← из state, не из API!
    hasActiveSubscription: !!activeSubscription,
  })

  const isLoading = subLoading || plansLoading

  const handlePayPalClick = () => {
    // TODO: T2 - реализовать платежный флоу
  }

  const handleStripeClick = () => {
    // TODO: T2 - реализовать платежный флоу
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
            subscription={uiSubscription}
          />
        )

      default:
        return null
    }
  }

  return (
    <div className={styles.accountManagementPage}>
      {/* ✅ 5. AccountTypeSection теперь реагирует на клики */}
      <AccountTypeSection
        accountTypes={accountTypes}
        selectedType={selectedAccountType}  // ← из state
        onTypeChange={setSelectedAccountType}  // ← обновляем state при клике!
      />

      {renderView()}
    </div>
  )
}