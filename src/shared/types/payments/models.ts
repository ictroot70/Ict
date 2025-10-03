import { PaymentType, SubscriptionType } from '../base/enums'

export interface CreateSubscriptionInputDto {
  typeSubscription: SubscriptionType
  paymentType: PaymentType
  amount: number
  baseUrl: string
}

export interface PaymentSessionUrlViewModel {
  url: string
}

export interface ActiveSubscriptionViewModel {
  userId: number
  subscriptionId: string
  dateOfPayment: string
  endDateOfSubscription: string
  autoRenewal: boolean
}

export interface CurrentActiveSubscriptionsViewModel {
  data: ActiveSubscriptionViewModel[]
  hasAutoRenewal: boolean
}

export interface PaymentsViewModel {
  userId: number
  subscriptionId: string
  dateOfPayment: string
  endDateOfSubscription: string
  price: number
  subscriptionType: SubscriptionType
  paymentType: PaymentType
}

export interface PricingDetailsViewModel {
  amount: number
  typeDescription: SubscriptionType
}

export interface SubscriptionPriceViewModel {
  data: PricingDetailsViewModel[]
}
