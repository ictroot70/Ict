import { useCallback, useEffect, useMemo, useState } from 'react'

import {
  useCancelAutoRenewalMutation,
  useGetCurrentSubscriptionQuery,
  useRenewAutoRenewalMutation,
} from '@/features/subscriptions/api'
import { isAutoRenewOnlyOnLastSubscription } from '@/features/subscriptions/model'

export const useCurrentSubscriptionChain = () => {
  const {
    data,
    isLoading,
    isFetching,
    isError,
    refetch: refetchCurrentSubscription,
  } = useGetCurrentSubscriptionQuery()
  const [cancelAutoRenewal, { isLoading: isCancelLoading }] = useCancelAutoRenewalMutation()
  const [renewAutoRenewal, { isLoading: isRenewLoading }] = useRenewAutoRenewalMutation()
  const [optimisticHasAutoRenewal, setOptimisticHasAutoRenewal] = useState<boolean | null>(null)

  const subscriptions = useMemo(
    () =>
      [...(data?.data ?? [])].sort((left, right) => {
        const leftEndTime = new Date(left.endDateOfSubscription).getTime()
        const rightEndTime = new Date(right.endDateOfSubscription).getTime()

        if (leftEndTime !== rightEndTime) {
          return leftEndTime - rightEndTime
        }

        const leftPaymentTime = new Date(left.dateOfPayment).getTime()
        const rightPaymentTime = new Date(right.dateOfPayment).getTime()

        return leftPaymentTime - rightPaymentTime
      }),
    [data?.data]
  )
  const serverHasAutoRenewal = Boolean(data?.hasAutoRenewal)
  const hasAutoRenewal = optimisticHasAutoRenewal ?? serverHasAutoRenewal
  const subscriptionsForUi = useMemo(() => {
    if (optimisticHasAutoRenewal === null) {
      return subscriptions
    }

    if (!optimisticHasAutoRenewal) {
      return subscriptions.map(subscription => ({
        ...subscription,
        autoRenewal: false,
      }))
    }

    const tailIndex = subscriptions.length - 1

    return subscriptions.map((subscription, index) => ({
      ...subscription,
      autoRenewal: index === tailIndex,
    }))
  }, [optimisticHasAutoRenewal, subscriptions])
  const hasQueueInvariantViolation = !isAutoRenewOnlyOnLastSubscription(subscriptions)
  const isToggleLoading = isCancelLoading || isRenewLoading
  const isToggleDisabled =
    isLoading || isToggleLoading || hasQueueInvariantViolation || subscriptions.length === 0

  useEffect(() => {
    setOptimisticHasAutoRenewal(null)
  }, [serverHasAutoRenewal])

  const toggleAutoRenewal = useCallback(async () => {
    if (isToggleDisabled) {
      return
    }

    const nextHasAutoRenewal = !hasAutoRenewal

    setOptimisticHasAutoRenewal(nextHasAutoRenewal)

    try {
      if (hasAutoRenewal) {
        await cancelAutoRenewal().unwrap()
      } else {
        await renewAutoRenewal().unwrap()
      }
      // Mutations invalidate `autoRenewal` tag and trigger getCurrentSubscription refresh.
      // Avoid manual refetch here to prevent duplicate round-trip and reduce toggle latency.
    } catch {
      setOptimisticHasAutoRenewal(null)
      // T4 scope: keep the current UI state; user can retry toggle action manually.
    }
  }, [cancelAutoRenewal, hasAutoRenewal, isToggleDisabled, renewAutoRenewal])

  return {
    subscriptions: subscriptionsForUi,
    hasAutoRenewal,
    isLoading,
    isFetching,
    isError,
    refetchCurrentSubscription,
    toggleAutoRenewal,
    isToggleLoading,
    isToggleDisabled,
    hasQueueInvariantViolation,
  }
}
