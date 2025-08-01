import { BellOutline } from '@/shared/ui'

export const NotificationButton = () => (
  <button title={'Notification'} type={'button'} onClick={() => alert('notification')}>
    <BellOutline size={24} />
  </button>
)
