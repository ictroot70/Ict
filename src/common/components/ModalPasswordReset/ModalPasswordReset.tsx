import Modal from '../Modal/Modal'

type Props = {
  isOpen: boolean
  onClose: () => void
}

const ModalPasswordReset = ({ isOpen, onClose }: Props) => {
  const title = 'Password restored'
  const message =
    'Great news! Your password has been successfully recovered and reset. You can now sign in to your account using your new password.'

  const modalProps = { title, message, isOpen, onClose }

  return <Modal {...modalProps} />
}

export default ModalPasswordReset
