'use client'

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
    currentSubscriptions,
    handlePay,
    handlePlanChange,
  } = useAccountManagement()

  const { handleSwitchAutoRenewal, isAutoRenewalChanging } = useAutoRenewalActions()

  /*   useEffect(() => {
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

    if (flowErrorCode === 'unknown') {
      showToastAlert({
        message: 'Payment confirmation failed. Please try again.',
        type: 'error',
      })
    }
  }, [flowStatus, flowErrorCode]) */

  /*   useEffect(() => {
    if (!paymentErrorCode) {
      return
    }

    showToastAlert({
      message: getPaymentErrorMessage(paymentErrorCode),
      type: 'error',
    })
    setPaymentErrorCode(null)
  }, [paymentErrorCode]) */

  /*   const handlePay = async (paymentType: PaymentType) => {
    if (!selectedPlan || isPaymentLocked) {
      return
    }

    setPaymentErrorCode(null)

    try {
      const returnUrl = `${window.location.origin}${pathname}`
      const fresh = await refetch()

      paymentBaseline.set(fresh.data?.data ?? [])

      const result = await createSubscription({
        typeSubscription: selectedPlan.typeDescription,
        paymentType,
        amount: selectedPlan.amount,
        baseUrl: returnUrl,
      }).unwrap()

      paymentPending.set()
      window.location.href = result.url
    } catch (err) {
      paymentPending.clear()
      paymentBaseline.clear()
      setPaymentErrorCode(mapStatusToErrorCode(getErrorStatus(err)))
    }
  } */

  return (
    <div className={s.root}>
      {currentSubscriptions && (
        <div className={s.section}>
          <span className={s.sectionTitle}>Current Subscription:</span>
          <div className={s.infoBox}>
            <div className={s.infoField}>
              Expire at
              <span>{formatDate(currentSubscriptions.endDateOfSubscription)}</span>
            </div>
            <div className={s.infoField}>
              Next payment
              {/* TODO: + 1 Day ?*/}
              <span>{formatDate(currentSubscriptions.endDateOfSubscription)}</span>
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

      {flowStatus === 'polling' && <p>Processing payment...</p>}

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
        variant="outlined"
        disabled={isPaymentLocked || !selectedPlan}
        onClick={() => handlePay(PaymentType.STRIPE)}
      >
        STRIPE
      </Button>
    </div>
  )
}
