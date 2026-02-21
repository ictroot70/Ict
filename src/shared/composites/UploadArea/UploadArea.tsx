'use client'

import React from 'react'

import { Button, Card, ImageOutline } from '@/shared/ui'

import styles from './UploadArea.module.scss'

interface UploadAreaProps {
  getRootProps: () => any
  getInputProps: (props?: any) => any
  openDialog: () => void
  error?: string | null

  primaryLabel?: string
  showDraft?: boolean
  onOpenDraft?: () => void
  showCamera?: boolean
  onCameraClick?: () => void
}

export const UploadArea: React.FC<UploadAreaProps> = ({
  getRootProps,
  getInputProps,
  openDialog,
  error,
  primaryLabel = 'Select from Computer',
  showDraft,
  onOpenDraft,
  showCamera = false,
  onCameraClick,
}) => {
  return (
    <div className={styles.wrapper}>
      <Card {...getRootProps()} className={styles.dropzone}>
        <input
          {...getInputProps({
            onClick: (e: React.MouseEvent<HTMLInputElement>) => {
              e.currentTarget.value = ''
            },
          })}
        />
        <ImageOutline size={48} />
      </Card>

      {/*{error && <p className={styles.error}>{error}</p>}*/}

      <div className={styles.actions}>
        <Button variant={'primary'} onClick={openDialog}>
          {primaryLabel}
        </Button>

        {showCamera && onCameraClick && (
          <Button variant={'outlined'} onClick={onCameraClick}>
            {'Take Photo'}
          </Button>
        )}

        {showDraft && (
          <Button variant={'outlined'} onClick={onOpenDraft}>
            Open Draft
          </Button>
        )}
      </div>
    </div>
  )
}
