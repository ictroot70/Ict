'use client'
import React from 'react'

import { UploadArea } from '@/shared/composites/UploadArea/UploadArea'

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

export const UploadStep = ({
  files,
  setFiles,
  openDialog,
  getRootProps,
  getInputProps,
  error,
  onNext,
}: Props) => {
  return (
    <UploadArea
      getRootProps={getRootProps}
      getInputProps={getInputProps}
      openDialog={openDialog}
      error={error}
      showDraft
      onOpenDraft={() => {
        // draft logic
      }}
    />
  )
}
