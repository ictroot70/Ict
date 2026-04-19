'use client'

import React, { useEffect, useMemo, useRef, useState } from 'react'

import { useAccountManagement, usePaymentModalState } from '@/features/subscriptions/hooks'
import { resolveAccountManagementView, mapPricingToPlans } from '@/features/subscriptions/model'
import {
  AccountTypeValue,
  SubscriptionPlanValue,
  UISubscriptionPlan,
} from '@/features/subscriptions/model/payments.types'
import { BusinessSubscriptionView, PersonalView } from '@/features/subscriptions/ui'
import { Loading } from '@/shared/composites'
import { PaymentType } from '@/shared/types'

import styles from './AccountManagement.module.scss'

import {
  PaymentConfirmationModal,
  PaymentFailureModal,
  PaymentProcessingModal,
  PaymentSuccessModal,
} from '../PaymentModals'

const PROCESSING_MODAL_SHOW_DELAY_MS = 250
const PROCESSING_MODAL_MIN_VISIBLE_MS = 600

export const AccountManagement = () => {
  const {
    flowStatus,
    paymentResultStatus,
    selectedPlan,
    pricingPlans,
    isLoading,
    isPaymentLocked,
    subscriptionQueue,
    handlePay,
    handlePlanChange,
    resetPaymentResult,
  } = useAccountManagement()

  const [selectedAccountType, setSelectedAccountType] = useState<AccountTypeValue>('personal')
  const [isProcessingModalVisible, setIsProcessingModalVisible] = useState(false)
  const [processingShownAt, setProcessingShownAt] = useState<number | null>(null)
  const showProcessingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const hideProcessingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const plans = useMemo<UISubscriptionPlan[]>(() => {
    if (!pricingPlans) {
      return []
    }

    return mapPricingToPlans(pricingPlans)
  }, [pricingPlans])

  const selectedPlanValue = useMemo<SubscriptionPlanValue | undefined>(() => {
    if (!selectedPlan) {
      return undefined
    }

    const uiPlan = plans.find(plan => plan.id === selectedPlan.typeDescription)

    return uiPlan?.value
  }, [plans, selectedPlan])

  const isPaymentDisabled = !selectedPlan || isPaymentLocked

  const {
    modal,
    backToPayment,
    openConfirmModal,
    closeConfirmModal,
    clearPaymentModalState,
    closePaymentResultModal,
  } = usePaymentModalState({ isPaymentDisabled, paymentResultStatus })

  const confirmPayment = async () => {
    clearPaymentModalState()
    resetPaymentResult()

    await handlePay(PaymentType.STRIPE)
  }

  const hasActiveSubscription = subscriptionQueue.length > 0
  const accountType: AccountTypeValue = hasActiveSubscription ? 'business' : selectedAccountType

  const handleAccountTypeChange = (type: AccountTypeValue) => {
    if (hasActiveSubscription && type === 'personal') {
      return
    }

    setSelectedAccountType(type)
  }

  const handlePlanValueChange = (planValue: SubscriptionPlanValue) => {
    if (!pricingPlans?.data?.length) {
      return
    }

    const selectedUiPlan = plans.find(plan => plan.value === planValue)

    if (!selectedUiPlan) {
      return
    }

    const selectedPricingPlan = pricingPlans.data.find(
      plan => plan.typeDescription === selectedUiPlan.id
    )

    if (!selectedPricingPlan) {
      return
    }

    handlePlanChange(selectedPricingPlan)
  }

  const view = resolveAccountManagementView({
    accountType,
    hasActiveSubscription,
  })

  useEffect(() => {
    if (flowStatus === 'polling') {
      if (hideProcessingTimerRef.current) {
        clearTimeout(hideProcessingTimerRef.current)
        hideProcessingTimerRef.current = null
      }

      if (isProcessingModalVisible || showProcessingTimerRef.current) {
        return
      }

      showProcessingTimerRef.current = setTimeout(() => {
        showProcessingTimerRef.current = null
        setIsProcessingModalVisible(true)
        setProcessingShownAt(Date.now())
      }, PROCESSING_MODAL_SHOW_DELAY_MS)

      return
    }

    if (showProcessingTimerRef.current) {
      clearTimeout(showProcessingTimerRef.current)
      showProcessingTimerRef.current = null
    }

    if (!isProcessingModalVisible) {
      return
    }

    const elapsed = processingShownAt ? Date.now() - processingShownAt : 0
    const remainingVisibleTime = Math.max(PROCESSING_MODAL_MIN_VISIBLE_MS - elapsed, 0)

    hideProcessingTimerRef.current = setTimeout(() => {
      hideProcessingTimerRef.current = null
      setIsProcessingModalVisible(false)
      setProcessingShownAt(null)
    }, remainingVisibleTime)
  }, [flowStatus, isProcessingModalVisible, processingShownAt])

  useEffect(() => {
    return () => {
      if (showProcessingTimerRef.current) {
        clearTimeout(showProcessingTimerRef.current)
      }

      if (hideProcessingTimerRef.current) {
        clearTimeout(hideProcessingTimerRef.current)
      }
    }
  }, [])

  if (isLoading && flowStatus !== 'polling') {
    return <Loading />
  }

  return (
    <>
      <div className={styles.accountManagementPage}>
        {view === 'personal' && (
          <PersonalView accountType={accountType} onAccountTypeChange={handleAccountTypeChange} />
        )}

        {(view === 'business-no-subscription' || view === 'business-active-subscription') && (
          <BusinessSubscriptionView
            accountType={accountType}
            onAccountTypeChange={handleAccountTypeChange}
            plans={plans}
            selectedPlan={selectedPlanValue}
            onPlanChange={handlePlanValueChange}
            onStripeClick={openConfirmModal}
            isPaymentLocked={isPaymentLocked}
            hasActiveSubscription={hasActiveSubscription}
          />
        )}
      </div>

      <PaymentConfirmationModal
        open={modal === 'confirm'}
        onClose={closeConfirmModal}
        onConfirm={() => void confirmPayment()}
        isSubmitting={isPaymentLocked}
      />

      <PaymentProcessingModal open={isProcessingModalVisible} />

      <PaymentSuccessModal open={modal === 'success'} onClose={closePaymentResultModal} />

      <PaymentFailureModal
        open={modal === 'failure'}
        onClose={closePaymentResultModal}
        onBackToPayment={backToPayment}
      />
    </>
  )
}
