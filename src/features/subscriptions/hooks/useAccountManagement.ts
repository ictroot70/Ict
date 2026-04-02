'use client'

import { useEffect, useState } from 'react'

import { AccountModal } from '@/features/subscriptions/model'
import { APP_ROUTES } from '@/shared/constant'
import { PaymentType, SubscriptionType } from '@/shared/types'
import { useParams } from 'next/navigation'

import { usePaymentFlow } from './usePaymentFlow'

export function useAccountManagement() {
  const [modal, setModal] = useState<AccountModal>(null)
  const { flowStatus, flowErrorCode, isStarting, startPayment, resetFlow } = usePaymentFlow()

  const params = useParams<{ id: string }>()
  const accountPath = APP_ROUTES.PROFILE.ACCOUNT(Number(params.id))

  useEffect(() => {
    if (flowStatus === 'success') {
      setModal('success')
    }
    if (flowStatus === 'failure') {
      setModal('failure')
    }
  }, [flowStatus])

  const confirmAutoRenew = async () => {
    await startPayment({
      amount: 10, // TODO(T2): selectedPlan.amount
      paymentType: PaymentType.STRIPE, // TODO(T2): selected payment method
      typeSubscription: SubscriptionType.DAY, // TODO(T2): selected plan type
      baseUrl: `${window.location.origin}${accountPath}`,
    })
  }

  const closeModal = () => {
    setModal(null)
    resetFlow()
  }

  return {
    modal,
    setModal,
    confirmAutoRenew,
    closeModal,
    isSubmitting: isStarting,
    flowErrorCode,
  }
}
