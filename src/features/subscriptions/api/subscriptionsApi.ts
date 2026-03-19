import { API_ROUTES } from '@/shared/api'
import { baseApi } from '@/shared/api/base-api'
import {
  CancelAutoRenewalResponseDto,
  CreateSubscriptionRequestDto,
  CreateSubscriptionResponseDto,
  GetCurrentSubscriptionResponseDto,
  GetPaymentsRequestDto,
  GetPaymentsResponseDto,
  GetPricingResponseDto,
  PaymentsSortBy,
  PaymentsSortDirection,
  RenewAutoRenewalResponseDto,
} from '@/shared/types'

const DEFAULT_PAYMENTS_QUERY: Required<GetPaymentsRequestDto> = {
  pageNumber: 1,
  pageSize: 8,
  sortBy: PaymentsSortBy.END_DATE,
  sortDirection: PaymentsSortDirection.DESC,
}

export const subscriptionsApi = baseApi.injectEndpoints({
  endpoints: builder => ({
    getPricing: builder.query<GetPricingResponseDto, void>({
      query: () => ({
        url: API_ROUTES.SUBSCRIPTIONS.COST_OF_PAYMENT,
      }),
    }),
    createSubscription: builder.mutation<
      CreateSubscriptionResponseDto,
      CreateSubscriptionRequestDto
    >({
      query: body => ({
        url: API_ROUTES.SUBSCRIPTIONS.CREATE,
        method: 'POST',
        body,
      }),
      invalidatesTags: () => ['autoRenewal'],
    }),
    getCurrentSubscription: builder.query<GetCurrentSubscriptionResponseDto, void>({
      query: () => ({
        url: API_ROUTES.SUBSCRIPTIONS.CURRENT_PAYMENT,
      }),
      providesTags: ['autoRenewal'],
    }),
    getPayments: builder.query<GetPaymentsResponseDto, GetPaymentsRequestDto | void>({
      query: params => {
        const queryParams = {
          ...DEFAULT_PAYMENTS_QUERY,
          ...(params ?? {}),
        }

        return {
          url: API_ROUTES.SUBSCRIPTIONS.MY_PAYMENTS,
          params: queryParams,
        }
      },
    }),
    cancelAutoRenewal: builder.mutation<CancelAutoRenewalResponseDto, void>({
      query: () => ({
        url: API_ROUTES.SUBSCRIPTIONS.CANCEL_AUTO_RENEWAL,
        method: 'POST',
      }),
      invalidatesTags: () => ['autoRenewal'],
    }),
    renewAutoRenewal: builder.mutation<RenewAutoRenewalResponseDto, void>({
      query: () => ({
        url: API_ROUTES.SUBSCRIPTIONS.RENEW_AUTO_RENEWAL,
        method: 'POST',
      }),
      invalidatesTags: () => ['autoRenewal'],
    }),
  }),
})

export const {
  useGetPricingQuery,
  useLazyGetPricingQuery,
  useCreateSubscriptionMutation,
  useGetCurrentSubscriptionQuery,
  useLazyGetCurrentSubscriptionQuery,
  useGetPaymentsQuery,
  useLazyGetPaymentsQuery,
  useCancelAutoRenewalMutation,
  useRenewAutoRenewalMutation,
} = subscriptionsApi
