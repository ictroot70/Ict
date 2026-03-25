import { GetCurrentSubscriptionResponseDto } from '@/shared/types'

import { Subscription } from '../types'

export const mapSubscriptionData = (data: GetCurrentSubscriptionResponseDto): Subscription[] => {
  return data.data.map(sub => ({
    id: sub.subscriptionId,
    expireDate: new Date(sub.endDateOfSubscription).toLocaleDateString('ru-RU'),
    nextPaymentDate: new Date(sub.dateOfPayment).toLocaleDateString('ru-RU'),
    isActive: new Date(sub.endDateOfSubscription) > new Date(),
    autoRenewal: sub.autoRenewal,
  }))
}