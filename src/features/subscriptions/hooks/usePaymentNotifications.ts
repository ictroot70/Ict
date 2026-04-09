import { useEffect } from 'react'

import { showToastAlert } from '@/shared/lib'

import { FlowStatus } from './usePaymentReturnFlow'

export function usePaymentNotifications(flowStatus: FlowStatus) {
  useEffect(() => {
    if (flowStatus === 'timeout') {
      showToastAlert({
        message: 'Payment confirmation timed out. Please refresh.',
        type: 'error',
      })
    }

    if (flowStatus === 'success') {
      showToastAlert({
        message: 'Payment was successful!',
        type: 'success',
      })
    }

    if (flowStatus === 'failed') {
      showToastAlert({
        message: 'Payment failed. Please try again.',
        type: 'error',
      })
    }
  }, [flowStatus])
}
