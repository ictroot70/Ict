import { BellOutline } from '@/shared/ui'

import s from '../../Header_v3.module.scss'

export const NotificationButton = () => (
  <button
    title="Notification"
    type="button"
    onClick={() => alert('notification')}
    className={s.notificationBtn}
  >
    <BellOutline size={24} />
  </button>
)
