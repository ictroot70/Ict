'use client'
import React, { useState } from 'react'
import { clsx } from 'clsx'
import { UploadStep } from './steps/UploadStep'
import { CropStep } from './steps/CropStep'
import { FilterStep } from './steps/FilterStep'
import { PublishStep } from './steps/PublishStep'
import { Post } from '@/features/posts/model/types'
import { Modal, Typography, Button } from '@/shared/ui'
import styles from './CreatePostForm.module.scss'

import { useCreatePostMutation, useUploadImageMutation } from '@/entities/posts/api/postApi'
import { PostImageViewModel } from '@/entities/posts/api/posts.types'
import { useParams } from 'next/navigation'
import { useCreatePost, useImageDropzone } from '@/features/posts/hooks'

interface Props {
  open: boolean
  onClose: () => void
  onPublishPost: (post: Post) => void
}

const CreatePost: React.FC<Props> = ({ open, onClose, onPublishPost }) => {
  const { step, setStep, files, setFiles } = useCreatePost()

  const [uploadImage] = useUploadImageMutation()
  const [createPost] = useCreatePostMutation()
  const [filtersState, setFiltersState] = useState<Record<number, string>>({})
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
  const userId = Number(params.id)

  const handleUpload = async (file: File | Blob) => {
    const allowedTypes = ['image/jpeg', 'image/png']
    const maxSize = 1024 * 1024 * 20
    const maxCount = 10
    if (!file) return

    const finalFile =
      file instanceof File ? file : new File([file], 'image.jpg', { type: 'image/jpeg' })

    try {
      const formData = new FormData()
      formData.append('file', finalFile)
      const uploaded = await uploadImage(formData).unwrap()
      setUploadedImage(prev => [...uploaded.images, ...prev])

      return uploaded
    } catch (error) {
      console.error('Failed to upload image:', error)
    }
  }

  const handleClose = () => {
    setShowConfirmModal(true)
  }

  const resetForm = () => {
    setStep('upload')
    setFiles([])
    setUploadedImage([])
    setDescription('')
  }

  const handleConfirmClose = () => {
    resetForm()
    setShowConfirmModal(false)
    onClose()
  }

  const handleCancelClose = () => {
    setShowConfirmModal(false)
  }

  const showModalTitle = step === 'upload',
    filterStep = step === 'filter',
    publishStep = step === 'publish'
  return (
    <>
      <Modal
        open={open}
        onClose={handleClose}
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
            onClose={() => {
              resetForm()
              onClose()
            }}
            uploadedImage={uploadedImage}
            onPublishPost={onPublishPost}
            isUploading={isUploading}
          />
        )}
      </Modal>

      <Modal
        open={showConfirmModal}
        modalTitle={'Сlose'}
        onClose={handleCancelClose}
        style={{ width: '378px' }}
      >
        <Typography variant={'regular_16'} style={{ paddingBlock: '6px 18px' }}>
          Do you really want to close the creation of a publication? <br /> If you close everything
          will be deleted
        </Typography>
        <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between' }}>
          <Button variant={'outlined'} onClick={handleCancelClose}>
            Cancel
          </Button>
          <Button variant={'primary'} onClick={handleConfirmClose}>
            Confirm
          </Button>
        </div>
      </Modal>
    </>
  )
}

export default CreatePost
