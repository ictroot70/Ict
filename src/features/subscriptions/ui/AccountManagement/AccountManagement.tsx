'use client'

import {
  AutoRenewModal,
  PaymentFailureModal,
  PaymentSuccessModal,
  SubscriptionPricing,
} from '@/features/subscriptions'
import { useAccountManagement } from '@/features/subscriptions/hooks/useAccountManagement'
import { Button } from '@/shared/ui'
import { useTranslations } from 'next-intl'

export function AccountManagement() {
  const t = useTranslations('subscriptions.account')
  const { modal, setModal, confirmAutoRenew, closeModal, isSubmitting } = useAccountManagement()

  return (
    <>
      <SubscriptionPricing />

      <Button onClick={() => setModal('auto')}>{t('stripe')}</Button>

      <AutoRenewModal
        open={modal === 'auto'}
        onClose={closeModal}
        onConfirm={confirmAutoRenew}
        isSubmitting={isSubmitting}
      />

      <PaymentSuccessModal open={modal === 'success'} onClose={closeModal} />

      <PaymentFailureModal
        open={modal === 'failure'}
        onClose={closeModal}
        onBackToPayment={() => setModal('auto')}
      />
    </>
  )
}
