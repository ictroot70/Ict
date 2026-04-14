'use client'
import { useMemo, useState } from 'react'
import { toast } from 'react-toastify'

// <<<<<<< SCRUM-207-T2-Return-flow-polling-idempotency
// import React from 'react'

// import {
//   PaymentConfirmationModal,
//   PaymentFailureModal,
//   PaymentSuccessModal,
// } from '@/features/subscriptions'
// import { useAccountManagement, useAutoRenewalActions } from '@/features/subscriptions/hooks'
// import { mapSubscriptionTypeToLabel } from '@/features/subscriptions/model'
// import { formatDate } from '@/shared/lib'
// import { PaymentType } from '@/shared/types'
// import { Button, CheckboxRadix } from '@/shared/ui'
// import { useTranslations } from 'next-intl'

// import s from './AccountManagement.module.scss'

// import { usePaymentModalState } from '../../hooks/usePaymentModalState'
// export function AccountManagement() {
//   const {
//     flowStatus,
//     paymentResultStatus,
//     selectedPlan,
//     pricingPlans,
//     isPaymentLocked,
//     isAutoRenewEnabled,
//     subscriptionQueue,
//     handlePay,
//     handlePlanChange,
//     resetPaymentResult,
//   } = useAccountManagement()

//   const t = useTranslations('subscriptions.account')
//   const { handleSwitchAutoRenewal, isAutoRenewalChanging } = useAutoRenewalActions()

//   const isPaymentDisabled = !selectedPlan || isPaymentLocked

//   const {
//     modal,
//     backToPayment,
//     openConfirmModal,
//     closeConfirmModal,
//     clearPaymentModalState,
//     closePaymentResultModal,
//   } = usePaymentModalState({ isPaymentDisabled, paymentResultStatus })

//   const confirmPayment = async () => {
//     clearPaymentModalState()
//     resetPaymentResult()

//     await handlePay(PaymentType.STRIPE)
//   }

//   return (
//     <>
//       <div className={s.root}>
//         {flowStatus === 'polling' && <p>Processing payment...</p>}
//         {subscriptionQueue.length > 0 && (
//           <div>
//             <div className={s.section}>
//               <span className={s.sectionTitle}>Current Subscription:</span>
//               <div className={s.list}>
//                 {subscriptionQueue.map(subscription => {
//                   return (
//                     <div className={s.infoBox} key={subscription.subscriptionId}>
//                       <div className={s.infoField}>
//                         Expire at
//                         <span>{formatDate(subscription.endDateOfSubscription)}</span>
//                       </div>
//                       <div className={s.infoField}>
//                         {subscription.autoRenewal ? 'Next payment' : 'Subscription ends'}
//                         <span>{formatDate(subscription.endDateOfSubscription)}</span>
//                       </div>
//                     </div>
//                   )
//                 })}
//               </div>
//             </div>
//             <CheckboxRadix
//               label={'Auto-Renewal'}
//               checked={isAutoRenewEnabled}
//               disabled={isAutoRenewalChanging}
//               onCheckedChange={handleSwitchAutoRenewal}
//             />
//           </div>
//         )}
//         <div className={s.section}>
//           <span className={s.sectionTitle}>Change your subscription:</span>
//           <div className={s.optionsBox}>
//             {pricingPlans?.data?.map(plan => (
//               <label key={plan.typeDescription} className={s.radioRow}>
//                 <input
//                   checked={selectedPlan?.typeDescription === plan.typeDescription}
//                   className={s.radioInput}
//                   disabled={isPaymentLocked}
//                   name={'plan'}
//                   type={'radio'}
//                   onChange={() => handlePlanChange(plan)}
//                 />
//                 ${plan.amount} per {mapSubscriptionTypeToLabel(plan.typeDescription)}
//               </label>
//             ))}
//           </div>
//         </div>

//         <Button
//           variant={'outlined'}
//           disabled={isPaymentLocked || !selectedPlan}
//           onClick={openConfirmModal}
//         >
//           {t('stripe')}
//         </Button>
//       </div>

//       <PaymentConfirmationModal
//         open={modal === 'confirm'}
//         onClose={closeConfirmModal}
//         onConfirm={confirmPayment}
//         isSubmitting={isPaymentLocked}
//       />
//       <PaymentSuccessModal open={modal === 'success'} onClose={closePaymentResultModal} />

//       <PaymentFailureModal
//         open={modal === 'failure'}
//         onClose={closePaymentResultModal}
//         onBackToPayment={backToPayment}
//       />
//     </>
// =======
import { usePricing } from '@/features/subscriptions/model/hooks/usePricing'
import { resolveAccountManagementView } from '@/features/subscriptions/model/resolvers/accountManagementResolver'
import {
  AccountTypeValue,
  mapSubscriptionToUI,
  SubscriptionPlanValue,
  UISubscription,
} from '@/features/subscriptions/model/types'
import { BusinessActiveSubscriptionView } from '@/features/subscriptions/ui/BusinessActiveSubscriptionView/BusinessActiveSubscriptionView'
import { PersonalView } from '@/features/subscriptions/ui/PersonalView/PersonalView'
import { showToastAlert } from '@/shared/lib/toast/showToastAlert'

import styles from './AccountManagement.module.scss'

import { useCurrentSubscription } from '../../model/hooks/useCurrentSubscription'
import { BusinessNoSubscriptionView } from '../BusinessNoSubscriptionView/BusinessNoSubscriptionView'

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
// >>>>>>> SCRUM-199-Payments-Delivery-UC-1.UC-4
  )

  const view = resolveAccountManagementView({
    accountType,
    hasActiveSubscription: !!activeSubscription,
  })

  const isLoading = subLoading || plansLoading

  const handlePayPalClick = () => {
    showToastAlert({
      message: 'Оплата через PayPal временно недоступна. Это демо-режим.',
      type: 'info',
      duration: 3000,
      closeable: true,
      progressBar: true,
    })
  }

  const handleStripeClick = () => {
    showToastAlert({
      message: 'Оплата через Stripe временно недоступна. Это демо-режим.',
      type: 'info',
      duration: 3000,
      closeable: true,
      progressBar: true,
    })
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
