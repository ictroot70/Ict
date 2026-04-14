import { useGetCurrentSubscriptionQuery } from '../../api'
import { mapSubscriptionData } from '../adapters/subscriptionAdapter'
import { Subscription } from '../types'

interface UseCurrentSubscriptionReturn {
  subscriptions: Subscription[]
  hasAutoRenewal: boolean
  isLoading: boolean
  refetch: () => void
}

export const useCurrentSubscription = (): UseCurrentSubscriptionReturn => {
  const { data, isLoading, refetch } = useGetCurrentSubscriptionQuery()

  const subscriptions = data ? mapSubscriptionData(data) : []
  const hasAutoRenewal = data?.hasAutoRenewal ?? false

  return {
    subscriptions,
    hasAutoRenewal,
    isLoading,
    refetch,
  }
}
