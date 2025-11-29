'use client'
import React, { useState } from 'react'
import { clsx } from 'clsx'
import { UploadStep } from './steps/UploadStep'
import { CropStep } from './steps/CropStep'
import { PublishStep } from './steps/PublishStep'
import { Modal, Typography, Button } from '@/shared/ui'
import styles from './CreatePostForm.module.scss'

import { useCreatePostMutation, useUploadImageMutation } from '@/entities/posts/api/postApi'
import { useParams, useSearchParams, useRouter } from 'next/navigation'
import { useCreatePost, useImageDropzone } from '@/features/posts/hooks'
import { FilterName } from '@/features/posts/lib/constants/filter-configs'
import { PostImageViewModel, PostViewModel } from '@/shared/types'
import { FilterStep } from '@/features/posts/ui/steps/FilterStep'

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

  const router = useRouter()
  const params = useParams()
  const searchParams = useSearchParams()
  const userId = Number(params.userId)

  const handleUpload = async (file: File | Blob) => {
    // Todo: Later will add for this process
    // const allowedTypes = ['image/jpeg', 'image/png']
    // const maxSize = 1024 * 1024 * 20
    // const maxCount = 10
    if (!file) return

    // if (uploadedImage.length >= maxCount) {
    //   alert('You can upload no more than 10 photos.')
    //   return
    // }
    //
    // if (!allowedTypes.includes(finalFile.type)) {
    //   alert('Only JPEG or PNG images are allowed')
    //   return
    // }

    const finalFile =
      file instanceof File ? file : new File([file], 'image.jpg', { type: 'image/jpeg' })
    // if (finalFile.size > maxSize) {
    //   alert(`The file is too large. Max size is ${Math.round(maxSize / 1024)} KB`)
    //   return
    // }
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
    if (isUploading) return
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
