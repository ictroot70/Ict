// 'use client'
// import { useMemo, useState } from 'react'
// import { useCurrentSubscription } from '@/features/subscriptions/model/hooks/useCurrentSubscription'
// import { usePricing } from '@/features/subscriptions/model/hooks/usePricing'
// import { resolveAccountManagementView } from '@/features/subscriptions/model/resolvers/accountManagementResolver'

// import styles from './AccountManagement.module.scss'

// import {
//   AccountTypeValue,
//   mapSubscriptionToUI,
//   SubscriptionPlanValue,
//   UISubscription,
// } from '../model/types'

// import { AccountTypeSection } from './AccountManagement/AccountTypeSection/AccountTypeSection'
// import { SubscriptionSection } from './AccountManagement/SubscriptionSection/SubscriptionSection'
// import { SubscriptionPricing } from '@/features/subscriptions'

// export const AccountManagement = () => {
//   const [selectedAccountType, setSelectedAccountType] = useState<AccountTypeValue>('personal')
//   const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlanValue>('month')
//   const [isPaymentLocked, setIsPaymentLocked] = useState(false)

//   const { subscriptions: apiSubscriptions, isLoading: subLoading } = useCurrentSubscription()
//   const { plans: apiPlans, isLoading: plansLoading } = usePricing()

//   const subscriptions = apiSubscriptions || []
//   const plans = apiPlans || []

//   const activeSubscription = useMemo(
//     () => subscriptions.find((s) => s.isActive),
//     [subscriptions]
//   )

//   const accountType: AccountTypeValue = activeSubscription?.isActive
//     ? 'business'
//     : selectedAccountType

//   const uiSubscription: UISubscription | undefined = useMemo(
//     () => (activeSubscription ? mapSubscriptionToUI(activeSubscription) : undefined),
//     [activeSubscription]
//   )

//   const view = resolveAccountManagementView({
//     accountType,
//     hasActiveSubscription: !!activeSubscription,
//   })

//   const isLoading = subLoading || plansLoading

//   const handlePayPalClick = () => { /* TODO: T2 */ }
//   const handleStripeClick = () => { /* TODO: T2 */ }

//   const handlePlanChange = (plan: SubscriptionPlanValue) => {
//     setSelectedPlan(plan)
//   }

//   const handleAccountTypeChange = (type: AccountTypeValue) => {
//     if (activeSubscription && type === 'personal') return
//     setSelectedAccountType(type)
//   }

//   if (isLoading) {
//     return <div className={styles.loading}>Загрузка...</div>
//   }

//   return (
//     <div className={styles.accountManagementPage}>

//       <AccountTypeSection
//         accountTypes={[
//           { value: 'personal', label: 'Personal' },
//           { value: 'business', label: 'Business' },
//         ]}
//         selectedType={accountType}
//         onTypeChange={handleAccountTypeChange}
//       />

//       {view === 'personal' ? (
//         <></>

//       ) : (

//         <>
//           {view === 'business-active-subscription' && uiSubscription && (
//             <SubscriptionSection subscription={uiSubscription} />
//           )}

//           <SubscriptionPricing
//             plans={plans}
//             selectedPlan={selectedPlan}
//             onPlanChange={handlePlanChange}
//             onPayPalClick={handlePayPalClick}
//             onStripeClick={handleStripeClick}
//             isPaymentLocked={isPaymentLocked}
//           />
//         </>

//       )}
//     </div>
//   )
// }


'use client'
import { useMemo, useState } from 'react'
import { useCurrentSubscription } from '@/features/subscriptions/model/hooks/useCurrentSubscription'
import { usePricing } from '@/features/subscriptions/model/hooks/usePricing'
import { resolveAccountManagementView } from '@/features/subscriptions/model/resolvers/accountManagementResolver'
import { PersonalView } from '@/features/subscriptions/ui/PersonalView/PersonalView'
import { BusinessNoSubscriptionView } from '@/features/subscriptions/ui/BusinessNoSubscriptionView/BusinessNoSubscriptionView'
import { BusinessActiveSubscriptionView } from '@/features/subscriptions/ui/BusinessActiveSubscriptionView/BusinessActiveSubscriptionView'

import styles from './AccountManagement.module.scss'
import {
  AccountTypeValue,
  mapSubscriptionToUI,
  SubscriptionPlanValue,
  UISubscription,
} from '../model/types'

export const AccountManagement = () => {
  const [selectedAccountType, setSelectedAccountType] = useState<AccountTypeValue>('personal')
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlanValue>('month')
  const [isPaymentLocked, setIsPaymentLocked] = useState(false)

  const { subscriptions: apiSubscriptions, isLoading: subLoading } = useCurrentSubscription()
  const { plans: apiPlans, isLoading: plansLoading } = usePricing()

  const subscriptions = apiSubscriptions || []
  const plans = apiPlans || []

  const activeSubscription = useMemo(
    () => subscriptions.find((s) => s.isActive),
    [subscriptions]
  )

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
    // TODO: T2 - вызвать createSubscriptionMutation с paymentType='PAYPAL'
    setIsPaymentLocked(true)
    // try {
    //   await createSubscriptionMutation.mutateAsync({
    //     typeSubscription: selectedPlan,
    //     paymentType: 'PAYPAL',
    //     amount: ...,
    //     baseUrl: window.location.origin,
    //   })
    // } finally {
    //   setIsPaymentLocked(false)
    // }
  }

  const handleStripeClick = () => {
    setIsPaymentLocked(true)
  }

  const handlePlanChange = (plan: SubscriptionPlanValue) => {
    setSelectedPlan(plan)
  }

  const handleAccountTypeChange = (type: AccountTypeValue) => {
    if (activeSubscription && type === 'personal') return
    setSelectedAccountType(type)
  }

  if (isLoading) {
    return <div className={styles.loading}>Загрузка...</div>
  }

  switch (view) {
    case 'personal':
      return (
        <div className={styles.accountManagementPage}>
          <PersonalView
            accountType={accountType}
            onAccountTypeChange={handleAccountTypeChange}
          />
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