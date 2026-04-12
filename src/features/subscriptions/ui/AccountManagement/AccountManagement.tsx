'use client'

import React from 'react'

import {
  PaymentConfirmationModal,
  PaymentFailureModal,
  PaymentSuccessModal,
} from '@/features/subscriptions'
import { useAccountManagement, useAutoRenewalActions } from '@/features/subscriptions/hooks'
import { mapSubscriptionTypeToLabel } from '@/features/subscriptions/model'
import { formatDate } from '@/shared/lib'
import { PaymentType } from '@/shared/types'
import { Button, CheckboxRadix } from '@/shared/ui'
import { useTranslations } from 'next-intl'

import s from './AccountManagement.module.scss'

import { usePaymentModalState } from '../../hooks/usePaymentModalState'
export function AccountManagement() {
  const {
    flowStatus,
    paymentResultStatus,
    selectedPlan,
    pricingPlans,
    isPaymentLocked,
    isAutoRenewEnabled,
    currentSubscription,
    handlePay,
    handlePlanChange,
    resetPaymentResult,
  } = useAccountManagement()

  const t = useTranslations('subscriptions.account')
  const { handleSwitchAutoRenewal, isAutoRenewalChanging } = useAutoRenewalActions()

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

  return (
    <>
      <div className={s.root}>
        {flowStatus === 'polling' && <p>Processing payment...</p>}
        {currentSubscription && (
          <div className={s.section}>
            <span className={s.sectionTitle}>Current Subscription:</span>
            <div className={s.infoBox}>
              <div className={s.infoField}>
                Expire at
                <span>{formatDate(currentSubscription.endDateOfSubscription)}</span>
              </div>
              <div className={s.infoField}>
                {currentSubscription.autoRenewal ? 'Next payment' : 'Subscription ends'}
                <span>{formatDate(currentSubscription.endDateOfSubscription)}</span>
              </div>
            </div>

            <CheckboxRadix
              label={'Auto-Renewal'}
              checked={isAutoRenewEnabled}
              disabled={isAutoRenewalChanging}
              onCheckedChange={handleSwitchAutoRenewal}
            />
          </div>
        )}
        <div className={s.section}>
          <span className={s.sectionTitle}>Change your subscription:</span>
          <div className={s.optionsBox}>
            {pricingPlans?.data?.map(plan => (
              <label key={plan.typeDescription} className={s.radioRow}>
                <input
                  checked={selectedPlan?.typeDescription === plan.typeDescription}
                  className={s.radioInput}
                  disabled={isPaymentLocked}
                  name={'plan'}
                  type={'radio'}
                  onChange={() => handlePlanChange(plan)}
                />
                ${plan.amount} per {mapSubscriptionTypeToLabel(plan.typeDescription)}
              </label>
            ))}
          </div>
        </div>

        <Button
          variant={'outlined'}
          disabled={isPaymentLocked || !selectedPlan}
          onClick={openConfirmModal}
        >
          {t('stripe')}
        </Button>
      </div>

      <PaymentConfirmationModal
        open={modal === 'confirm'}
        onClose={closeConfirmModal}
        onConfirm={confirmPayment}
        isSubmitting={isPaymentLocked}
      />
      <PaymentSuccessModal open={modal === 'success'} onClose={closePaymentResultModal} />

      <PaymentFailureModal
        open={modal === 'failure'}
        onClose={closePaymentResultModal}
        onBackToPayment={backToPayment}
      />
    </>
  )
}
