import { SubscriptionPlan } from '@/features/profile/settings/model/types'
import { mapPricingToPlans } from '../adapters/pricingAdapter'
import { useGetPricingQuery } from '../../api'

interface UsePricingReturn {
  plans: SubscriptionPlan[]
  isLoading: boolean
  refetch: () => void
}

export const usePricing = (): UsePricingReturn => {
  const { data, isLoading, refetch } = useGetPricingQuery()

  const plans = data ? mapPricingToPlans(data) : []

  return { plans, isLoading, refetch }
}
