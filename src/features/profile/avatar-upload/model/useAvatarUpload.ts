'use client'

import type { AvatarUploadProps } from './types'

import { useCallback, useEffect, useReducer, useRef } from 'react'
import { CropperRef } from 'react-advanced-cropper'
import { useDropzone } from 'react-dropzone'

import { getInitialState, reducer } from './avatarUpload.reducer'

export function useAvatarUpload({ onUpload, onDelete }: AvatarUploadProps) {
  const [state, dispatch] = useReducer(reducer, undefined, getInitialState)
  const cropperRef = useRef<CropperRef>(null!)

  useEffect(() => {
    return () => {
      if (state.previewUrl) {
        URL.revokeObjectURL(state.previewUrl)
      }
    }
  }, [state.previewUrl])

  const { getRootProps, getInputProps, open } = useDropzone({
    accept: {
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
    },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024,
    onDrop: files => {
      const file = files[0]

      if (!file) {
        return
      }

      if (state.previewUrl) {
        URL.revokeObjectURL(state.previewUrl)
      }

      const url = URL.createObjectURL(file)

      dispatch({ type: 'SET_FILE', file, previewUrl: url })
    },
    onDropRejected: rejections => {
      const code = rejections[0]?.errors[0]?.code

      dispatch({
        type: 'SET_ERROR',
        value:
          code === 'file-too-large'
            ? 'The photo must be less than 10 Mb'
            : 'The photo must be in JPEG or PNG format',
      })
    },
  })

  const handleConfirm = useCallback(async () => {
    if (!cropperRef.current || !state.file) {
      return
    }

    dispatch({ type: 'SUBMIT_START' })

    const fail = (message: string) => {
      dispatch({ type: 'SUBMIT_ERROR', error: message })
    }

    try {
      const baseCanvas = cropperRef.current.getCanvas({
        width: 256,
        height: 256,
      })

      if (!baseCanvas) {
        fail('No canvas available')

        return
      }

      const ratio = window.devicePixelRatio || 1
      const canvas = document.createElement('canvas')

      canvas.width = baseCanvas.width * ratio
      canvas.height = baseCanvas.height * ratio

      const ctx = canvas.getContext('2d')

      if (!ctx) {
        fail('Failed to get canvas context')

        return
      }

      ctx.scale(ratio, ratio)
      ctx.drawImage(baseCanvas, 0, 0)

      const blob = await new Promise<Blob | null>(resolve =>
        canvas.toBlob(resolve, 'image/jpeg', 0.9)
      )

      if (!blob) {
        fail('Failed to create blob')

        return
      }

      await onUpload(new File([blob], state.file.name, { type: 'image/jpeg' }))

      if (state.previewUrl) {
        URL.revokeObjectURL(state.previewUrl)
      }

      dispatch({ type: 'SUBMIT_SUCCESS' })
    } catch (error) {
      console.error('Upload failed:', error)
      fail(error instanceof Error ? error.message : 'Failed to upload avatar')
    }
  }, [state.file, state.previewUrl, onUpload])

  const handleDeleteConfirm = useCallback(async () => {
    dispatch({ type: 'SUBMIT_START' })
    try {
      await onDelete()
      dispatch({ type: 'SUBMIT_SUCCESS' })
    } catch (error) {
      console.error('Delete failed:', error)
      dispatch({
        type: 'SUBMIT_ERROR',
        error: error instanceof Error ? error.message : 'Failed to delete avatar',
      })
    }
  }, [onDelete])

  const handleZoomChange = useCallback(
    (value: number) => {
      if (!cropperRef.current) {
        return
      }

      cropperRef.current.zoomImage(value / state.zoom)
      dispatch({ type: 'SET_ZOOM', value })
    },
    [state.zoom]
  )

  const handleCropUpdate = useCallback(() => {
    if (!cropperRef.current) {
      return
    }

    const canvas = cropperRef.current.getCanvas({ width: 96, height: 96 })

    if (canvas) {
      dispatch({ type: 'SET_CROPPED_PREVIEW', value: canvas.toDataURL() })
    }
  }, [])

  const handleCloseModal = useCallback(() => {
    if (state.previewUrl) {
      URL.revokeObjectURL(state.previewUrl)
    }
    dispatch({ type: 'RESET' })
  }, [state.previewUrl])

  const handleClearError = useCallback(() => {
    dispatch({ type: 'CLEAR_ERROR' })
  }, [])

  const isBusy = state.isSubmitting

  return {
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
    isBusy,
  }
}
