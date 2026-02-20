'use client'

import { useCallback, useMemo, useRef, useState } from 'react'

import {
  postApi,
  useCreatePostMutation,
  useDeleteImageMutation,
} from '@/entities/posts/api/postApi'
import { useBackgroundUpload } from '@/features/posts/hooks/useBackgroundUpload'
import { useCreatePost } from '@/features/posts/hooks/useCreatePost'
import { FilterName } from '@/features/posts/lib/constants/filter-configs'
import {
  buildCreatePostBody,
  buildUploadFormData,
  extractErrorMessage,
  isDraftDirty,
} from '@/features/posts/model/create-post-flow.helpers'
import {
  CreatePostFlowState,
  UseCreatePostFlowArgs,
} from '@/features/posts/model/create-post-flow.types'
import { useFilterProcessing } from '@/features/posts/model/useFilterProcessing'
import { useAppDispatch } from '@/lib/hooks'
import { useParams } from 'next/navigation'
import { toast } from 'react-toastify/unstyled'

type UploadRequestHandle = {
  abort?: () => void
}

export const useCreatePostFlow = ({
  onCloseAction,
  onPublishPostAction,
}: UseCreatePostFlowArgs): CreatePostFlowState => {
  const { step, setStep, files, setFiles } = useCreatePost()
  const dispatch = useAppDispatch()
  const params = useParams()

  const userId = useMemo(() => {
    const userIdParam = params?.userId
    const rawUserId = Array.isArray(userIdParam) ? userIdParam[0] : userIdParam

    return Number(rawUserId)
  }, [params])

  const [createPost] = useCreatePostMutation()
  const [deleteImage] = useDeleteImageMutation()
  const [filtersState, setFiltersState] = useState<Record<number, FilterName>>({})
  const [description, setDescription] = useState('')
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [isPublishing, setIsPublishing] = useState(false)
  const activeUploadRequestRef = useRef<UploadRequestHandle | null>(null)
  const filterProcessing = useFilterProcessing()

  const abortUpload = useCallback(() => {
    activeUploadRequestRef.current?.abort?.()
    activeUploadRequestRef.current = null
  }, [])

  const handleUpload = useCallback(
    async (blobs: Array<File | Blob>) => {
      const formData = buildUploadFormData(blobs)
      const uploadRequest = dispatch(postApi.endpoints.uploadImage.initiate(formData))

      activeUploadRequestRef.current = uploadRequest

      const result = await uploadRequest.finally(() => {
        if (activeUploadRequestRef.current === uploadRequest) {
          activeUploadRequestRef.current = null
        }
      })

      if ('error' in result) {
        throw result.error
      }

      return result.data
    },
    [dispatch]
  )

  const handleDeleteImage = useCallback(
    async (uploadId: string): Promise<void> => {
      await deleteImage(uploadId).unwrap()
    },
    [deleteImage]
  )

  const backgroundUpload = useBackgroundUpload({
    handleUpload,
    deleteImage: handleDeleteImage,
    abortUpload,
  })

  const resetForm = useCallback(() => {
    setStep('upload')
    setFiles([])
    setFiltersState({})
    setDescription('')
    setShowConfirmModal(false)
    setIsPublishing(false)
    backgroundUpload.resetUi()
  }, [backgroundUpload, setFiles, setStep])

  const onFilterDone = useCallback(async () => {
    if (isPublishing) {
      return
    }

    try {
      const processedFiles = await filterProcessing.process(files, filtersState)

      void backgroundUpload.flushStaleCleanup()
      setFiles(processedFiles)
      backgroundUpload.resetUi()
      setStep('publish')
      void backgroundUpload.startUpload(processedFiles)
    } catch (error) {
      const message =
        error instanceof Error && error.message ? error.message : 'Error processing images'

      toast(`❌ ${message}`)
    }
  }, [backgroundUpload, files, filterProcessing, filtersState, isPublishing, setFiles, setStep])

  const onModalCloseRequest = useCallback(() => {
    if (isDraftDirty(step, files.length)) {
      setShowConfirmModal(true)

      return
    }

    backgroundUpload.cancel()
    void backgroundUpload.cleanupAll()
    resetForm()
    onCloseAction()
  }, [backgroundUpload, files.length, onCloseAction, resetForm, step])

  const onConfirmClose = useCallback(() => {
    // TODO(draft-post): replace this cleanup flow with persisted draft save when drafts are implemented.
    backgroundUpload.cancel()
    void backgroundUpload.cleanupAll()
    resetForm()
    onCloseAction()
  }, [backgroundUpload, onCloseAction, resetForm])

  const onCancelClose = useCallback(() => {
    setShowConfirmModal(false)
  }, [])

  const onBackFromPublish = useCallback(async () => {
    if (backgroundUpload.state.status === 'uploading') {
      backgroundUpload.cancel()
      backgroundUpload.resetUi()
      setStep('filter')

      return
    }

    const committedUploadIds = Array.from(
      new Set(backgroundUpload.state.uploadedImages.map(image => image.uploadId))
    )

    backgroundUpload.markUploadedAsStale(committedUploadIds)
    backgroundUpload.resetUi()
    setStep('filter')
  }, [backgroundUpload, setStep])

  const onPublish = useCallback(async () => {
    const uploadedImages = backgroundUpload.state.uploadedImages

    if (
      isPublishing ||
      backgroundUpload.state.status === 'uploading' ||
      uploadedImages.length === 0
    ) {
      return
    }

    setIsPublishing(true)
    try {
      const body = buildCreatePostBody(description, uploadedImages)

      const newPost = await createPost({ userId, body }).unwrap()

      onPublishPostAction(newPost)
      backgroundUpload.markPublished()
      toast('✅ Post created!')
      resetForm()
      onCloseAction()
    } catch (error) {
      const message = extractErrorMessage(error)

      toast(`❌ ${message}`)
    } finally {
      setIsPublishing(false)
    }
  }, [
    backgroundUpload,
    createPost,
    description,
    isPublishing,
    onCloseAction,
    onPublishPostAction,
    resetForm,
    userId,
  ])

  const uploadProgress = backgroundUpload.state.progress
  const uploadStage = backgroundUpload.state.uploadStage
  const uploadErrorActionHint = backgroundUpload.state.errorActionHint
  const uploadError = backgroundUpload.state.error
  const isUploading = backgroundUpload.state.status === 'uploading'
  const uploadedImages = backgroundUpload.state.uploadedImages
  const canPublish = !isUploading && !uploadError && uploadedImages.length > 0

  return {
    step,
    setStep,
    files,
    setFiles,
    filtersState,
    setFiltersState,
    description,
    setDescription,
    showConfirmModal,
    isFilterProcessing: filterProcessing.isProcessing,
    isUploading,
    uploadStage,
    uploadErrorActionHint,
    uploadError,
    uploadProgress,
    uploadedImages,
    canPublish,
    isPublishing,
    actions: {
      onFilterDone,
      onModalCloseRequest,
      onConfirmClose,
      onCancelClose,
      onPublish,
      onBackFromPublish,
    },
  }
}
