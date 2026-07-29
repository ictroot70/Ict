'use client'

import { Button, Close } from '@/shared/ui'

import styles from './ImagePreview.module.scss'

type ImagePreviewProps = {
  previewUrl: string
  onRemove: () => void
}

export function ImagePreview({ previewUrl, onRemove }: ImagePreviewProps) {
  return (
    <div className={styles.previewItem}>
      <img src={previewUrl} alt={'Selected image'} className={styles.image} />

      <Button type={'button'} variant={'text'} onClick={onRemove} className={styles.removeButton}>
        <Close size={16} />
      </Button>
    </div>
  )
}
