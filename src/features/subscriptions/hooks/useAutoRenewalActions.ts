import { showToastAlert } from '@/shared/lib'
import { useCancelAutoRenewalMutation, useRenewAutoRenewalMutation } from '../api'

export function useAutoRenewalActions() {
  const [cancelAutoRenewal, { isLoading: isCancelling }] = useCancelAutoRenewalMutation()
  const [renewAutoRenewal, { isLoading: isRenewing }] = useRenewAutoRenewalMutation()

  const isAutoRenewalChanging = isCancelling || isRenewing

  const handleSwitchAutoRenewal = async (checked: boolean) => {
    try {
      checked ? await renewAutoRenewal().unwrap() : await cancelAutoRenewal().unwrap()
    } catch {
      showToastAlert({
        message: 'Auto-renewal update failed',
        type: 'error',
      })
    }
  }

  return { handleSwitchAutoRenewal, isAutoRenewalChanging }
}
