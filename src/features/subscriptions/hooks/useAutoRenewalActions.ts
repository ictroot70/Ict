import { showToastAlert } from '@/shared/lib'

import { useCancelAutoRenewalMutation, useRenewAutoRenewalMutation } from '../api'

export function useAutoRenewalActions() {
  const [cancelAutoRenewal, { isLoading: isCancelling }] = useCancelAutoRenewalMutation()
  const [renewAutoRenewal, { isLoading: isRenewing }] = useRenewAutoRenewalMutation()

  const isAutoRenewalChanging = isCancelling || isRenewing

  const handleSwitchAutoRenewal = async (checked: boolean) => {
    if (isAutoRenewalChanging) {
      return
    }

    try {
      const action = checked ? renewAutoRenewal : cancelAutoRenewal

      await action().unwrap()
    } catch (error) {
      showToastAlert({
        message: 'Auto-renewal update failed',
        type: 'error',
      })
      console.error('Failed to update auto-renewal:', error)
    }
  }

  return { handleSwitchAutoRenewal, isAutoRenewalChanging }
}
