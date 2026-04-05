import type { ActiveSubscriptionViewModel } from '@/shared/types/payments/models'

import { useEffect, useRef, useState } from 'react'

import { usePathname, useRouter, useSearchParams } from 'next/navigation'

import { parsePaymentReturn, paymentPending, paymentBaseline, type PaymentErrorCode } from '../lib'
import { pollUntilSubscriptionUpdated, type PollOutcome } from '../lib/paymentPolling'

export type FlowStatus = 'idle' | 'polling' | 'success' | 'failed' | 'timeout'

interface UsePaymentReturnFlowOptions {
  fetchSubscriptions: () => Promise<ActiveSubscriptionViewModel[]>
}

interface UsePaymentReturnFlowResult {
  flowStatus: FlowStatus
  flowErrorCode: PaymentErrorCode | null
  isPolling: boolean
  resetFlow: () => void
}

export function usePaymentReturnFlow({
  fetchSubscriptions,
}: UsePaymentReturnFlowOptions): UsePaymentReturnFlowResult {
  const searchParams = useSearchParams()
  const pathname = usePathname()
  const router = useRouter()

  const [flowStatus, setFlowStatus] = useState<FlowStatus>('idle')
  const [flowErrorCode, setFlowErrorCode] = useState<PaymentErrorCode | null>(null)
  const handledRef = useRef(false)

  useEffect(() => {
    if (handledRef.current) {
      return
    }
    handledRef.current = true

    const returnStatus = parsePaymentReturn(searchParams)
    const isPending = paymentPending.get()

    if (returnStatus === 'failed') {
      router.replace(pathname)
      paymentPending.clear()
      paymentBaseline.clear()
      setFlowErrorCode('unknown')
      setFlowStatus('failed')

      return
    }

    if (returnStatus === null && !isPending) {
      return
    }

    router.replace(pathname)
    paymentPending.clear()

    const baseline = paymentBaseline.get()

    setFlowErrorCode(null)
    setFlowStatus('polling')

    pollUntilSubscriptionUpdated(fetchSubscriptions, baseline)
      .then((outcome: PollOutcome) => {
        if (outcome === 'success') {
          setFlowErrorCode(null)
          setFlowStatus('success')

          return
        }

        setFlowErrorCode(null)
        setFlowStatus('timeout')
      })
      .catch(() => {
        setFlowErrorCode('unknown')
        setFlowStatus('failed')
      })
      .finally(() => {
        paymentPending.clear()
        paymentBaseline.clear()
      })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const resetFlow = () => {
    handledRef.current = false
    setFlowErrorCode(null)
    setFlowStatus('idle')
  }

  return {
    flowStatus,
    flowErrorCode,
    isPolling: flowStatus === 'polling',
    resetFlow,
  }
}
