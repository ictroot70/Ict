import type { ActiveSubscriptionViewModel } from '@/shared/types/payments/models'

export function hasNewSubscription(
  prev: ActiveSubscriptionViewModel[],
  next: ActiveSubscriptionViewModel[]
): boolean {
  if (next.length !== prev.length) {
    return true
  }

  const prevById = new Map(prev.map(subscription => [subscription.subscriptionId, subscription]))

  const fieldsToCompare = ['dateOfPayment', 'endDateOfSubscription', 'autoRenewal'] as const

  return next.some(subscription => {
    const previous = prevById.get(subscription.subscriptionId)

    if (!previous) {
      return true
    }

    return fieldsToCompare.some(field => previous[field] !== subscription[field])
  })
}
