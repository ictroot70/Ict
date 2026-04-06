import { useCallback } from 'react'

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

  const subscriptions = data?.data ?? []
  const hasAutoRenewal = Boolean(data?.hasAutoRenewal)
  const hasQueueInvariantViolation = !isAutoRenewOnlyOnLastSubscription(subscriptions)
  const isToggleLoading = isCancelLoading || isRenewLoading
  const isToggleDisabled =
    isLoading ||
    isFetching ||
    isToggleLoading ||
    hasQueueInvariantViolation ||
    subscriptions.length === 0

  const toggleAutoRenewal = useCallback(async () => {
    if (isToggleDisabled) {
      return
    }

    try {
      if (hasAutoRenewal) {
        await cancelAutoRenewal().unwrap()
      } else {
        await renewAutoRenewal().unwrap()
      }

      await refetchCurrentSubscription()
    } catch {
      // T4 scope: keep the current UI state; user can retry toggle action manually.
    }
  }, [
    cancelAutoRenewal,
    hasAutoRenewal,
    isToggleDisabled,
    refetchCurrentSubscription,
    renewAutoRenewal,
  ])

  return {
    subscriptions,
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
