import { API_ROUTES } from '@/shared/api'
import { PaymentType, SubscriptionType } from '@/shared/types'
import { configureStore } from '@reduxjs/toolkit'
import { describe, expect, it, vi } from 'vitest'

import { subscriptionsApi } from './subscriptionsApi'

const createTestStore = () =>
  configureStore({
    reducer: {
      [subscriptionsApi.reducerPath]: subscriptionsApi.reducer,
    },
    middleware: getDefaultMiddleware => getDefaultMiddleware().concat(subscriptionsApi.middleware),
  })

const asJsonResponse = (body: unknown, status: number = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })

const asNoContentResponse = () =>
  new Response(null, {
    status: 204,
  })

describe('subscriptionsApi', () => {
  it('calls getPricing endpoint with correct route', async () => {
    const fetchMock = vi.fn().mockResolvedValue(asJsonResponse({ data: [] }))
    const store = createTestStore()

    vi.stubGlobal('fetch', fetchMock as typeof fetch)

    await store.dispatch(subscriptionsApi.endpoints.getPricing.initiate())

    expect(fetchMock).toHaveBeenCalledTimes(1)

    const [url] = fetchMock.mock.calls[0]

    expect(String(url)).toContain(API_ROUTES.SUBSCRIPTIONS.COST_OF_PAYMENT)
  })

  it('calls createSubscription endpoint with POST body', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(asJsonResponse({ url: 'https://stripe.com/session' }, 201))
    const store = createTestStore()
    const payload = {
      typeSubscription: SubscriptionType.MONTHLY,
      paymentType: PaymentType.STRIPE,
      amount: 10,
      baseUrl: 'http://localhost:3000',
    } as const

    vi.stubGlobal('fetch', fetchMock as typeof fetch)

    await store.dispatch(subscriptionsApi.endpoints.createSubscription.initiate(payload))

    expect(fetchMock).toHaveBeenCalledTimes(1)

    const [url, init] = fetchMock.mock.calls[0]

    expect(String(url)).toContain(API_ROUTES.SUBSCRIPTIONS.CREATE)
    expect(init?.method).toBe('POST')
    expect(init?.body).toBe(JSON.stringify(payload))
  })

  it('calls getCurrentSubscription endpoint with correct route', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(asJsonResponse({ data: [], hasAutoRenewal: false }, 200))
    const store = createTestStore()

    vi.stubGlobal('fetch', fetchMock as typeof fetch)

    await store.dispatch(subscriptionsApi.endpoints.getCurrentSubscription.initiate())

    expect(fetchMock).toHaveBeenCalledTimes(1)

    const [url] = fetchMock.mock.calls[0]

    expect(String(url)).toContain(API_ROUTES.SUBSCRIPTIONS.CURRENT_PAYMENT)
  })

  it('calls getPayments endpoint with default query params', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(
        asJsonResponse({ totalCount: 0, pagesCount: 0, page: 1, pageSize: 12, items: [] })
      )
    const store = createTestStore()

    vi.stubGlobal('fetch', fetchMock as typeof fetch)

    await store.dispatch(subscriptionsApi.endpoints.getPayments.initiate())

    expect(fetchMock).toHaveBeenCalledTimes(1)

    const [url] = fetchMock.mock.calls[0]
    const requestUrl = new URL(String(url))

    expect(requestUrl.pathname).toContain(API_ROUTES.SUBSCRIPTIONS.MY_PAYMENTS)
    expect(requestUrl.searchParams.get('pageNumber')).toBe('1')
    expect(requestUrl.searchParams.get('pageSize')).toBe('12')
    expect(requestUrl.searchParams.get('sortBy')).toBe('endDate')
    expect(requestUrl.searchParams.get('sortDirection')).toBe('desc')
  })

  it('calls cancelAutoRenewal endpoint with POST', async () => {
    const fetchMock = vi.fn().mockResolvedValue(asNoContentResponse())
    const store = createTestStore()

    vi.stubGlobal('fetch', fetchMock as typeof fetch)

    await store.dispatch(subscriptionsApi.endpoints.cancelAutoRenewal.initiate())

    expect(fetchMock).toHaveBeenCalledTimes(1)

    const [url, init] = fetchMock.mock.calls[0]

    expect(String(url)).toContain(API_ROUTES.SUBSCRIPTIONS.CANCEL_AUTO_RENEWAL)
    expect(init?.method).toBe('POST')
  })

  it('calls renewAutoRenewal endpoint with POST', async () => {
    const fetchMock = vi.fn().mockResolvedValue(asNoContentResponse())
    const store = createTestStore()

    vi.stubGlobal('fetch', fetchMock as typeof fetch)

    await store.dispatch(subscriptionsApi.endpoints.renewAutoRenewal.initiate())

    expect(fetchMock).toHaveBeenCalledTimes(1)

    const [url, init] = fetchMock.mock.calls[0]

    expect(String(url)).toContain(API_ROUTES.SUBSCRIPTIONS.RENEW_AUTO_RENEWAL)
    expect(init?.method).toBe('POST')
  })
})
