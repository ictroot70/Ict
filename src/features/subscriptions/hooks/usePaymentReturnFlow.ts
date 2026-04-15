import type { ActiveSubscriptionViewModel } from '@/shared/types/payments/models'

import { useCallback, useEffect, useRef, useState } from 'react'

import { usePathname, useRouter, useSearchParams } from 'next/navigation'

import { parsePaymentReturn } from '../lib'
import { paymentBaseline, paymentPending } from '../model'
import { waitForSubscriptionUpdate } from '../model/paymentPolling'

export type FlowStatus = 'idle' | 'polling' | 'success' | 'failed' | 'timeout'

type Props = {
  fetchSubscriptions: () => Promise<ActiveSubscriptionViewModel[]>
}

export function usePaymentReturnFlow({ fetchSubscriptions }: Props) {
  const searchParams = useSearchParams()
  const pathname = usePathname()
  const router = useRouter()

  const [flowStatus, setFlowStatus] = useState<FlowStatus>('idle')
  const handledRef = useRef(false)

  const resetFlowStatus = () => {
    setFlowStatus('idle')
  }

  const clearPaymentState = useCallback(() => {
    paymentPending.clear()
    paymentBaseline.clear()
  }, [])

  const startPolling = useCallback(() => {
    const baseline = paymentBaseline.get()

    setFlowStatus('polling')

    waitForSubscriptionUpdate(fetchSubscriptions, baseline)
      .then(setFlowStatus)
      .catch(() => setFlowStatus('failed'))
      .finally(clearPaymentState)
  }, [fetchSubscriptions, clearPaymentState])

  useEffect(() => {
    if (handledRef.current) {
      return
    }
    handledRef.current = true

    const returnStatus = parsePaymentReturn(searchParams)
    const isPending = paymentPending.get()

    if (returnStatus !== null) {
      router.replace(pathname)
    }

    if (returnStatus === null && !isPending) {
      return
    }

    if (returnStatus === null && isPending) {
      startPolling()

      return
    }

    if (returnStatus === 'failed' || !isPending) {
      clearPaymentState()
      setFlowStatus('failed')

      return
    }

    paymentPending.clear()
    startPolling()
  }, [fetchSubscriptions, startPolling, clearPaymentState, pathname, router, searchParams])

  return {
    flowStatus,
    isPolling: flowStatus === 'polling',
    clearPaymentState,
    resetFlowStatus,
  }
}
