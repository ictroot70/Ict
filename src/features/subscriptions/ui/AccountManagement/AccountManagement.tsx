'use client'

import type { PricingDetailsViewModel } from '@/shared/types/payments/models'

import { useEffect, useState } from 'react'

import {
  useCreateSubscriptionMutation,
  useGetCurrentSubscriptionQuery,
  useCancelAutoRenewalMutation,
  useRenewAutoRenewalMutation,
  useGetPricingQuery,
} from '@/features/subscriptions/api'
import { usePaymentReturnFlow } from '@/features/subscriptions/hooks'
import {
  paymentPending,
  paymentBaseline,
  getErrorStatus,
  mapStatusToErrorCode,
  getPaymentErrorMessage,
  type PaymentErrorCode,
} from '@/features/subscriptions/lib'
import { mapSubscriptionTypeToLabel } from '@/features/subscriptions/model'
import { formatDate, showToastAlert } from '@/shared/lib'
import { PaymentType } from '@/shared/types'
import { CheckboxRadix } from '@/shared/ui'
import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'

import s from './AccountManagement.module.scss'

export function AccountManagement() {
  const { data: pricingPlans } = useGetPricingQuery()
  const { data: subscription, refetch } = useGetCurrentSubscriptionQuery()

  const [createSubscription, { isLoading: isCreating }] = useCreateSubscriptionMutation()
  const [cancelAutoRenewal, { isLoading: isCancelling }] = useCancelAutoRenewalMutation()
  const [renewAutoRenewal, { isLoading: isRenewing }] = useRenewAutoRenewalMutation()

  const [selectedPlan, setSelectedPlan] = useState<PricingDetailsViewModel | null>(null)
  const [paymentErrorCode, setPaymentErrorCode] = useState<PaymentErrorCode | null>(null)

  const pathname = usePathname()
  const router = useRouter()

  const { isPolling, flowStatus, flowErrorCode } = usePaymentReturnFlow({
    fetchSubscriptions: async () => {
      const result = await refetch()

      return result.data?.data ?? []
    },
  })

  const isPaymentLocked = isCreating || isPolling
  const serverAutoRenewal = subscription?.hasAutoRenewal ?? false
  const current = subscription?.data?.[0]

  useEffect(() => {
    if (pricingPlans?.data?.length && !selectedPlan) {
      setSelectedPlan(pricingPlans.data[0])
    }
  }, [pricingPlans, selectedPlan])

  useEffect(() => {
    if (flowStatus === 'timeout') {
      showToastAlert({
        message: 'Payment confirmation timed out. Please refresh.',
        type: 'error',
      })
    }

    if (flowErrorCode === 'unknown') {
      showToastAlert({
        message: 'Payment confirmation failed. Please try again.',
        type: 'error',
      })
    }
  }, [flowStatus, flowErrorCode])

  useEffect(() => {
    if (!paymentErrorCode) {
      return
    }

    if (paymentErrorCode === 'unauthorized') {
      showToastAlert({
        message: getPaymentErrorMessage(paymentErrorCode),
        type: 'error',
      })
      setPaymentErrorCode(null)

      return
    }

    showToastAlert({
      message: getPaymentErrorMessage(paymentErrorCode),
      type: 'error',
    })
    setPaymentErrorCode(null)
  }, [paymentErrorCode, router])

  const handlePay = async (paymentType: PaymentType) => {
    if (!selectedPlan || isPaymentLocked) {
      return
    }

    setPaymentErrorCode(null)

    try {
      const returnUrl = `${window.location.origin}${pathname}`
      const fresh = await refetch()

      paymentBaseline.set(fresh.data?.data ?? [])

      const result = await createSubscription({
        typeSubscription: selectedPlan.typeDescription,
        paymentType,
        amount: selectedPlan.amount,
        baseUrl: returnUrl,
      }).unwrap()

      paymentPending.set()
      window.location.href = result.url
    } catch (err) {
      paymentPending.clear()
      paymentBaseline.clear()
      setPaymentErrorCode(mapStatusToErrorCode(getErrorStatus(err)))
      console.error('[AccountManagement] createSubscription failed:', err)
    }
  }

  const handleAutoRenewalChange = async (checked: boolean) => {
    try {
      if (checked) {
        await renewAutoRenewal().unwrap()
      } else {
        await cancelAutoRenewal().unwrap()
      }
    } catch {
      showToastAlert({
        message: 'Auto-renewal update failed',
        type: 'error',
      })
    }
  }

  return (
    <div className={s.root}>
      {current && (
        <div className={s.section}>
          <span className={s.sectionTitle}>Current Subscription:</span>
          <div className={s.infoBox}>
            <div className={s.infoField}>
              Expire at
              <span>{formatDate(current.endDateOfSubscription)}</span>
            </div>
            <div className={s.infoField}>
              Next payment
              <span>{formatDate(current.endDateOfSubscription)}</span>
            </div>
          </div>
          <CheckboxRadix
            checked={serverAutoRenewal}
            disabled={isCancelling || isRenewing}
            label={'Auto-Renewal'}
            onCheckedChange={handleAutoRenewalChange}
          />
        </div>
      )}

      {flowStatus === 'polling' && <p>Processing payment...</p>}

      <div className={s.section}>
        <span className={s.sectionTitle}>Change your subscription:</span>
        <div className={s.optionsBox}>
          {pricingPlans?.data?.map(plan => (
            <label key={plan.typeDescription} className={s.radioRow}>
              <input
                checked={selectedPlan?.typeDescription === plan.typeDescription}
                className={s.radioInput}
                disabled={isPaymentLocked}
                name={'plan'}
                type={'radio'}
                onChange={() => setSelectedPlan(plan)}
              />
              ${plan.amount} per {mapSubscriptionTypeToLabel(plan.typeDescription)}
            </label>
          ))}
        </div>
      </div>

      <div className={s.paymentButtons}>
        <button
          className={s.payBtn}
          disabled={isPaymentLocked || !selectedPlan}
          type={'button'}
          onClick={() => handlePay(PaymentType.STRIPE)}
        >
          <Image alt={'Stripe'} height={28} src={'/icons/svg/stripe.svg'} width={60} />
        </button>
      </div>
    </div>
  )
}
