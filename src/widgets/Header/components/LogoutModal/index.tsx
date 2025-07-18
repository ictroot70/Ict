import { ActionConfirmModal } from '@/shared/ui/Modal/ActionConfirmModal/ActionConfirmModal'

type Props = {
  open: boolean
  onClose: () => void
  onConfirm: () => void
  userEmail?: string
}

export const LogoutModal = ({ open, onClose, onConfirm, userEmail }: Props) => (
  <ActionConfirmModal
    open={open}
    onClose={onClose}
    title="Log Out"
    message="Are you really want to log out of your account"
    highlightedText={userEmail || ''}
    confirmButton={{ label: 'Yes', onClick: onConfirm }}
    cancelButton={{ label: 'No', onClick: onClose }}
  />
)
