'use client'
import React from 'react'
import { UploadedFile } from '../../model/types'
import styles from './UploadStep.module.scss'
import { ImageOutline } from '@/shared/ui/SVGComponents'

interface Props {
  onNext: () => void
  files: UploadedFile[]
  setFiles: React.Dispatch<React.SetStateAction<UploadedFile[]>>
  openDialog: () => void
  getRootProps: () => any
  getInputProps: (props?: any) => any
  error: string | null
}

export const UploadStep: React.FC<Props> = ({
  openDialog,
  getRootProps,
  getInputProps,
  error,
}) => {
  return (
    <div className={styles.wrapper}>
      <div {...getRootProps()} className={styles.dropzone}>
        <input
          {...getInputProps({
            onClick: (event: React.MouseEvent<HTMLInputElement>) => {
              event.currentTarget.value = ''
            },
          })}
        />
        <div className={styles.iconWrapper}>
          <ImageOutline />
        </div>
      </div>

      {error && <p className={styles.error}>{error}</p>}

      <div className={styles.actions}>
        <button type="button" className={styles.primaryBtn} onClick={openDialog}>
          Select from Computer
        </button>
        <button className={styles.secondaryBtn} type="button">
          Open Draft
        </button>
      </div>
    </div>
  )
}
