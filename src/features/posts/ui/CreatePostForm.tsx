'use client'
import React, { useState } from 'react'

import { useCreatePostMutation, useUploadImageMutation } from '@/entities/posts/api/postApi'
import { useCreatePost, useImageDropzone } from '@/features/posts/hooks'
import { FilterName } from '@/features/posts/lib/constants/filter-configs'
import { CropStep } from '@/features/posts/ui/steps/CropStep/CropStep'
import { FilterStep } from '@/features/posts/ui/steps/FilterStep'
import { PostImageViewModel, PostViewModel } from '@/shared/types'
import { Button, Modal, Typography } from '@/shared/ui'
import { clsx } from 'clsx'
import { useParams } from 'next/navigation'

import styles from './CreatePostForm.module.scss'

import { PublishStep } from './steps/PublishStep'
import { UploadStep } from './steps/UploadStep'

interface Props {
  open: boolean
  onClose: () => void
  onPublishPost: (post: PostViewModel) => void
}

const CreatePost: React.FC<Props> = ({ open, onClose, onPublishPost }) => {
  const { step, setStep, files, setFiles } = useCreatePost()

  const [uploadImage] = useUploadImageMutation()
  const [createPost] = useCreatePostMutation()
  const [filtersState, setFiltersState] = useState<Record<number, FilterName>>({})
  const [uploadedImage, setUploadedImage] = useState<PostImageViewModel[]>([])
  const [description, setDescription] = useState('')
  const [isUploading, setIsUploading] = useState(false)
  const [showConfirmModal, setShowConfirmModal] = useState(false)

  const {
    open: openDialog,
    getRootProps,
    getInputProps,
    error,
  } = useImageDropzone(files, setFiles, () => setStep('crop'))

  const params = useParams()
  const userId = Number(params.userId)

  const handleUpload = async (file: File | Blob) => {
    if (!file) {
      return
    }

    const finalFile =
      file instanceof File ? file : new File([file], 'image.jpg', { type: 'image/jpeg' })

    try {
      const formData = new FormData()

      formData.append('file', finalFile)
      const uploaded = await uploadImage(formData).unwrap()

      setUploadedImage(prev => [...prev, ...uploaded.images])

      return uploaded
    } catch (error) {
      console.error('Failed to upload image:', error)
    }
  }

  const resetForm = () => {
    setStep('upload')
    setFiles([])
    setFiltersState({})
    setDescription('')
    setShowConfirmModal(false)
    setIsUploading(false)
  }
  const handleModalClose = () => {
    if (isUploading) {
      return
    }
    if (step !== 'upload' || files.length > 0) {
      setShowConfirmModal(true)
    } else {
      handleConfirmClose()
    }
  }

  const handleConfirmClose = () => {
    resetForm()
    onClose()
  }

  const handleCancelClose = () => {
    setShowConfirmModal(false)
  }

  const handlePublishSuccess = (newPost: PostViewModel) => {
    onPublishPost(newPost)
    const timeoutId = setTimeout(() => {
      resetForm()
    }, 100)

    return () => clearTimeout(timeoutId)
  }

  const showModalTitle = step === 'upload',
    filterStep = step === 'filter',
    publishStep = step === 'publish'

  return (
    <>
      <Modal
        open={open}
        onClose={handleModalClose}
        modalTitle={showModalTitle ? 'Add Photo' : ''}
        className={clsx(styles.modal, (filterStep || publishStep) && styles.filterStep)}
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
            onNext={() => setStep('publish')}
            files={files}
            filtersState={filtersState}
            setFiltersState={setFiltersState}
            handleUpload={handleUpload}
            setUploadedImage={setUploadedImage}
            setIsUploading={setIsUploading}
          />
        )}

        {step === 'publish' && (
          <PublishStep
            onPrev={() => setStep('filter')}
            files={files}
            filtersState={filtersState}
            description={description}
            setDescription={setDescription}
            handleUpload={handleUpload}
            createPost={createPost}
            userId={userId}
            onClose={handlePublishSuccess}
            uploadedImage={uploadedImage}
            onPublishPost={onPublishPost}
            isUploading={isUploading}
          />
        )}
      </Modal>

      <Modal
        className={styles.confirmModal}
        open={showConfirmModal}
        modalTitle={'Сlose'}
        onClose={handleCancelClose}
      >
        <Typography variant={'regular_16'} className={styles.confirmModalText}>
          Do you really want to close the creation of a publication? <br /> If you close everything
          will be deleted
        </Typography>
        <div className={styles.confirmModalButtons}>
          <Button variant={'outlined'} onClick={handleCancelClose}>
            Discard
          </Button>
          <Button variant={'primary'} onClick={handleConfirmClose}>
            Save draft
          </Button>
        </div>
      </Modal>
    </>
  )
}

export default CreatePost
