'use client'

import React, { useEffect, useState } from 'react'

import { CameraCapture, shouldShowCameraButton } from '@/features/profile/avatar-upload'
import { ToastAlert, UploadArea } from '@/shared/composites'
import { Modal } from '@/shared/ui'

import s from './UploadStep.module.scss'

interface UploadStepProps {
  getRootProps: () => any
  getInputProps: (props?: any) => any
  openDialog: () => void
  error: string | null
  onErrorClose: () => void
  onFileSelect?: (file: File) => void
  parentModalOpen?: boolean
}

export function UploadStep({
  getRootProps,
  getInputProps,
  openDialog,
  error,
  onErrorClose,
  onFileSelect,
  parentModalOpen = true,
}: UploadStepProps) {
  const [isCameraModalOpen, setIsCameraModalOpen] = useState(false)

  useEffect(() => {
    if (!parentModalOpen) {
      setIsCameraModalOpen(false)
    }
  }, [parentModalOpen])

  const handleCameraCapture = (file: File) => {
    setIsCameraModalOpen(false)

    setTimeout(() => {
      if (onFileSelect) {
        onFileSelect(file)
      }
    }, 100)
  }

  const handleCameraClose = () => {
    setIsCameraModalOpen(false)
  }

  const handleCameraClick = () => {
    setIsCameraModalOpen(true)
  }

  return (
    <>
      {error && (
        <ToastAlert
          type={'error'}
          message={error}
          closeable
          progressBar={false}
          onRequestClose={onErrorClose}
        />
      )}
      <UploadArea
        getRootProps={getRootProps}
        getInputProps={getInputProps}
        openDialog={openDialog}
        error={error}
        showCamera={shouldShowCameraButton() && !!onFileSelect}
        onCameraClick={handleCameraClick}
      />

      <Modal
        className={s.modal}
        open={isCameraModalOpen}
        onClose={handleCameraClose}
        modalTitle={'Take a Photo'}
      >
        <CameraCapture
          className={s.cameraCapture}
          isOpen={isCameraModalOpen}
          onCapture={handleCameraCapture}
          onClose={handleCameraClose}
        />
      </Modal>
    </>
  )
}
