'use client'

import { useEffect } from 'react'

import { Close } from '@ictroot/ui-kit/icons'

import styles from './ImageMessageModal.module.scss'

interface ImageMessageModalProps {
  imageUrl: string
  onClose: () => void
}

export const ImageMessageModal = ({ imageUrl, onClose }: ImageMessageModalProps) => {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [onClose])

  return (
    <div
      className={styles.overlay}
      role={'dialog'}
      aria-modal={'true'}
      aria-label={'Image preview'}
      onClick={onClose}
    >
      <button className={styles.closeButton} type={'button'} aria-label={'Close'} onClick={onClose}>
        <Close size={32} />
      </button>
      <div className={styles.content} onClick={event => event.stopPropagation()}>
        <img className={styles.image} src={imageUrl} alt={'Selected message image'} />
      </div>
    </div>
  )
}
