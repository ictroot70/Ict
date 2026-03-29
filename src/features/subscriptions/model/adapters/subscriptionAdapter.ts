import { GetCurrentSubscriptionResponseDto } from '@/shared/types'

import { Subscription } from '../types'

export const mapSubscriptionData = (data: GetCurrentSubscriptionResponseDto): Subscription[] => {
  return data.data.map(sub => ({
    id: sub.subscriptionId,
    expireDate: sub.endDateOfSubscription,
    nextPaymentDate: sub.dateOfPayment,
    isActive: new Date(sub.endDateOfSubscription) > new Date(),
    autoRenewal: sub.autoRenewal,
  }))
}



const mapTypeDescriptionToValue = (type: string): SubscriptionPlanValue => {
  switch (type) {
    case 'DAILY': return '1day'
    case 'WEEKLY': return '7day'
    case 'MONTHLY': return 'month'
    default: return 'month'
  }
}