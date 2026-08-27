'use client'

import type { AvatarUploadProps } from '@/features/profile/avatar-upload/model/types'

import React from 'react'

import { useAvatarUpload } from '@/features/profile/avatar-upload/model'
import { Button, Modal } from '@/shared/ui'

import s from './AvatarUpload.module.scss'

import { AvatarPreview } from '../AvatarPreview'
import { CropStep } from '../CropStep'
import { DeleteAvatarModal } from '../DeleteModal'
import { UploadStep } from '../UploadStep'

export function AvatarUpload({
  value,
  onUpload,
  onDelete,
  isLoading = false,
}: Readonly<AvatarUploadProps>) {
  const {
    state,
    dispatch,
    cropperRef,
    getRootProps,
    getInputProps,
    open,
    handleConfirm,
    handleDeleteConfirm,
    handleZoomChange,
    handleCropUpdate,
    handleCloseModal,
    handleClearError,
  } = useAvatarUpload({ onUpload, onDelete })

  const handleOpenModal = () => {
    dispatch({ type: 'OPEN_MODAL' })
  }

  const handleOpenDeleteModal = () => {
    dispatch({ type: 'OPEN_DELETE_MODAL' })
  }

  const handleCameraCapture = (file: File) => {
    if (state.previewUrl) {
      URL.revokeObjectURL(state.previewUrl)
    }

    const url = URL.createObjectURL(file)

    dispatch({ type: 'SET_FILE', file, previewUrl: url })
  }

  return (
    <>
      <div className={s.container}>
        <AvatarPreview
          value={value}
          isSubmitting={state.isSubmitting}
          isLoading={isLoading}
          onDeleteClick={handleOpenDeleteModal}
        />

        <div className={s.selectBtnContainer}>
          <Button
            type={'button'}
            variant={'outlined'}
            onClick={handleOpenModal}
            disabled={isLoading || state.isSubmitting}
          >
            Select Profile Photo
          </Button>
        </div>
      </div>

      <Modal
        className={s.modal}
        modalTitle={state.step === 'upload' ? 'Add a Profile Photo' : 'Crop Photo'}
        open={state.isModalOpen}
        onClose={handleCloseModal}
      >
        {state.step === 'upload' && (
          <UploadStep
            getRootProps={getRootProps}
            getInputProps={getInputProps}
            openDialog={open}
            error={state.error}
            onErrorClose={handleClearError}
            onFileSelect={handleCameraCapture}
            parentModalOpen={state.isModalOpen}
          />
        )}

        {state.step === 'crop' && state.previewUrl && (
          <CropStep
            previewUrl={state.previewUrl}
            croppedPreview={state.croppedPreview}
            zoom={state.zoom}
            cropperRef={cropperRef}
            onZoomChange={handleZoomChange}
            onCropUpdate={handleCropUpdate}
            onConfirm={handleConfirm}
            isLoading={state.isSubmitting}
          />
        )}
      </Modal>

      <DeleteAvatarModal
        isOpen={state.isDeleteModalOpen}
        isSubmitting={state.isSubmitting}
        onClose={() => dispatch({ type: 'CLOSE_DELETE_MODAL' })}
        onConfirm={handleDeleteConfirm}
      />
    </>
  )
}
