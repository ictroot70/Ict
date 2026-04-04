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
  type PaymentErrorCode,
} from '@/features/subscriptions/lib'
import { mapSubscriptionTypeToLabel } from '@/features/subscriptions/model'
import { formatDate } from '@/shared/lib/formatters'
import { PaymentType } from '@/shared/types'
import { CheckboxRadix } from '@/shared/ui'
import Image from 'next/image'
import { usePathname } from 'next/navigation'

import s from './AccountManagement.module.scss'

export function AccountManagement() {
  const pathname = usePathname()
  const [selectedPlan, setSelectedPlan] = useState<PricingDetailsViewModel | null>(null)
  const [paymentErrorCode, setPaymentErrorCode] = useState<PaymentErrorCode | null>(null)

  const [createSubscription, { isLoading: isCreating }] = useCreateSubscriptionMutation()
  const [cancelAutoRenewal, { isLoading: isCancelling }] = useCancelAutoRenewalMutation()
  const [renewAutoRenewal, { isLoading: isRenewing }] = useRenewAutoRenewalMutation()
  const { data: subscription, refetch } = useGetCurrentSubscriptionQuery()
  const { data: prices } = useGetPricingQuery()

  const { isPolling, flowStatus, flowErrorCode } = usePaymentReturnFlow({
    fetchSubscriptions: async () => {
      const result = await refetch()

      return result.data?.data ?? []
    },
  })

  const isPaymentLocked = isCreating || isPolling

  const serverAutoRenewal = subscription?.hasAutoRenewal ?? false
  const [autoRenewalChecked, setAutoRenewalChecked] = useState(serverAutoRenewal)

  useEffect(() => {
    setAutoRenewalChecked(serverAutoRenewal)
  }, [serverAutoRenewal])

  useEffect(() => {
    if (prices?.data?.length && !selectedPlan) {
      setSelectedPlan(prices.data[0])
    }
  }, [prices, selectedPlan])

  const current = subscription?.data?.[0]

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
    setAutoRenewalChecked(checked)

    try {
      if (checked) {
        await renewAutoRenewal().unwrap()
      } else {
        await cancelAutoRenewal().unwrap()
      }
    } catch {
      setAutoRenewalChecked(!checked)
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
            checked={autoRenewalChecked}
            disabled={isCancelling || isRenewing}
            label={'Auto-Renewal'}
            onCheckedChange={handleAutoRenewalChange}
          />
        </div>
      )}

      {flowStatus === 'polling' && <p>Processing payment...</p>}
      {flowStatus === 'timeout' && <p>Payment confirmation timed out. Please refresh.</p>}

      {flowErrorCode === 'unknown' && <p>Payment confirmation failed. Please try again.</p>}

      {paymentErrorCode === 'unauthorized' && <p>Session expired. Please sign in again.</p>}
      {paymentErrorCode === 'bad_request' && <p>Invalid payment request. Please try again.</p>}
      {paymentErrorCode === 'not_found' && <p>Selected subscription plan was not found.</p>}
      {paymentErrorCode === 'conflict' && <p>This subscription is already active.</p>}
      {paymentErrorCode === 'unknown' && <p>Transaction failed, please try again.</p>}

      <div className={s.section}>
        <span className={s.sectionTitle}>Change your subscription:</span>
        <div className={s.optionsBox}>
          {prices?.data?.map(plan => (
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
