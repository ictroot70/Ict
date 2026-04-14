// 'use client'
// import { useEffect, useState } from 'react'

// <<<<<<< SCRUM-209-T4-Current-subscription-auto-renew-UC-3-queue-logic
// import React, { ReactNode, useEffect, useRef } from 'react'

// import { useCurrentSubscriptionChain } from '@/features/subscriptions/hooks'
// import { Loading } from '@/shared/composites'
// import { formatDate } from '@/shared/lib/formatters'
// import { Button, Card, CheckboxRadix, ScrollAreaRadix, Typography } from '@/shared/ui'
// import { clsx } from 'clsx'

// import styles from './SubscriptionPricing.module.scss'

// type SubscriptionPricingProps = {
//   accountTypeSlot?: ReactNode
//   changeSubscriptionSlot?: ReactNode
// }

// export function SubscriptionPricing({
//   accountTypeSlot,
//   changeSubscriptionSlot,
// }: SubscriptionPricingProps = {}) {
//   const {
//     subscriptions,
//     hasAutoRenewal,
//     isLoading: isSubscriptionsLoading,
//     isFetching: isSubscriptionsFetching,
//     isError: isSubscriptionsError,
//     refetchCurrentSubscription,
//     toggleAutoRenewal,
//     isToggleLoading,
//     isToggleDisabled,
//   } = useCurrentSubscriptionChain()

//   const hasActiveSubscriptions = subscriptions.length > 0
//   const isInitialLoading = isSubscriptionsLoading && !subscriptions.length
//   const currentSubscriptionScrollAreaHostRef = useRef<HTMLDivElement | null>(null)
//   const currentSubscriptionBodyRef = useRef<HTMLDivElement | null>(null)
//   const subscriptionRowRefs = useRef<Array<HTMLDivElement | null>>([])
//   const prevHasAutoRenewalRef = useRef(hasAutoRenewal)
//   const hadSubscriptionErrorRef = useRef(isSubscriptionsError)

//   const visibleSubscriptions = subscriptions

//   useEffect(() => {
//     const wasAutoRenewalEnabled = prevHasAutoRenewalRef.current

//     prevHasAutoRenewalRef.current = hasAutoRenewal

//     if (wasAutoRenewalEnabled || !hasAutoRenewal) {
//       return
// =======
// import { Card, Typography, Button } from '@/shared/ui'
// import { RadioGroupRadix } from '@ictroot/ui-kit'

// import styles from './SubscriptionPricing.module.scss'

// import { SubscriptionPlan, SubscriptionPlanValue } from '../model/types'

// interface SubscriptionPricingProps {
//   plans: SubscriptionPlan[]
//   selectedPlan?: SubscriptionPlanValue
//   onPlanChange?: (plan: SubscriptionPlanValue) => void
//   onPayPalClick?: () => void
//   onStripeClick?: () => void
//   isPaymentLocked?: boolean
// }

// export function SubscriptionPricing({
//   plans,
//   selectedPlan: externalSelectedPlan,
//   onPlanChange,
//   onPayPalClick,
//   onStripeClick,
//   isPaymentLocked = false,
// }: SubscriptionPricingProps) {
//   const [internalSelectedPlanValue, setInternalSelectedPlanValue] = useState<SubscriptionPlanValue>(
//     externalSelectedPlan || plans[0]?.value || 'month'
//   )

//   useEffect(() => {
//     if (externalSelectedPlan) {
//       setInternalSelectedPlanValue(externalSelectedPlan)
// >>>>>>> SCRUM-199-Payments-Delivery-UC-1.UC-4
//     }
//   }, [externalSelectedPlan])

// <<<<<<< SCRUM-209-T4-Current-subscription-auto-renew-UC-3-queue-logic
//     const viewportNode =
//       currentSubscriptionScrollAreaHostRef.current?.querySelector<HTMLDivElement>(
//         `.${styles.currentSubscriptionViewport}`
//       ) ?? currentSubscriptionBodyRef.current

//     if (!viewportNode) {
//       return
//     }

//     const autoRenewalIndex = visibleSubscriptions.findIndex(
//       subscription => subscription.autoRenewal
//     )

//     if (autoRenewalIndex < 0) {
//       return
//     }

//     const targetRow = subscriptionRowRefs.current[autoRenewalIndex]

//     if (!targetRow) {
//       return
//     }

//     const currentScrollTop = viewportNode.scrollTop
//     const currentScrollBottom = currentScrollTop + viewportNode.clientHeight
//     const rowTop = targetRow.offsetTop
//     const rowBottom = rowTop + targetRow.offsetHeight
//     const isRowFullyVisible = rowTop >= currentScrollTop && rowBottom <= currentScrollBottom

//     if (isRowFullyVisible) {
//       return
//     }

//     targetRow.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
//   }, [hasAutoRenewal, visibleSubscriptions])

//   useEffect(() => {
//     if (isSubscriptionsError) {
//       hadSubscriptionErrorRef.current = true

//       return
//     }

//     if (!isSubscriptionsFetching) {
//       hadSubscriptionErrorRef.current = false
//     }
//   }, [isSubscriptionsError, isSubscriptionsFetching])

//   const resolveNextPaymentDate = (subscriptionIndex: number) => {
//     const current = subscriptions[subscriptionIndex]
//     const next = subscriptions[subscriptionIndex + 1]

//     if (next) {
//       // "Next payment" should never be earlier than current period expiration.
//       // If the next subscription was paid in advance, we show the next charge moment
//       // at the current period boundary instead of a past payment date.
//       const currentEndTime = new Date(current.endDateOfSubscription).getTime()
//       const nextPaymentTime = new Date(next.dateOfPayment).getTime()
//       const normalizedTime = Math.max(currentEndTime, nextPaymentTime)

//       return formatDate(new Date(normalizedTime).toISOString())
//     }

//     if (hasAutoRenewal) {
//       return formatDate(current.endDateOfSubscription)
//     }

//     return '—'
//   }

//   const shouldKeepFallbackDuringRetry = isSubscriptionsFetching && hadSubscriptionErrorRef.current
//   const shouldShowCurrentSubscriptionFallback =
//     isSubscriptionsError || shouldKeepFallbackDuringRetry
//   const shouldShowCurrentSubscriptionSection =
//     hasActiveSubscriptions || shouldShowCurrentSubscriptionFallback
//   const hasAccountTypeSlot = accountTypeSlot != null
//   const hasChangeSubscriptionSlot = changeSubscriptionSlot != null

//   if (isInitialLoading) {
//     return <Loading />
//   }

//   return (
//     <div className={styles.root}>
//       {shouldShowCurrentSubscriptionSection && (
//         <section className={styles.currentSubscriptionSection}>
//           <Typography variant={'h3'}>Current Subscription:</Typography>
//           {shouldShowCurrentSubscriptionFallback ? (
//             <Card className={styles.stateCard}>
//               <Typography variant={'h3'}>Could not load subscriptions data</Typography>
//               <Typography className={styles.stateText} variant={'regular_16'}>
//                 Please try again.
//               </Typography>
//               <Button
//                 className={styles.retryButton}
//                 variant={'outlined'}
//                 disabled={isSubscriptionsFetching}
//                 onClick={() => void refetchCurrentSubscription()}
//               >
//                 Retry
//               </Button>
//             </Card>
//           ) : (
//             <Card className={styles.currentSubscriptionCard}>
//               <div className={styles.currentSubscriptionTable}>
//                 <div className={styles.currentSubscriptionHeader}>
//                   <Typography className={styles.metricLabel} variant={'regular_14'}>
//                     Expire at
//                   </Typography>
//                   <Typography className={styles.metricLabel} variant={'regular_14'}>
//                     Next payment
//                   </Typography>
//                 </div>
//                 <div
//                   ref={currentSubscriptionScrollAreaHostRef}
//                   className={styles.currentSubscriptionScrollAreaHost}
//                 >
//                   <ScrollAreaRadix
//                     className={styles.currentSubscriptionScrollArea}
//                     viewportClassName={styles.currentSubscriptionViewport}
//                   >
//                     <div
//                       ref={currentSubscriptionBodyRef}
//                       className={styles.currentSubscriptionBody}
//                       data-testid={'current-subscription-body'}
//                     >
//                       {visibleSubscriptions.map((subscription, index) => (
//                         <div
//                           key={subscription.subscriptionId}
//                           ref={node => {
//                             subscriptionRowRefs.current[index] = node
//                           }}
//                           data-subscription-id={subscription.subscriptionId}
//                           className={clsx(
//                             styles.currentSubscriptionRow,
//                             index === 0 && styles.currentSubscriptionRowActive,
//                             subscription.autoRenewal && styles.currentSubscriptionRowAutoRenew
//                           )}
//                         >
//                           <Typography variant={'semibold_small_text'}>
//                             {formatDate(subscription.endDateOfSubscription)}
//                           </Typography>
//                           <div className={styles.metricCell}>
//                             <Typography variant={'semibold_small_text'}>
//                               {resolveNextPaymentDate(index)}
//                             </Typography>
//                           </div>
//                         </div>
//                       ))}
//                     </div>
//                   </ScrollAreaRadix>
//                 </div>
//               </div>
//             </Card>
//           )}

//           <div className={styles.autoRenewalControl}>
//             <CheckboxRadix
//               required={false}
//               label={'Auto-Renewal'}
//               checked={hasAutoRenewal}
//               disabled={isToggleDisabled || shouldShowCurrentSubscriptionFallback}
//               onCheckedChange={() => void toggleAutoRenewal()}
//             />
//             {isToggleLoading && (
//               <span
//                 className={styles.autoRenewalSpinner}
//                 aria-label={'Updating auto-renewal'}
//                 role={'status'}
//               />
//             )}
//           </div>
//         </section>
//       )}

//       {hasAccountTypeSlot && (
//         <section
//           className={clsx(
//             styles.accountTypeSection,
//             !shouldShowCurrentSubscriptionSection && styles.accountTypeSectionTopOffset
//           )}
//         >
//           <Typography variant={'h3'}>Account type:</Typography>
//           {accountTypeSlot}
//         </section>
//       )}

//       {hasChangeSubscriptionSlot && (
//         <section className={styles.businessPricingSection}>
//           <Typography variant={'h3'}>Change your subscription:</Typography>
//           {changeSubscriptionSlot}
//         </section>
//       )}
//     </div>
// =======
//   const selectedPlanValue =
//     externalSelectedPlan !== undefined ? externalSelectedPlan : internalSelectedPlanValue

//   const selectedPlanData = plans.find(p => p.value === selectedPlanValue)
//   const isDisabled = isPaymentLocked || !selectedPlanData || !plans.length

//   const radioOptions = plans.map(plan => ({
//     value: plan.value,
//     label: plan.label,
//     id: `plan-${plan.id}`,
//   }))

//   const handleValueChange = (value: string) => {
//     const planValue = value as SubscriptionPlanValue

//     if (onPlanChange) {
//       onPlanChange(planValue)
//     } else {
//       setInternalSelectedPlanValue(planValue)
//     }
//   }

//   if (!plans.length) {
//     return (
//       <Card className={styles.stateCard}>
//         <Typography variant={'h3'}>Нет доступных тарифов</Typography>
//         <Typography className={styles.stateText} variant={'regular_16'}>
//           Информация о тарифах временно недоступна.
//         </Typography>
//       </Card>
//     )
//   }

//   return (
//     <section className={styles.section}>
//       <Typography variant={'h3'} className={styles.section__title}>
//         Change your subscription:
//       </Typography>

//       <div className={styles.pricingList}>
//         <Card className={styles.pricingCard}>
//           <RadioGroupRadix
//             label={'Select subscription plan'}
//             options={radioOptions}
//             value={selectedPlanValue}
//             onValueChange={handleValueChange}
//             orientation={'vertical'}
//             disabled={isPaymentLocked}
//           />
//         </Card>
//       </div>

//       <div className={styles.paymentContainer}>
//         <div className={styles.paymentWrapper}>
//           {/* <Button
//             className={styles.paymentButton}
//             onClick={onPayPalClick}
//             disabled={isDisabled}
//             variant={'outlined'}
//           >
//             <img src={'/paypal.svg'} alt={'PayPal'} className={styles.paymentIcon} />
//           </Button>

//           <span className={styles.paymentOr}>Or</span> */}

//           <Button
//             className={styles.paymentButton}
//             onClick={onStripeClick}
//             disabled={isDisabled}
//             variant={'outlined'}
//           >
//             <img src={'/stripe.svg'} alt={'Stripe'} className={styles.paymentIcon} />
//           </Button>
//         </div>
//       </div>
//     </section>
// >>>>>>> SCRUM-199-Payments-Delivery-UC-1.UC-4
//   )
// }
