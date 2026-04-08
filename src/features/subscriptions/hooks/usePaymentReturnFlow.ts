import type { ActiveSubscriptionViewModel } from '@/shared/types/payments/models'

import { useEffect, useRef, useState } from 'react'

import { showToastAlert } from '@/shared/lib'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'

import { parsePaymentReturn } from '../lib'
import { paymentBaseline, paymentPending } from '../model'
import { pollUntilSubscriptionUpdated, type PollOutcome } from '../model/paymentPolling'

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
      setFlowStatus('failed')

      return
    }

    if (returnStatus === null && !isPending) {
      return
    }

    router.replace(pathname)
    paymentPending.clear()

    const baseline = paymentBaseline.get()

    setFlowStatus('polling')

    pollUntilSubscriptionUpdated(fetchSubscriptions, baseline)
      .then((outcome: PollOutcome) => {
        if (outcome === 'success') {
          setFlowStatus('success')

          return
        }

        setFlowStatus('timeout')
      })
      .catch(() => {
        setFlowStatus('failed')
      })
      .finally(() => {
        paymentPending.clear()
        paymentBaseline.clear()
      })
  }, [fetchSubscriptions, pathname, router, searchParams])

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

  const resetFlow = () => {
    handledRef.current = false

    setFlowStatus('idle')
  }

  return {
    resetFlow,
    flowStatus,
    isPolling: flowStatus === 'polling',
  }
}
