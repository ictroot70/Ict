'use client'
import React from 'react'

import { useImageDropzone } from '@/features/posts/hooks'
import { useCreatePostFlow } from '@/features/posts/model'
import { CropStep } from '@/features/posts/ui/steps/CropStep/CropStep'
import { FilterStep } from '@/features/posts/ui/steps/FilterStep'
import { PostViewModel } from '@/shared/types'
import { Button, Modal, Typography } from '@/shared/ui'
import { clsx } from 'clsx'

import styles from './CreatePostForm.module.scss'

import { PublishStep } from './steps/PublishStep'
import { UploadStep } from './steps/UploadStep'

interface Props {
  open: boolean
  onClose: () => void
  onPublishPost: (post: PostViewModel) => void
}

const CreatePost: React.FC<Props> = ({ open, onClose, onPublishPost }) => {
  const {
    step,
    setStep,
    files,
    setFiles,
    filtersState,
    setFiltersState,
    description,
    setDescription,
    showConfirmModal,
    isFilterProcessing,
    isUploading,
    uploadStage,
    uploadErrorActionHint,
    uploadError,
    canPublish,
    actions,
    isPublishing,
  } = useCreatePostFlow({
    onCloseAction: onClose,
    onPublishPostAction: onPublishPost,
  })

  const {
    open: openDialog,
    getRootProps,
    getInputProps,
    error,
  } = useImageDropzone(files, setFiles, () => setStep('crop'))

  const showModalTitle = step === 'upload'
  const isWideStep = step === 'filter' || step === 'publish'

  return (
    <>
      <Modal
        open={open}
        onClose={actions.onModalCloseRequest}
        modalTitle={showModalTitle ? 'Add Photo' : ''}
        className={clsx(styles.modal, isWideStep && styles.filterStep)}
      >
        {step === 'upload' && (
          <UploadStep
            onNext={() => setStep('crop')}
            files={files}
            setFiles={setFiles}
            openDialog={openDialog}
            getRootProps={getRootProps}
            getInputProps={getInputProps}
            error={error}
          />
        )}

        {step === 'crop' && (
          <CropStep
            onPrev={() => setStep('upload')}
            onNext={() => setStep('filter')}
            files={files}
            setFiles={setFiles}
            openDialog={openDialog}
            getInputProps={getInputProps}
          />
        )}

        {step === 'filter' && (
          <FilterStep
            onPrev={() => setStep('crop')}
            onNext={actions.onFilterDone}
            isProcessing={isFilterProcessing}
            files={files}
            filtersState={filtersState}
            setFiltersState={setFiltersState}
          />
        )}

        {step === 'publish' && (
          <PublishStep
            onPrev={actions.onBackFromPublish}
            onPublish={actions.onPublish}
            files={files}
            filtersState={filtersState}
            description={description}
            setDescription={setDescription}
            isUploading={isUploading}
            uploadStage={uploadStage}
            uploadErrorActionHint={uploadErrorActionHint}
            uploadError={uploadError}
            canPublish={canPublish}
            isPublishing={isPublishing}
          />
        )}
      </Modal>

      <Modal
        className={styles.confirmModal}
        open={showConfirmModal}
        modalTitle={'Сlose'}
        onClose={actions.onCancelClose}
      >
        <Typography variant={'regular_16'} className={styles.confirmModalText}>
          Do you really want to close the creation of a publication? <br /> If you close everything
          will be deleted
        </Typography>
        <div className={styles.confirmModalButtons}>
          <Button variant={'outlined'} onClick={actions.onCancelClose}>
            Discard
          </Button>
          <Button variant={'primary'} onClick={actions.onConfirmClose}>
            Save draft
          </Button>
        </div>
      </Modal>
    </>
  )
}

export default CreatePost
