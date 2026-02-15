import React from 'react'

import { Button, Typography } from '@/shared/ui'

import styles from '../CropStep.module.scss'

interface EmptyStateProps {
  openDialog: () => void
  getInputProps: (props?: any) => any
}

export const EmptyState: React.FC<EmptyStateProps> = ({ openDialog, getInputProps }) => (
  <div className={styles.emptyState}>
    <div className={styles.emptyStateText}>
      <Typography variant={'h1'}>No images selected</Typography>
    </div>
    <div className={styles.emptyStateText}>
      <Typography variant={'regular_14'}>Select a photo to continue cropping.</Typography>
      <Button variant={'outlined'} className={styles.addPhotoBtn} onClick={openDialog}>
        Add Photo
      </Button>
      <input
        {...getInputProps({
          onClick: (event: React.MouseEvent<HTMLInputElement>) => {
            event.currentTarget.value = ''
          },
        })}
      />
    </div>
  </div>
)
