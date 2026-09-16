'use client'

import type { DropzoneState } from 'react-dropzone'

import React from 'react'

import { Button, Card, ImageOutline } from '@/shared/ui'

import styles from './UploadArea.module.scss'

interface UploadAreaProps {
  getRootProps: DropzoneState['getRootProps']
  getInputProps: DropzoneState['getInputProps']
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
  const openFileDialog = () => openDialog()

  return (
    <div className={styles.wrapper}>
      <Card
        {...getRootProps({
          onClick: openFileDialog,
          onKeyDown: (e: React.KeyboardEvent<HTMLElement>) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault()
              openFileDialog()
            }
          },
        })}
        className={styles.dropzone}
      >
        <input
          {...getInputProps({
            onClick: (e: React.MouseEvent<HTMLInputElement>) => {
              e.stopPropagation()
              e.currentTarget.value = ''
            },
          })}
        />
        <div className={styles.iconWrapper} aria-hidden={'true'}>
          <ImageOutline size={48} />
        </div>
      </Card>

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
