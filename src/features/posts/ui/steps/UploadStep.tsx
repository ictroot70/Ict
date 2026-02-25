'use client'
import React from 'react'

import { ImageOutline, Card, Button } from '@/shared/ui'

import styles from './UploadStep.module.scss'

import { UploadedFile } from '../../model/types'

interface Props {
  onNext: () => void
  files: UploadedFile[]
  setFiles: React.Dispatch<React.SetStateAction<UploadedFile[]>>
  openDialog: () => void
  getRootProps: () => any
  getInputProps: (props?: any) => any
  error: string | null
}

export const UploadStep: React.FC<Props> = ({ openDialog, getRootProps, getInputProps, error }) => {
  return (
    <div className={styles.wrapper}>
      <Card {...getRootProps()} className={styles.dropzone} onClick={openDialog}>
        <input
          {...getInputProps({
            onClick: (event: React.MouseEvent<HTMLInputElement>) => {
              event.currentTarget.value = ''
            },
          })}
        />
        <div className={styles.iconWrapper}>
          <ImageOutline size={48} />
        </div>
      </Card>

      {error && <p className={styles.error}>{error}</p>}

      <div className={styles.actions}>
        <Button variant={'primary'} className={styles.primaryBtn} onClick={openDialog}>
          Select from Computer
        </Button>
        <Button variant={'outlined'} className={styles.secondaryBtn} type={'button'}>
          Open Draft
        </Button>
      </div>
    </div>
  )
}
