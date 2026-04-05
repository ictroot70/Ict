import type { ActiveSubscriptionViewModel } from '@/shared/types/payments/models'

/**
 * Detects if a new subscription appeared after payment.
 * Success = list grew OR a new subscriptionId appeared.
 */
export function hasNewSubscription(
  prev: ActiveSubscriptionViewModel[],
  next: ActiveSubscriptionViewModel[]
): boolean {
  if (next.length > prev.length) {
    return true
  }

  const prevIds = new Set(prev.map(s => s.subscriptionId))

  return next.some(s => !prevIds.has(s.subscriptionId))
}
