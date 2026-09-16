'use client'

import { ReactNode } from 'react'

import { Button, Close } from '@/shared/ui'

import styles from './ImagePreview.module.scss'

type ImagePreviewProps = {
  previewUrl: string
  onRemove: () => void
  disabled?: boolean
  addSlot?: ReactNode
}

export function ImagePreview({ previewUrl, onRemove, disabled, addSlot }: ImagePreviewProps) {
  return (
    <div className={styles.preview}>
      <div className={styles.previewItem}>
        <img src={previewUrl} alt={'Selected image'} className={styles.image} />

        <Button
          type={'button'}
          variant={'text'}
          onClick={onRemove}
          disabled={disabled}
          className={styles.removeButton}
        >
          <Close size={16} />
        </Button>
      </div>
      {addSlot}
    </div>
  )
}
