import type { ActiveSubscriptionViewModel } from '@/shared/types/payments/models'

import { hasNewSubscription } from '../lib'
import { PollStatus } from './payments.types'

const POLL_INTERVAL_MS = 3_000
const POLL_TIMEOUT_MS = 15_000

export async function waitForSubscriptionUpdate(
  fetchFn: () => Promise<ActiveSubscriptionViewModel[]>,
  baseline: ActiveSubscriptionViewModel[]
): Promise<PollStatus> {
  const deadline = Date.now() + POLL_TIMEOUT_MS
  const hasSubscriptionUpdate = async () => {
    const current = await fetchFn()

    return hasNewSubscription(baseline, current)
  }

  if (await hasSubscriptionUpdate()) {
    return 'success'
  }

  while (Date.now() < deadline) {
    await sleep(POLL_INTERVAL_MS)

    if (Date.now() >= deadline) {
      break
    }

    if (await hasSubscriptionUpdate()) {
      return 'success'
    }
  }

  return 'timeout'
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}
