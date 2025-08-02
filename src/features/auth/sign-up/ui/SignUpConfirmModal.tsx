import { ActionConfirmModal } from '@/shared/composites'

type Props = {
  open: boolean
  onClose: () => void
  userEmail?: string
}

export const SignUpConfirmModal = ({ open, onClose, userEmail }: Props) => (
  <ActionConfirmModal
    open={open}
    onClose={onClose}
    title={'Email sent'}
    highlightedText={userEmail || ''}
    message={'We have sent a link to confirm your email to'}
    confirmButton={{
      label: 'OK',
      variant: 'primary',
      onClick: onClose,
    }}
    width={'378px'}
    height={'228px'}
  />
)
