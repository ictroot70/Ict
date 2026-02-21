import { useState, useCallback, useRef } from 'react'

import { UploadedFile } from '@/features/posts/model/types'
import { clearFilterProcessingMetrics } from '@/features/posts/model/upload-performance.runtime'
import { UploadedImageViewModel, PostImageViewModel } from '@/shared/types'

import { toUploadUserMessage, type UploadErrorActionHint } from './useBackgroundUpload.error-mapper'
import {
  dedupeImagesByUploadId,
  getErrorStatus,
  uploadWithRetry,
} from './useBackgroundUpload.utils'

const MAX_FILES_PER_UPLOAD = 10
const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024
const ALLOWED_MIME_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp'])

interface BackgroundUploadState {
  status: 'idle' | 'uploading' | 'completed' | 'error'
  uploadStage: 'idle' | 'uploading_to_server' | 'processing_on_server'
  uploadedImages: PostImageViewModel[]
  progress: { current: number; total: number }
  errorActionHint: UploadErrorActionHint | null
  error: string | null
}
interface UseBackgroundUploadParams {
  handleUpload: (files: Array<File | Blob>) => Promise<UploadedImageViewModel | undefined>
  deleteImage: (uploadId: string) => Promise<void>
  abortUpload: () => void
}

export const useBackgroundUpload = ({
  handleUpload,
  deleteImage,
  abortUpload,
}: UseBackgroundUploadParams) => {
  const [state, setState] = useState<BackgroundUploadState>({
    status: 'idle',
    uploadStage: 'idle',
    uploadedImages: [],
    progress: { current: 0, total: 0 },
    errorActionHint: null,
    error: null,
  })

  const operationVersionRef = useRef(0)
  const committedUploadIdsRef = useRef<Set<string>>(new Set())
  const staleUploadIdsRef = useRef<Set<string>>(new Set())
  const isFlushingRef = useRef(false)
  const processingStageTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const resetUi = useCallback(() => {
    setState({
      status: 'idle',
      uploadStage: 'idle',
      uploadedImages: [],
      progress: { current: 0, total: 0 },
      errorActionHint: null,
      error: null,
    })
  }, [])

  const markUploadedAsStale = useCallback((uploadIds: string[]) => {
    if (uploadIds.length === 0 || committedUploadIdsRef.current.size === 0) {
      return
    }

    const committedIds = committedUploadIdsRef.current

    for (const uploadId of uploadIds) {
      if (committedIds.has(uploadId)) {
        staleUploadIdsRef.current.add(uploadId)
      }
    }
  }, [])

  const clearStale = useCallback(() => staleUploadIdsRef.current.clear(), [])
  const markPublished = useCallback(() => {
    committedUploadIdsRef.current.clear()
    staleUploadIdsRef.current.clear()
  }, [])
  const cleanupUploadIds = useCallback(
    async (uploadIds: string[]) => {
      if (uploadIds.length === 0) {
        return
      }

      const results = await Promise.allSettled(uploadIds.map(uploadId => deleteImage(uploadId)))

      results.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          return
        }

        const status = getErrorStatus(result.reason)

        if (status === 404 || status === 409) {
          return
        }
        const uploadId = uploadIds[index]

        console.error(`❌ Cleanup failed for uploadId=${uploadId}:`, result.reason)
      })
    },
    [deleteImage]
  )

  const flushStaleCleanup = useCallback(async () => {
    if (isFlushingRef.current || staleUploadIdsRef.current.size === 0) {
      return
    }

    isFlushingRef.current = true
    const staleSnapshot = Array.from(staleUploadIdsRef.current)

    try {
      await cleanupUploadIds(staleSnapshot)

      for (const uploadId of staleSnapshot) {
        staleUploadIdsRef.current.delete(uploadId)
      }
    } finally {
      isFlushingRef.current = false
    }
  }, [cleanupUploadIds])

  const cleanupAll = useCallback(async () => {
    const cleanupIds = Array.from(
      new Set([...committedUploadIdsRef.current, ...staleUploadIdsRef.current])
    )

    if (cleanupIds.length === 0) {
      return
    }

    await cleanupUploadIds(cleanupIds)
    committedUploadIdsRef.current.clear()
    staleUploadIdsRef.current.clear()
  }, [cleanupUploadIds])

  const startUpload = useCallback(
    async (files: UploadedFile[]) => {
      const operationVersion = ++operationVersionRef.current

      const allBlobsReady = files.every(f => Boolean(f.blob))

      if (!allBlobsReady) {
        setState(prev => ({
          ...prev,
          status: 'error',
          uploadStage: 'idle',
          errorActionHint: 'retry',
          error: 'Images are not processed yet',
        }))

        return
      }

      const blobs = files.map(file => file.blob!)
      const filesCountValidationError =
        files.length > MAX_FILES_PER_UPLOAD
          ? `Можно загрузить не более ${MAX_FILES_PER_UPLOAD} файлов за раз.`
          : null

      if (filesCountValidationError) {
        setState(prev => ({
          ...prev,
          status: 'error',
          uploadStage: 'idle',
          errorActionHint: 'back',
          error: filesCountValidationError,
        }))

        return
      }

      for (let idx = 0; idx < blobs.length; idx++) {
        const blob = blobs[idx]
        const fileIndex = idx + 1

        if (blob.size > MAX_FILE_SIZE_BYTES) {
          setState(prev => ({
            ...prev,
            status: 'error',
            uploadStage: 'idle',
            errorActionHint: 'back',
            error: `Файл [${fileIndex}] превышает 10MB.`,
          }))

          return
        }

        if (!ALLOWED_MIME_TYPES.has(blob.type)) {
          setState(prev => ({
            ...prev,
            status: 'error',
            uploadStage: 'idle',
            errorActionHint: 'back',
            error: `Файл [${fileIndex}] имеет неподдерживаемый формат.`,
          }))

          return
        }
      }

      try {
        setState({
          status: 'uploading',
          uploadStage: 'uploading_to_server',
          uploadedImages: [],
          progress: { current: 0, total: files.length },
          errorActionHint: null,
          error: null,
        })

        if (processingStageTimeoutRef.current) {
          clearTimeout(processingStageTimeoutRef.current)
        }

        processingStageTimeoutRef.current = setTimeout(() => {
          setState(prev => {
            if (operationVersionRef.current !== operationVersion || prev.status !== 'uploading') {
              return prev
            }

            return { ...prev, uploadStage: 'processing_on_server' }
          })
        }, 900)

        const uploadResult = await uploadWithRetry(blobs, handleUpload)

        clearFilterProcessingMetrics()
        if (!uploadResult?.images?.length) {
          throw new Error('No images were uploaded')
        }
        const uploadedImages: PostImageViewModel[] = [...uploadResult.images]
        const uniqueUploadedImages = dedupeImagesByUploadId(uploadedImages)

        if (operationVersionRef.current !== operationVersion) {
          return
        }
        committedUploadIdsRef.current = new Set(uniqueUploadedImages.map(image => image.uploadId))

        setState({
          status: 'completed',
          uploadStage: 'idle',
          uploadedImages: uniqueUploadedImages,
          progress: { current: files.length, total: files.length },
          errorActionHint: null,
          error: null,
        })
      } catch (error: unknown) {
        const mappedError = toUploadUserMessage(error)

        clearFilterProcessingMetrics()

        if (operationVersionRef.current !== operationVersion) {
          return
        }

        setState(prev => ({
          ...prev,
          status: 'error',
          uploadStage: 'idle',
          errorActionHint: mappedError.action,
          error: mappedError.userMessage,
        }))
      } finally {
        if (processingStageTimeoutRef.current) {
          clearTimeout(processingStageTimeoutRef.current)
          processingStageTimeoutRef.current = null
        }
      }
    },
    [handleUpload]
  )
  const cancel = useCallback(() => {
    abortUpload()
    operationVersionRef.current += 1
    setState(prev => ({
      ...prev,
      status: 'idle',
      uploadStage: 'idle',
      errorActionHint: null,
      error: null,
    }))
  }, [abortUpload])

  return {
    state,
    startUpload,
    cleanupAll,
    flushStaleCleanup,
    markUploadedAsStale,
    clearStale,
    markPublished,
    cancel,
    resetUi,
  }
}
