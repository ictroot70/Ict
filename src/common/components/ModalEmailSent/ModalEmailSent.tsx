import Modal from '../Modal/Modal'

type Props = {
  email: string
  isOpen: boolean
  onClose: () => void
}

const ModalEmailSent = ({ email, isOpen, onClose }: Props) => {
  const title = 'Email sent'
  const message = `We have sent a link to confirm your email to ${email}`

  const modalProps = { title, message, isOpen, onClose }

  return <Modal {...modalProps} />
}

export default ModalEmailSent
