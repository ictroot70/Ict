import { API_ROUTES } from '@/shared/api'
import {
  PaymentType,
  SubscriptionType,
  GetCurrentSubscriptionResponseDto,
  CreateSubscriptionResponseDto,
  GetPricingResponseDto,
} from '@/shared/types'
import { server } from '@/test/msw'
import { configureStore } from '@reduxjs/toolkit'
import { http, HttpResponse } from 'msw'
import { describe, expect, it } from 'vitest'

import { subscriptionsApi } from './subscriptionsApi'

const createTestStore = () =>
  configureStore({
    reducer: {
      [subscriptionsApi.reducerPath]: subscriptionsApi.reducer,
    },
    middleware: getDefaultMiddleware => getDefaultMiddleware().concat(subscriptionsApi.middleware),
  })

describe('subscriptionsApi + MSW', () => {
  it('returns pricing data from MSW handler', async () => {
    const store = createTestStore()
    const pricingResponse: GetPricingResponseDto = {
      data: [
        { amount: 10, typeDescription: SubscriptionType.DAY },
        { amount: 100, typeDescription: SubscriptionType.MONTHLY },
      ],
    }

    server.use(
      http.get(`*${API_ROUTES.SUBSCRIPTIONS.COST_OF_PAYMENT}`, () =>
        HttpResponse.json<GetPricingResponseDto>(pricingResponse)
      )
    )

    const result = await store.dispatch(subscriptionsApi.endpoints.getPricing.initiate()).unwrap()

    expect(result).toEqual(pricingResponse)
  })

  it('returns current subscription data from MSW handler', async () => {
    const store = createTestStore()
    const currentSubscriptionResponse: GetCurrentSubscriptionResponseDto = {
      data: [],
      hasAutoRenewal: false,
    }

    server.use(
      http.get(`*${API_ROUTES.SUBSCRIPTIONS.CURRENT_PAYMENT}`, () =>
        HttpResponse.json<GetCurrentSubscriptionResponseDto>(currentSubscriptionResponse)
      )
    )

    const result = await store
      .dispatch(subscriptionsApi.endpoints.getCurrentSubscription.initiate())
      .unwrap()

    expect(result).toEqual(currentSubscriptionResponse)
  })

  it('handles createSubscription 409 error from MSW handler', async () => {
    const store = createTestStore()

    server.use(
      http.post(`*${API_ROUTES.SUBSCRIPTIONS.CREATE}`, () =>
        HttpResponse.json({ message: 'Subscription conflict' }, { status: 409 })
      )
    )

    const promise = store
      .dispatch(
        subscriptionsApi.endpoints.createSubscription.initiate({
          typeSubscription: SubscriptionType.MONTHLY,
          paymentType: PaymentType.STRIPE,
          amount: 100,
          baseUrl: 'http://localhost:3000',
        })
      )
      .unwrap()

    await expect(promise).rejects.toMatchObject({
      status: 409,
    })
  })
})
