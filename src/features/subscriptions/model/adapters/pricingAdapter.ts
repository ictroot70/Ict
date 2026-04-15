import { GetPricingResponseDto } from '@/shared/types'

import { SubscriptionPlan } from '../types'

export const mapPricingToPlans = (data: GetPricingResponseDto): SubscriptionPlan[] => {
  return data.data.map(plan => {
    const getValue = () => {
      if (plan.typeDescription === 'MONTHLY') {
        return 'month'
      }

      if (plan.typeDescription === 'DAY') {
        return '1day'
      }

      return '7day'
    }

    const getLabel = () => {
      if (plan.typeDescription === 'MONTHLY') {
        return `$${plan.amount} per month`
      }

      if (plan.typeDescription === 'DAY') {
        return `$${plan.amount} per 1 Day`
      }

      return `$${plan.amount} per 7 Day`
    }

    return {
      id: plan.typeDescription,
      value: getValue(),
      label: getLabel(),
      price: plan.amount.toString(),
      period: getPeriodFromType(plan.typeDescription),
    }
  })
}

const getPeriodFromType = (type: string): string => {
  switch (type) {
    case 'DAY':
      return 'day'
    case 'WEEKLY':
      return 'week'
    case 'MONTHLY':
    default:
      return 'month'
  }
}
