import { PaymentType, SubscriptionType } from '../base/enums'

export enum PaymentsSortBy {
  CREATED_AT = 'createdAt',
  DATE_OF_PAYMENT = 'dateOfPayment',
  END_DATE = 'endDate',
  PAYMENT_TYPE = 'paymentType',
  PRICE = 'price',
}

export enum PaymentsSortDirection {
  ASC = 'asc',
  DESC = 'desc',
}

export interface GetPaymentsRequestDto {
  pageNumber?: number
  pageSize?: number
  sortBy?: PaymentsSortBy
  sortDirection?: PaymentsSortDirection
}

export type GetPaymentsParams = GetPaymentsRequestDto

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

export interface PaymentsWithPaginationViewModel {
  totalCount: number
  pagesCount: number
  page: number
  pageSize: number
  items: PaymentsViewModel[]
}

export interface PricingDetailsViewModel {
  amount: number
  typeDescription: SubscriptionType
}

export interface SubscriptionPriceViewModel {
  data: PricingDetailsViewModel[]
}

export type GetPricingResponseDto = SubscriptionPriceViewModel
export type CreateSubscriptionRequestDto = CreateSubscriptionInputDto
export type CreateSubscriptionResponseDto = PaymentSessionUrlViewModel
export type GetCurrentSubscriptionResponseDto = CurrentActiveSubscriptionsViewModel
export type GetPaymentsResponseDto = PaymentsWithPaginationViewModel
export type CancelAutoRenewalResponseDto = void
export type RenewAutoRenewalResponseDto = void
