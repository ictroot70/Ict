import type {
  CreateSubscriptionInputDto,
  CurrentActiveSubscriptionsViewModel,
  PaymentSessionUrlViewModel,
  SubscriptionPriceViewModel,
} from '@/shared/types/payments/models'

import { API_ROUTES } from '@/shared/api/api-routes'
import { baseApi } from '@/shared/api/base-api'

export const subscriptionApi = baseApi.injectEndpoints({
  endpoints: build => ({
    createSubscription: build.mutation<PaymentSessionUrlViewModel, CreateSubscriptionInputDto>({
      query: body => ({
        url: API_ROUTES.SUBSCRIPTIONS.CREATE,
        method: 'POST',
        body,
      }),
      invalidatesTags: ['autoRenewal'],
    }),
    getCurrentSubscription: build.query<CurrentActiveSubscriptionsViewModel, void>({
      query: () => API_ROUTES.SUBSCRIPTIONS.CURRENT_PAYMENT,
      providesTags: ['autoRenewal'],
    }),
    cancelAutoRenewal: build.mutation<void, void>({
      query: () => ({
        url: API_ROUTES.SUBSCRIPTIONS.CANCEL_AUTO_RENEWAL,
        method: 'POST',
      }),
      invalidatesTags: ['autoRenewal'],
    }),
    renewAutoRenewal: build.mutation<void, void>({
      query: () => ({
        url: API_ROUTES.SUBSCRIPTIONS.RENEW_AUTO_RENEWAL,
        method: 'POST',
      }),
      invalidatesTags: ['autoRenewal'],
    }),
    getSubscriptionPrices: build.query<SubscriptionPriceViewModel, void>({
      query: () => API_ROUTES.SUBSCRIPTIONS.COST_OF_PAYMENT,
    }),
  }),
})

export const {
  useCreateSubscriptionMutation,
  useGetCurrentSubscriptionQuery,
  useCancelAutoRenewalMutation,
  useRenewAutoRenewalMutation,
  useGetSubscriptionPricesQuery,
} = subscriptionApi
