'use client'

import { Modal } from '@/shared/ui'

import styles from './ImageMessageModal.module.scss'

interface ImageMessageModalProps {
  imageUrl: string
  onClose: () => void
}

export const ImageMessageModal = ({ imageUrl, onClose }: ImageMessageModalProps) => {
  return (
    <Modal open={true} onClose={onClose} closeBtnOutside className={styles.modal}>
      <img className={styles.image} src={imageUrl} alt={'Selected message image'} />
    </Modal>
  )
}
