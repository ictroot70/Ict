import { useEffect, useState } from 'react'

import { AccountModal, PaymentFlowStatus } from '../model'

type Props = {
  paymentResultStatus: PaymentFlowStatus
  isPaymentDisabled: boolean
}

export function usePaymentModalState({ isPaymentDisabled, paymentResultStatus }: Props) {
  const [modal, setModal] = useState<AccountModal>(null)
  const [handledPaymentResult, setHandledPaymentResult] = useState(false)

  const clearPaymentModalState = () => {
    setModal(null)
    setHandledPaymentResult(false)
  }

  useEffect(() => {
    if (handledPaymentResult) {
      return
    }
    if (paymentResultStatus === 'success') {
      setModal('success')
    }
    if (paymentResultStatus === 'failure') {
      setModal('failure')
    }
  }, [handledPaymentResult, paymentResultStatus])

  const openConfirmModal = () => {
    if (isPaymentDisabled) {
      return
    }

    setModal('confirm')
  }

  const closeConfirmModal = () => {
    setModal(current => (current === 'confirm' ? null : current))
  }

  const closePaymentResultModal = () => {
    setModal(null)
    setHandledPaymentResult(true)
  }

  const backToPayment = () => {
    if (isPaymentDisabled) {
      return
    }

    setHandledPaymentResult(true)
    setModal('confirm')
  }

  return {
    modal,
    backToPayment,
    openConfirmModal,
    closeConfirmModal,
    clearPaymentModalState,
    closePaymentResultModal,
  }
}
