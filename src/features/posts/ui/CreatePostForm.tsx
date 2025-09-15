'use client'
import React, { useState } from 'react'
import { useCreatePost } from '../model/useCreatePost'
import { UploadStep } from './steps/UploadStep'
import { CropStep } from './steps/CropStep'
import { FilterStep } from './steps/FilterStep'
import { PublishStep } from './steps/PublishStep'
import { Post } from '@/features/posts/model/types'
import { Modal } from '@/shared/ui/Modal'

import { useCreatePostMutation, useUploadImageMutation } from '@/entities/posts/api/postApi'
import { PostImageViewModel } from '@/entities/posts/api/posts.types'
import { useParams } from 'next/navigation'

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
  const [isUploading, setIsUploading] = useState(false);


  const params = useParams()
  const userId = Number(params.id)


  const handleUpload = async (file: File | Blob) => {
    const allowedTypes = ['image/jpeg', 'image/png']
    const maxSize = 1024 * 1024 * 20
    const maxCount = 10
    if (!file) return

    const finalFile =
      file instanceof File ? file : new File([file], 'image.jpg', { type: 'image/jpeg' })

    if (uploadedImage.length >= maxCount) {
      alert('You can upload no more than 10 photos.')
      return
    }

    if (!allowedTypes.includes(finalFile.type)) {
      alert('Only JPEG or PNG images are allowed')
      return
    }

    if (finalFile.size > maxSize) {
      alert(`The file is too large. Max size is ${Math.round(maxSize / 1024)} KB`)
      return
    }

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

  const handleClose = () => {
    const confirmClose = window.confirm('Do you really want to close? All progress will be lost.')
    if (confirmClose) {
      resetForm()
      onClose()
    }
  }

  const resetForm = () => {
    setStep('upload')
    setFiles([])
    setUploadedImage([])
    setDescription('')
  }

  return (
    <Modal
      open={open}
      onClose={handleClose}
      modalTitle="Add Photo"
      width="492px"
      height="564px"
      style={{ zIndex: 100 }}
    >
      {step === 'upload' && (
        <UploadStep
          onNext={() => setStep('crop')}
          files={files}
          setFiles={setFiles}
          handleUpload={handleUpload}
        />
      )}

      {step === 'crop' && (
        <CropStep
          onPrev={() => setStep('upload')}
          onNext={() => setStep('filter')}
          files={files}
          setFiles={setFiles}
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
  )
}

export default CreatePost
