'use client'

import React from 'react'

import { useAccountManagement, useAutoRenewalActions } from '@/features/subscriptions/hooks'
import { mapSubscriptionTypeToLabel } from '@/features/subscriptions/model'
import { formatDate } from '@/shared/lib'
import { PaymentType } from '@/shared/types'
import { Button, CheckboxRadix } from '@/shared/ui'

import s from './AccountManagement.module.scss'

export function AccountManagement() {
  const {
    flowStatus,
    selectedPlan,
    pricingPlans,
    isPaymentLocked,
    isAutoRenewEnabled,
    currentSubscription,
    handlePay,
    handlePlanChange,
  } = useAccountManagement()

  const { handleSwitchAutoRenewal, isAutoRenewalChanging } = useAutoRenewalActions()

  if (flowStatus === 'polling') {
    return <p>Processing payment...</p>
  }

  return (
    <div className={s.root}>
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
        onClick={() => handlePay(PaymentType.STRIPE)}
      >
        STRIPE
      </Button>
    </div>
  )
}
