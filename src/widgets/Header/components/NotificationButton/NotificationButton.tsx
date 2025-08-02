import { showToastAlert } from '@/shared/lib'
import { BellOutline } from '@/shared/ui'

export const NotificationButton = () => (
  <button
    title={'Notification'}
    type={'button'}
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
