// import React, { useState } from 'react'

// import {
//   useCancelAutoRenewalMutation,
//   useRenewAutoRenewalMutation,
// } from '@/features/subscriptions/api'

// import { UISubscription } from '@/features/profile/settings/model/types'
// import { Card, CheckboxRadix, Typography } from '@/shared/ui'

// import styles from './SubscriptionSection.module.scss'

// interface Props {
//   subscription?: UISubscription
// }

// export const SubscriptionSection: React.FC<Props> = ({ subscription }) => {
//   const [cancelAutoRenewal] = useCancelAutoRenewalMutation()
//   const [renewAutoRenewal] = useRenewAutoRenewalMutation()

//   const [autoRenewal, setAutoRenewal] = useState(subscription?.autoRenewal ?? false)
//   const [isUpdating, setIsUpdating] = useState(false)

//   if (!subscription) {
//     return (
//       <section className={styles.section}>
//         <Typography variant={'h3'} className={styles.section__title}>
//           Current Subscription:
//         </Typography>
//         <div className={styles.subscriptionsList}>
//           <Card className={styles.subscriptionCard}>
//             <Typography variant={'regular_14'}>
//               No active subscription
//             </Typography>
//           </Card>
//         </div>
//       </section>
//     )
//   }

//   const handleAutoRenewalChange = async (checked: boolean) => {
//     if (isUpdating) {
//       return
//     }

//     setIsUpdating(true)

//     try {
//       if (checked) {
//         await renewAutoRenewal().unwrap()
//       } else {
//         await cancelAutoRenewal().unwrap()
//       }
//       setAutoRenewal(checked)
//     } catch (error) {
//       // Обработка ошибки (можно добавить toast позже)
//     } finally {
//       setIsUpdating(false)
//     }
//   }

//   return (
//     <section className={styles.section}>
//       <Typography variant={'h3'} className={styles.section__title}>
//         Current Subscription:
//       </Typography>

//       <div className={styles.subscriptionsList}>
//         <Card
//           className={`${styles.subscriptionCard} ${!subscription.isActive ? styles.subscriptionCardInactive : ''}`}
//         >
//           <div className={styles.subscriptionCard__fields}>
//             <div className={styles.subscriptionField}>
//               <Typography variant={'regular_14'} className={styles.subscriptionField__label}>
//                 Expire at:
//               </Typography>
//               <Typography variant={'bold_14'} className={styles.subscriptionField__date}>
//                 {subscription.expireDate}
//               </Typography>
//             </div>
//             <div className={styles.subscriptionField}>
//               <Typography variant={'regular_14'} className={styles.subscriptionField__label}>
//                 Next payment:
//               </Typography>
//               <Typography variant={'bold_14'} className={styles.subscriptionField__date}>
//                 {subscription.nextPaymentDate}
//               </Typography>
//             </div>
//           </div>
//         </Card>
//       </div>

//       <div className={styles.autoRenewalContainer}>
//         <CheckboxRadix
//           checked={autoRenewal}
//           onCheckedChange={handleAutoRenewalChange}
//           label={'Auto-Renewal'}
//           disabled={isUpdating}
//         />
//       </div>
//     </section>
//   )
// }


import React, { useState, useEffect } from 'react'

import {
  useCancelAutoRenewalMutation,
  useRenewAutoRenewalMutation,
} from '@/features/subscriptions/api'

import { UISubscription } from '@/features/profile/settings/model/types'
import { Card, CheckboxRadix, Typography } from '@/shared/ui'

import styles from './SubscriptionSection.module.scss'

interface Props {
  subscription?: UISubscription
}

export const SubscriptionSection: React.FC<Props> = ({ subscription }) => {
  const [cancelAutoRenewal] = useCancelAutoRenewalMutation()
  const [renewAutoRenewal] = useRenewAutoRenewalMutation()

  const [autoRenewal, setAutoRenewal] = useState(subscription?.autoRenewal ?? false)
  const [isUpdating, setIsUpdating] = useState(false)

  // ✅ FIX #1: Синхронизация локального state с пропсом
  useEffect(() => {
    if (subscription?.autoRenewal !== undefined) {
      setAutoRenewal(subscription.autoRenewal)
    }
  }, [subscription?.autoRenewal])

  if (!subscription) {
    return (
      <section className={styles.section}>
        <Typography variant={'h3'} className={styles.section__title}>
          Current Subscription:
        </Typography>
        <div className={styles.subscriptionsList}>
          <Card className={styles.subscriptionCard}>
            <Typography variant={'regular_14'}>No active subscription</Typography>
          </Card>
        </div>
      </section>
    )
  }

  const handleAutoRenewalChange = async (checked: boolean) => {
    if (isUpdating) return

    setIsUpdating(true)

    try {
      if (checked) {
        await renewAutoRenewal().unwrap()
      } else {
        await cancelAutoRenewal().unwrap()
      }
      // ✅ Обновляем локальный state после успешной мутации
      setAutoRenewal(checked)
    } catch (error) {
      // В продакшене можно добавить toast или логирование
      // console.error('Failed to update auto-renewal:', error)
      // Откатываем состояние при ошибке
      setAutoRenewal(!checked)
    } finally {
      setIsUpdating(false)
    }
  }

  return (
    <section className={styles.section}>
      <Typography variant={'h3'} className={styles.section__title}>
        Current Subscription:
      </Typography>

      <div className={styles.subscriptionsList}>
        <Card
          className={`${styles.subscriptionCard} ${!subscription.isActive ? styles.subscriptionCardInactive : ''}`}
        >
          <div className={styles.subscriptionCard__fields}>
            <div className={styles.subscriptionField}>
              <Typography variant={'regular_14'} className={styles.subscriptionField__label}>
                Expire at:
              </Typography>
              <Typography variant={'bold_14'} className={styles.subscriptionField__date}>
                {subscription.expireDate}
              </Typography>
            </div>
            <div className={styles.subscriptionField}>
              <Typography variant={'regular_14'} className={styles.subscriptionField__label}>
                Next payment:
              </Typography>
              <Typography variant={'bold_14'} className={styles.subscriptionField__date}>
                {subscription.nextPaymentDate}
              </Typography>
            </div>
          </div>
        </Card>
      </div>

      <div className={styles.autoRenewalContainer}>
        <CheckboxRadix
          checked={autoRenewal}
          onCheckedChange={handleAutoRenewalChange}
          label={'Auto-Renewal'}
          disabled={isUpdating}
        />
      </div>
    </section>
  )
}