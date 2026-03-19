'use client'

import { useMemo, useState } from 'react'

import { useCurrentSubscription } from '@/features/subscriptions/model/hooks/useCurrentSubscription'
import { usePricing } from '@/features/subscriptions/model/hooks/usePricing'
import { resolveAccountManagementView } from '@/features/subscriptions/model/resolvers/accountManagementResolver'
import { BusinessActiveSubscriptionView } from '@/features/subscriptions/ui/BusinessActiveSubscriptionView/BusinessActiveSubscriptionView'
import { BusinessNoSubscriptionView } from '@/features/subscriptions/ui/BusinessNoSubscriptionView/BusinessNoSubscriptionView'

import styles from './AccountManagement.module.scss'

import { AccountTypeValue } from '../model/types'
import { AccountTypeSection } from './AccountManagement/AccountTypeSection/AccountTypeSection'
import { SubscriptionSection } from './AccountManagement/SubscriptionSection/SubscriptionSection'

export const AccountManagement = () => {
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

  const activeSubscription = useMemo(() => subscriptions.find(s => s.isActive), [subscriptions])

  const view = resolveAccountManagementView({
    accountType: selectedAccountType,
    hasActiveSubscription: !!activeSubscription,
  })

  const isLoading = subLoading || plansLoading

  if (isLoading) {
    return <div className={styles.loading}>Loading...</div>
  }

  return (
    <div className={styles.accountManagementPage}>
      <SubscriptionSection subscription={activeSubscription} />

      <AccountTypeSection
        accountTypes={accountTypes}
        selectedType={selectedAccountType}
        onTypeChange={setSelectedAccountType}
      />

      {view === 'business-no-subscription' && <BusinessNoSubscriptionView plans={plans} />}

      {view === 'business-active-subscription' && activeSubscription && (
        <BusinessActiveSubscriptionView subscription={activeSubscription} plans={plans} />
      )}
    </div>
  )
}
