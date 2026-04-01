'use client'

import { useEffect, useState } from 'react'

import { usePaymentFlow } from '@/features/subscriptions/hooks'

type AccountModal = null | 'auto' | 'success' | 'failure'

export function useAccountManagement() {
  const [modal, setModal] = useState<AccountModal>(null)
  const { flowStatus, flowErrorCode, isStarting, startPayment, resetFlow } = usePaymentFlow()

  useEffect(() => {
    if (flowStatus === 'success') {
      setModal('success')
    }
    if (flowStatus === 'failure') {
      setModal('failure')
    }
  }, [flowStatus])

  const confirmAutoRenew = async () => {
    await startPayment()
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
