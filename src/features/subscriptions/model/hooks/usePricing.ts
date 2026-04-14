import { useGetPricingQuery } from '../../api'
import { mapPricingToPlans } from '../adapters/pricingAdapter'
import { SubscriptionPlan } from '../types'

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
