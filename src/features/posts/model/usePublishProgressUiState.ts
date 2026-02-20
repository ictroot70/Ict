import { useEffect, useRef, useState } from 'react'

import { UploadStage } from '@/features/posts/model/create-post-flow.types'

export type UploadMessageMode = 'uploading' | 'processing' | 'hint'
export type ProgressUiState = 'idle' | 'uploading' | 'success'

type UsePublishProgressUiStateArgs = {
  isUploading: boolean
  uploadStage: UploadStage
  canPublish: boolean
  uploadError: string | null
}

type UsePublishProgressUiStateResult = {
  progressUiState: ProgressUiState
  uploadMessageMode: UploadMessageMode
}

export const usePublishProgressUiState = ({
  isUploading,
  uploadStage,
  canPublish,
  uploadError,
}: UsePublishProgressUiStateArgs): UsePublishProgressUiStateResult => {
  const [progressUiState, setProgressUiState] = useState<ProgressUiState>('idle')
  const [uploadMessageMode, setUploadMessageMode] = useState<UploadMessageMode>('uploading')
  const prevUploadingRef = useRef(isUploading)
  const successTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const hintTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (hintTimeoutRef.current) {
      clearTimeout(hintTimeoutRef.current)
      hintTimeoutRef.current = null
    }

    if (!isUploading) {
      setUploadMessageMode('uploading')

      return
    }

    if (uploadStage === 'uploading_to_server') {
      setUploadMessageMode('uploading')

      return
    }

    setUploadMessageMode('processing')
    hintTimeoutRef.current = setTimeout(() => {
      setUploadMessageMode('hint')
    }, 5000)

    return () => {
      if (hintTimeoutRef.current) {
        clearTimeout(hintTimeoutRef.current)
        hintTimeoutRef.current = null
      }
    }
  }, [isUploading, uploadStage])

  useEffect(() => {
    if (isUploading) {
      if (successTimeoutRef.current) {
        clearTimeout(successTimeoutRef.current)
        successTimeoutRef.current = null
      }

      setProgressUiState('uploading')
      prevUploadingRef.current = true

      return
    }

    const finishedUploading = prevUploadingRef.current && !isUploading
    const shouldShowSuccess = finishedUploading && canPublish && !uploadError

    if (shouldShowSuccess) {
      setProgressUiState('success')
      successTimeoutRef.current = setTimeout(() => {
        setProgressUiState('idle')
      }, 900)
    } else if (uploadError) {
      setProgressUiState('idle')
    }

    prevUploadingRef.current = isUploading

    return () => {
      if (successTimeoutRef.current) {
        clearTimeout(successTimeoutRef.current)
        successTimeoutRef.current = null
      }

      if (hintTimeoutRef.current) {
        clearTimeout(hintTimeoutRef.current)
        hintTimeoutRef.current = null
      }
    }
  }, [canPublish, isUploading, uploadError])

  return {
    progressUiState,
    uploadMessageMode,
  }
}
