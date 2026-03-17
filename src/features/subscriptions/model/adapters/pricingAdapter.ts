import { GetPricingResponseDto } from '@/shared/types'
import { SubscriptionPlan } from '../types'

export const mapPricingToPlans = (data: GetPricingResponseDto): SubscriptionPlan[] => {
  return data.data.map(plan => ({
    id: plan.typeDescription,
    value:
      plan.typeDescription === 'MONTHLY'
        ? 'month'
        : plan.typeDescription === 'DAY'
          ? '1day'
          : '7day',
    label:
      plan.typeDescription === 'MONTHLY'
        ? `$${plan.amount} per month`
        : plan.typeDescription === 'DAY'
          ? `$${plan.amount} per 1 Day`
          : `$${plan.amount} per 7 Day`,
    price: plan.amount.toString(),
    period: plan.typeDescription,
  }))
}
