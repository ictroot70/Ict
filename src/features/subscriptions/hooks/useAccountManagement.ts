import { useCallback, useEffect, useState } from 'react'

import {
  useCreateSubscriptionMutation,
  useGetCurrentSubscriptionQuery,
  useGetPricingQuery,
} from '@/features/subscriptions/api'
import { showToastAlert } from '@/shared/lib'
import { PaymentType, PricingDetailsViewModel } from '@/shared/types'
import { usePathname } from 'next/navigation'

import { getErrorStatus, getPaymentErrorMessage, mapStatusToErrorCode } from '../lib'
import { paymentBaseline, paymentPending } from '../model'
import { usePaymentReturnFlow } from './usePaymentReturnFlow'

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

  const { isPolling, flowStatus } = usePaymentReturnFlow({
    fetchSubscriptions,
  })

  const isPaymentLocked = isSubscribing || isPolling

  useEffect(() => {
    if (pricingPlans?.data?.length && !selectedPlan) {
      setSelectedPlan(pricingPlans.data[0])
    }
  }, [pricingPlans, selectedPlan])

  const isAutoRenewEnabled = subscription?.hasAutoRenewal ?? false

  const currentSubscriptions = subscription?.data[0]

  const handlePay = async (paymentType: PaymentType) => {
    if (!selectedPlan) {
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
      paymentPending.clear()
      paymentBaseline.clear()

      const errorStatus = getErrorStatus(error)
      const code = mapStatusToErrorCode(errorStatus)

      showToastAlert({
        message: getPaymentErrorMessage(code),
        type: 'error',
      })
    }
  }

  const handlePlanChange = (plan: PricingDetailsViewModel) => setSelectedPlan(plan)

  return {
    flowStatus,
    pricingPlans,
    selectedPlan,
    isPaymentLocked,
    isAutoRenewEnabled,
    currentSubscriptions,
    handlePay,
    handlePlanChange,
  }
}
