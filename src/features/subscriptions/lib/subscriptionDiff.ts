import type { ActiveSubscriptionViewModel } from '@/shared/types/payments/models'

/**
 * Detects if subscription state changed after payment.
 * Success = list size changed, a new subscriptionId appeared,
 * or an existing subscription record was updated in place.
 */
export function hasNewSubscription(
  prev: ActiveSubscriptionViewModel[],
  next: ActiveSubscriptionViewModel[]
): boolean {
  if (next.length !== prev.length) {
    return true
  }

  const prevById = new Map(prev.map(subscription => [subscription.subscriptionId, subscription]))

  return next.some(subscription => {
    const previous = prevById.get(subscription.subscriptionId)

    if (!previous) {
      return true
    }

    return (
      previous.dateOfPayment !== subscription.dateOfPayment ||
      previous.endDateOfSubscription !== subscription.endDateOfSubscription ||
      previous.autoRenewal !== subscription.autoRenewal
    )
  })
}
