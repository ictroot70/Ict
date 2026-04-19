/* @vitest-environment jsdom */

import {
  useCancelAutoRenewalMutation,
  useGetCurrentSubscriptionQuery,
  useRenewAutoRenewalMutation,
} from '@/features/subscriptions/api'
import { act, renderHook } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { useCurrentSubscriptionChain } from './useCurrentSubscriptionChain'

vi.mock('@/features/subscriptions/api', () => ({
  useCancelAutoRenewalMutation: vi.fn(),
  useGetCurrentSubscriptionQuery: vi.fn(),
  useRenewAutoRenewalMutation: vi.fn(),
}))

const useGetCurrentSubscriptionQueryMock = vi.mocked(useGetCurrentSubscriptionQuery)
const useCancelAutoRenewalMutationMock = vi.mocked(useCancelAutoRenewalMutation)
const useRenewAutoRenewalMutationMock = vi.mocked(useRenewAutoRenewalMutation)

const createQueryResult = (partial?: Partial<ReturnType<typeof useGetCurrentSubscriptionQuery>>) =>
  ({
    data: {
      data: [
        {
          userId: 1,
          subscriptionId: 'sub-1',
          dateOfPayment: '2026-03-01T00:00:00.000Z',
          endDateOfSubscription: '2026-04-01T00:00:00.000Z',
          autoRenewal: true,
        },
      ],
      hasAutoRenewal: true,
    },
    isLoading: false,
    isFetching: false,
    isError: false,
    refetch: vi.fn(),
    ...partial,
  }) as ReturnType<typeof useGetCurrentSubscriptionQuery>

const createMutationTuple = () => {
  const trigger = vi.fn(() => ({
    unwrap: vi.fn().mockResolvedValue(undefined),
  }))

  return [trigger, { isLoading: false }] as const
}

beforeEach(() => {
  const [cancelTrigger, cancelState] = createMutationTuple()
  const [renewTrigger, renewState] = createMutationTuple()

  useGetCurrentSubscriptionQueryMock.mockReturnValue(createQueryResult())
  useCancelAutoRenewalMutationMock.mockReturnValue([
    cancelTrigger,
    cancelState,
  ] as unknown as ReturnType<typeof useCancelAutoRenewalMutation>)
  useRenewAutoRenewalMutationMock.mockReturnValue([
    renewTrigger,
    renewState,
  ] as unknown as ReturnType<typeof useRenewAutoRenewalMutation>)
})

describe('useCurrentSubscriptionChain', () => {
  it('keeps toggle enabled while current subscription refetch is in progress', async () => {
    const [cancelTrigger, cancelState] = createMutationTuple()

    useGetCurrentSubscriptionQueryMock.mockReturnValue(createQueryResult({ isFetching: true }))
    useCancelAutoRenewalMutationMock.mockReturnValue([
      cancelTrigger,
      cancelState,
    ] as unknown as ReturnType<typeof useCancelAutoRenewalMutation>)

    const { result } = renderHook(() => useCurrentSubscriptionChain())

    expect(result.current.isToggleDisabled).toBe(false)

    await act(async () => {
      await result.current.toggleAutoRenewal()
    })

    expect(cancelTrigger).toHaveBeenCalledTimes(1)
  })
})
