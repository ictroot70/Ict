import { API_ROUTES } from '@/shared/api'
import {
  GetCurrentSubscriptionResponseDto,
  GetPricingResponseDto,
  SubscriptionType,
} from '@/shared/types'
import { http, HttpResponse } from 'msw'

const pricingResponse: GetPricingResponseDto = {
  data: [
    { amount: 10, typeDescription: SubscriptionType.DAY },
    { amount: 50, typeDescription: SubscriptionType.WEEKLY },
    { amount: 100, typeDescription: SubscriptionType.MONTHLY },
  ],
}

const currentSubscriptionResponse: GetCurrentSubscriptionResponseDto = {
  data: [
    {
      userId: 1,
      subscriptionId: 'sub_default_1',
      dateOfPayment: '2026-03-10T00:00:00.000Z',
      endDateOfSubscription: '2026-04-10T00:00:00.000Z',
      autoRenewal: true,
    },
  ],
  hasAutoRenewal: true,
}

export const subscriptionsHandlers = [
  http.get(`*${API_ROUTES.SUBSCRIPTIONS.COST_OF_PAYMENT}`, () =>
    HttpResponse.json<GetPricingResponseDto>(pricingResponse)
  ),
  http.get(`*${API_ROUTES.SUBSCRIPTIONS.CURRENT_PAYMENT}`, () =>
    HttpResponse.json<GetCurrentSubscriptionResponseDto>(currentSubscriptionResponse)
  ),
]
