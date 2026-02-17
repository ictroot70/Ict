'use client'
import React, { useState } from 'react'

import { useCreatePostMutation, postApi } from '@/entities/posts/api/postApi'
import { useCreatePost, useImageDropzone } from '@/features/posts/hooks'
import { FilterName } from '@/features/posts/lib/constants/filter-configs'
import { CropStep } from '@/features/posts/ui/steps/CropStep/CropStep'
import { FilterStep } from '@/features/posts/ui/steps/FilterStep'
import { UploadedFile } from '@/features/posts/model/types'
import { PostImageViewModel, PostViewModel } from '@/shared/types'
import { Button, Modal, Typography } from '@/shared/ui'
import { clsx } from 'clsx'
import { useParams } from 'next/navigation'
import { useAppDispatch } from '@/lib/hooks'

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
  const dispatch = useAppDispatch()

  const [createPost] = useCreatePostMutation()
  const [filtersState, setFiltersState] = useState<Record<number, FilterName>>({})
  const [uploadedImage, setUploadedImage] = useState<PostImageViewModel[]>([])
  const [description, setDescription] = useState('')
  const [isUploading, setIsUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [uploadProgress, setUploadProgress] = useState({ current: 0, total: 0 })
  const [showConfirmModal, setShowConfirmModal] = useState(false)

  const {
    open: openDialog,
    getRootProps,
    getInputProps,
    error,
  } = useImageDropzone(files, setFiles, () => setStep('crop'))

  const params = useParams()
  const userId = Number(params.userId)

  /**
   * Вызывается из FilterStep после canvas-обработки.
   * Немедленно переключает шаг на publish, затем в фоне загружает все изображения
   * одним запросом — эндпоинт принимает file[] (array).
   */
  const handleFilterDone = (processedFiles: UploadedFile[]) => {
    setFiles(processedFiles)
    setUploadedImage([])
    setUploadError(null)
    setUploadProgress({ current: 0, total: processedFiles.length })
    setStep('publish')

    void startBackgroundUpload(processedFiles)
  }

  const startBackgroundUpload = async (processedFiles: UploadedFile[]) => {
    setIsUploading(true)
    setUploadError(null)
    setUploadProgress({ current: 0, total: processedFiles.length })

    try {
      // Todo: Последовательная загрузка — один файл за запрос.
      //  ictroot.uk (staging) крашится при multiple files в одной FormData.
      //  inctagram.work (prod) судя по Swagger поддерживает file[],
      //  но пока используем staging — только sequential.
      const uploaded: PostImageViewModel[] = []

      for (let i = 0; i < processedFiles.length; i++) {
        const file = processedFiles[i]

        if (!file.blob) continue

        const formData = new FormData()

        formData.append('file', new File([file.blob], 'image.jpg', { type: 'image/jpeg' }))

        const result = await dispatch(postApi.endpoints.uploadImage.initiate(formData))

        if ('error' in result) throw result.error
        if (result.data?.images) uploaded.push(...result.data.images)

        setUploadProgress({ current: i + 1, total: processedFiles.length })
      }

      if (uploaded.length === 0) throw new Error('No images were uploaded')

      setUploadedImage(uploaded)
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Upload failed'
      setUploadError(msg)
    } finally {
      setIsUploading(false)
    }
  }

  const resetForm = () => {
    setStep('upload')
    setFiles([])
    setFiltersState({})
    setDescription('')
    setUploadedImage([])
    setUploadError(null)
    setUploadProgress({ current: 0, total: 0 })
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
    const timeoutId = setTimeout(() => resetForm(), 100)
    return () => clearTimeout(timeoutId)
  }

  const showModalTitle = step === 'upload'
  const isWideStep = step === 'filter' || step === 'publish'

  return (
    <>
      <Modal
        open={open}
        onClose={handleModalClose}
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
            onNext={handleFilterDone}
            files={files}
            filtersState={filtersState}
            setFiltersState={setFiltersState}
          />
        )}

        {step === 'publish' && (
          <PublishStep
            onPrev={() => setStep('filter')}
            files={files}
            filtersState={filtersState}
            description={description}
            setDescription={setDescription}
            createPost={createPost}
            userId={userId}
            onClose={handlePublishSuccess}
            uploadedImage={uploadedImage}
            onPublishPost={onPublishPost}
            isUploading={isUploading}
            uploadError={uploadError}
            uploadProgress={uploadProgress}
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
