// 'use client'

// import { useMemo, useState } from 'react'

// import { useCurrentSubscription } from '@/features/subscriptions/model/hooks/useCurrentSubscription'
// import { usePricing } from '@/features/subscriptions/model/hooks/usePricing'
// import { resolveAccountManagementView } from '@/features/subscriptions/model/resolvers/accountManagementResolver'
// import { PersonalView } from '@/features/subscriptions/ui/PersonalView/PersonalView'

// import styles from './AccountManagement.module.scss'

// import { BusinessNoSubscriptionView } from '@/features/subscriptions/ui/BusinessNoSubscriptionView/BusinessNoSubscriptionView'
// import { BusinessActiveSubscriptionView } from '@/features/subscriptions/ui/BusinessActiveSubscriptionView/BusinessActiveSubscriptionView'

// import { AccountTypeValue, mapSubscriptionToUI, SubscriptionPlanValue, UISubscription } from '../model/types'
// import { AccountTypeSection } from './AccountManagement/AccountTypeSection/AccountTypeSection'

// export const AccountManagement = () => {
//   const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlanValue>('month')
//   const [isPaymentLocked, setIsPaymentLocked] = useState(false)

//   // ✅ 1. Добавляем state для выбранного типа аккаунта (реагирует на клики)
//   const [selectedAccountType, setSelectedAccountType] = useState<AccountTypeValue>('personal')

//   const { subscriptions, isLoading: subLoading } = useCurrentSubscription()
//   const { plans, isLoading: plansLoading } = usePricing()

//   const accountTypes = useMemo(
//     () => [
//       { value: 'personal' as AccountTypeValue, label: 'Personal' },
//       { value: 'business' as AccountTypeValue, label: 'Business' },
//     ],
//     []
//   )

//   const activeSubscription = useMemo(
//     () => subscriptions.find(s => s.isActive),
//     [subscriptions]
//   )

//   // ✅ 2. accountType из API — для синхронизации с бэкендом
//   const apiAccountType: AccountTypeValue = activeSubscription ? 'business' : 'personal'

//   // ✅ 3. Синхронизируем selectedAccountType с API при загрузке
//   useMemo(() => {
//     setSelectedAccountType(apiAccountType)
//   }, [apiAccountType])

//   const uiSubscription: UISubscription | undefined = useMemo(
//     () => activeSubscription ? mapSubscriptionToUI(activeSubscription) : undefined,
//     [activeSubscription]
//   )

//   // ✅ 4. Resolver использует selectedAccountType (реагирует на клики!)
//   const view = resolveAccountManagementView({
//     accountType: selectedAccountType,  // ← из state, не из API!
//     hasActiveSubscription: !!activeSubscription,
//   })

//   const isLoading = subLoading || plansLoading

//   const handlePayPalClick = () => {
//     // TODO: T2 - реализовать платежный флоу
//   }

//   const handleStripeClick = () => {
//     // TODO: T2 - реализовать платежный флоу
//   }

//   const handlePlanChange = (plan: SubscriptionPlanValue) => {
//     setSelectedPlan(plan)
//   }

//   if (isLoading) {
//     return <div className={styles.loading}>Загрузка...</div>
//   }

//   const renderView = () => {
//     switch (view) {
//       case 'personal':
//         return <PersonalView subscription={uiSubscription} />

//       case 'business-no-subscription':
//         return (
//           <BusinessNoSubscriptionView
//             plans={plans}
//             selectedPlan={selectedPlan}
//             onPlanChange={handlePlanChange}
//             onPayPalClick={handlePayPalClick}
//             onStripeClick={handleStripeClick}
//             isPaymentLocked={isPaymentLocked}
//           />
//         )

//       case 'business-active-subscription':
//         return (
//           <BusinessActiveSubscriptionView
//             subscription={uiSubscription}
//           />
//         )

//       default:
//         return null
//     }
//   }

//   return (
//     <div className={styles.accountManagementPage}>
//       {/* ✅ 5. AccountTypeSection теперь реагирует на клики */}
//       <AccountTypeSection
//         accountTypes={accountTypes}
//         selectedType={selectedAccountType}  // ← из state
//         onTypeChange={setSelectedAccountType}  // ← обновляем state при клике!
//       />

//       {renderView()}
//     </div>
//   )
// }

// features/profile/settings/ui/AccountManagement/AccountManagement.tsx

// features/profile/settings/ui/AccountManagement/AccountManagement.tsx

'use client'

import { useMemo, useState, useEffect } from 'react'

import { useCurrentSubscription } from '@/features/subscriptions/model/hooks/useCurrentSubscription'
import { usePricing } from '@/features/subscriptions/model/hooks/usePricing'
import { resolveAccountManagementView } from '@/features/subscriptions/model/resolvers/accountManagementResolver'
import { PersonalView } from '@/features/subscriptions/ui/PersonalView/PersonalView'
import { BusinessNoSubscriptionView } from '@/features/subscriptions/ui/BusinessNoSubscriptionView/BusinessNoSubscriptionView'
import { BusinessActiveSubscriptionView } from '@/features/subscriptions/ui/BusinessActiveSubscriptionView/BusinessActiveSubscriptionView'
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

// 🔧 MOCK_MODE — для тестирования с моковыми данными
const MOCK_MODE = true

export const AccountManagement = () => {
  // ✅ Начальный state: personal по умолчанию
  const [selectedAccountType, setSelectedAccountType] = useState<AccountTypeValue>('personal')
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlanValue>('month')
  const [isPaymentLocked, setIsPaymentLocked] = useState(false)

  const { subscriptions: apiSubscriptions, isLoading: subLoading } = useCurrentSubscription()
  const { plans: apiPlans, isLoading: plansLoading } = usePricing()

  // 🔧 Моковые данные для тестирования
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
    return apiSubscriptions
  }, [MOCK_MODE, apiSubscriptions])

  const plans = useMemo(() => {
    if (MOCK_MODE) {
      return [
        { id: 'day', value: '1day', label: '1 Day — $9.99', price: '9.99', period: 'day' },
        { id: 'week', value: '7day', label: '7 Days — $49.99', price: '49.99', period: 'week' },
        { id: 'month', value: 'month', label: '1 Month — $199.99', price: '199.99', period: 'month' },
      ] as UISubscriptionPlan[]
    }
    return apiPlans as UISubscriptionPlan[]
  }, [MOCK_MODE, apiPlans])

  const activeSubscription = useMemo(
    () => subscriptions.find(s => s.isActive),
    [subscriptions]
  )

  // ✅ accountType: если есть активная подписка — всегда business
  const accountType: AccountTypeValue = activeSubscription ? 'business' : selectedAccountType

  // ✅ Синхронизация с реальным API (не для моков)
  useEffect(() => {
    if (!MOCK_MODE && activeSubscription) {
      setSelectedAccountType('business')
    }
  }, [activeSubscription, MOCK_MODE])

  const uiSubscription: UISubscription | undefined = useMemo(
    () => activeSubscription ? mapSubscriptionToUI(activeSubscription) : undefined,
    [activeSubscription]
  )

  const view = resolveAccountManagementView({
    accountType,
    hasActiveSubscription: !!activeSubscription,
  })

  const isLoading = subLoading || plansLoading

  const handlePayPalClick = () => {
    // TODO: T2
  }
  const handleStripeClick = () => {
    // TODO: T2
  }
  const handlePlanChange = (plan: SubscriptionPlanValue) => {
    setSelectedPlan(plan)
  }
  
  // ✅ Обработчик смены типа аккаунта
  const handleAccountTypeChange = (type: AccountTypeValue) => {
    // 🚫 Не позволяем переключиться на Personal, если есть РЕАЛЬНАЯ активная подписка
    if (!MOCK_MODE && activeSubscription && type === 'personal') return
    setSelectedAccountType(type)
  }

  if (isLoading) {
    return <div className={styles.loading}>Загрузка...</div>
  }

  return (
    <div className={styles.accountManagementPage}>
      {/* ✅ PersonalView — только инфо, без секций подписки */}
      {view === 'personal' && <PersonalView />}

      {/* ✅ Business — общий блок */}
      {view !== 'personal' && (
        <>
          {/* 1. Если есть активная подписка — показываем её ПЕРВОЙ */}
          {view === 'business-active-subscription' && uiSubscription && (
            <SubscriptionSection subscription={uiSubscription} />
          )}

          {/* 2. Переключатель типа аккаунта (Personal/Business) */}
          <AccountTypeSection
            accountTypes={[
              { value: 'personal', label: 'Personal' },
              { value: 'business', label: 'Business' },
            ]}
            selectedType={accountType}
            onTypeChange={handleAccountTypeChange}
          />

          {/* 3. Выбор тарифа — показываем ВСЕГДА, чтобы можно было купить подписку */}
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