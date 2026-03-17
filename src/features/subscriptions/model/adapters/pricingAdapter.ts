import { SubscriptionPlan } from '@/features/profile/settings/model/types'
import { GetPricingResponseDto } from '@/shared/types'

export const mapPricingToPlans = (data: GetPricingResponseDto): SubscriptionPlan[] => {
  return data.data.map(plan => ({
    id: plan.typeDescription,
    value:
      plan.typeDescription === 'MONTHLY'
        ? 'month'
        : plan.typeDescription === 'DAY'
          ? '1day'
          : '7day',
    label: `$${plan.amount} per ${
      plan.typeDescription === 'MONTHLY' ? 'month' : plan.typeDescription === 'DAY' ? 'day' : 'week'
    }`,
    price: plan.amount.toString(),
    period: plan.typeDescription,
  }))
}
