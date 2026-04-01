import type { ActiveSubscriptionViewModel } from '@/shared/types/payments/models'
import { hasNewSubscription } from './subscriptionDiff'

const POLL_INTERVAL_MS = 3_000
const POLL_TIMEOUT_MS = 90_000

export type PollOutcome = 'success' | 'timeout'

/**
 * Polls getCurrentSubscription until a new subscription appears or timeout.
 * @param fetchFn - async function that fetches current subscriptions
 * @param baseline - snapshot of subscriptions before payment
 * @returns outcome: 'success' | 'timeout'
 */
export async function pollUntilSubscriptionUpdated(
  fetchFn: () => Promise<ActiveSubscriptionViewModel[]>,
  baseline: ActiveSubscriptionViewModel[]
): Promise<PollOutcome> {
  const deadline = Date.now() + POLL_TIMEOUT_MS

  while (Date.now() < deadline) {
    await sleep(POLL_INTERVAL_MS)
    const current = await fetchFn()

    if (hasNewSubscription(baseline, current)) {
      return 'success'
    }
  }

  return 'timeout'
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}
