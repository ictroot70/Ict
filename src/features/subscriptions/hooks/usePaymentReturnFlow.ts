import type { ActiveSubscriptionViewModel } from '@/shared/types/payments/models'

import { useEffect, useRef, useState } from 'react'

import { usePathname, useRouter, useSearchParams } from 'next/navigation'

import { parsePaymentReturn } from '../lib'
import { paymentBaseline, paymentPending } from '../model'
import { waitForSubscriptionUpdate } from '../model/paymentPolling'
import { usePaymentNotifications } from './usePaymentNotifications'

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

  const clearPaymentState = () => {
    paymentPending.clear()
    paymentBaseline.clear()
  }

  useEffect(() => {
    if (handledRef.current) {
      return
    }

    handledRef.current = true

    const returnStatus = parsePaymentReturn(searchParams)
    const isPending = paymentPending.get()

    if (returnStatus === null) {
      if (!isPending) {
        return
      }

      router.replace(pathname)
      clearPaymentState()
      setFlowStatus('failed')

      return
    }

    router.replace(pathname)

    if (returnStatus === 'failed' || !isPending) {
      clearPaymentState()
      setFlowStatus('failed')

      return
    }

    paymentPending.clear()

    const baseline = paymentBaseline.get()

    setFlowStatus('polling')

    waitForSubscriptionUpdate(fetchSubscriptions, baseline)
      .then(outcome => {
        setFlowStatus(outcome === 'success' ? 'success' : 'timeout')
      })
      .catch(() => {
        setFlowStatus('failed')
      })
      .finally(() => {
        clearPaymentState()
      })
  }, [fetchSubscriptions, pathname, router, searchParams])

  usePaymentNotifications(flowStatus)

  return {
    flowStatus,
    isPolling: flowStatus === 'polling',
    clearPaymentState,
  }
}
