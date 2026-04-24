import { ActiveSubscriptionViewModel } from '@/shared/types'

export const isAutoRenewOnlyOnLastSubscription = (
  subscriptions: ActiveSubscriptionViewModel[]
): boolean => {
  const lastIndex = subscriptions.length - 1

  return subscriptions.every(
    (subscription, index) => !subscription.autoRenewal || index === lastIndex
  )
}
