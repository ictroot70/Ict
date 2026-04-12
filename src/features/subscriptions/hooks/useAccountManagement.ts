import { useCallback, useEffect, useState } from 'react'

import {
  useCreateSubscriptionMutation,
  useGetCurrentSubscriptionQuery,
  useGetPricingQuery,
} from '@/features/subscriptions/api'
import { showToastAlert } from '@/shared/lib'
import { PaymentType, PricingDetailsViewModel } from '@/shared/types'
import { usePathname } from 'next/navigation'

import { getPaymentErrorMessage } from '../lib'
import { paymentBaseline, paymentPending } from '../model'
import { usePaymentReturnFlow } from './usePaymentReturnFlow'

export type PaymentResultStatus = 'idle' | 'success' | 'failure'

export function useAccountManagement() {
  const pathname = usePathname()

  const { data: subscription, refetch } = useGetCurrentSubscriptionQuery()
  const { data: pricingPlans } = useGetPricingQuery()

  const [createSubscription, { isLoading: isSubscribing }] = useCreateSubscriptionMutation()

  const [selectedPlan, setSelectedPlan] = useState<PricingDetailsViewModel | null>(null)

  const fetchSubscriptions = useCallback(async () => {
    const result = await refetch()

    return result.data?.data ?? []
  }, [refetch])

  const { isPolling, flowStatus, clearPaymentState, resetFlowStatus } = usePaymentReturnFlow({
    fetchSubscriptions,
  })

  const isPaymentLocked = isSubscribing || isPolling

  useEffect(() => {
    if (pricingPlans?.data?.length) {
      setSelectedPlan(prev => prev ?? pricingPlans.data[0])
    }
  }, [pricingPlans])

  const isAutoRenewEnabled = subscription?.hasAutoRenewal ?? false
  const subscriptionItems = subscription?.data ?? []

  const currentSubscription = subscriptionItems.length
    ? subscriptionItems.reduce((latest, item) => {
        return new Date(item.endDateOfSubscription) > new Date(latest.endDateOfSubscription)
          ? item
          : latest
      })
    : null

  let paymentResultStatus: PaymentResultStatus = 'idle'

  if (flowStatus === 'success') {
    paymentResultStatus = 'success'
  } else if (flowStatus === 'failed' || flowStatus === 'timeout') {
    paymentResultStatus = 'failure'
  }

  const handlePay = useCallback(
    async (paymentType: PaymentType) => {
      if (!selectedPlan || isPaymentLocked) {
        return
      }

      try {
        const returnUrl = `${window.location.origin}${pathname}`
        const { typeDescription, amount } = selectedPlan

        const fresh = await refetch()

        paymentBaseline.set(fresh.data?.data ?? [])

        const result = await createSubscription({
          amount,
          paymentType,
          baseUrl: returnUrl,
          typeSubscription: typeDescription,
        }).unwrap()

        paymentPending.set()
        window.location.href = result.url
      } catch (error) {
        showToastAlert({
          message: getPaymentErrorMessage(error),
          type: 'error',
        })
        clearPaymentState()
      }
    },
    [clearPaymentState, createSubscription, isPaymentLocked, pathname, refetch, selectedPlan]
  )

  const handlePlanChange = useCallback((plan: PricingDetailsViewModel) => {
    setSelectedPlan(plan)
  }, [])

  return {
    flowStatus,
    pricingPlans,
    selectedPlan,
    isPaymentLocked,
    isAutoRenewEnabled,
    currentSubscription,
    paymentResultStatus,
    handlePay,
    handlePlanChange,
    resetPaymentResult: resetFlowStatus,
  }
}
