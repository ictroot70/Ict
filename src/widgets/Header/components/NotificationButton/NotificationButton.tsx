import { showToastAlert } from '@/shared/lib'
import { BellOutline } from '@/shared/ui'

import s from '../../AppHeader.module.scss'

export const NotificationButton = () => (
  <button
    title={'Notification'}
    type={'button'}
    className={s.notificationBtn}
    onClick={() => {
      showToastAlert({
        message: 'Notification is not implemented',
        type: 'info',
        duration: 3000,
        progressBar: true,
        closeable: true,
      })
    }}
  >
    <BellOutline size={24} />
  </button>
)
