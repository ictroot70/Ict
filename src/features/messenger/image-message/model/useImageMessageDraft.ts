import { useCallback, useEffect, useRef, useState } from 'react'

import { compressImageMessageFile } from '../lib/compressImageMessageFile'
import { ImageValidationError, isAllowedImageMessageType } from '../lib/validateImageMessageFile'

export function useImageMessageDraft() {
  const [file, setFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [error, setError] = useState<ImageValidationError | null>(null)
  const [isCompressing, setIsCompressing] = useState(false)

  const previewUrlRef = useRef<string | null>(null)

  const revokePreviewUrl = useCallback(() => {
    if (previewUrlRef.current) {
      URL.revokeObjectURL(previewUrlRef.current)
      previewUrlRef.current = null
    }
  }, [])

  const setSelectedImage = useCallback(
    (file: File) => {
      revokePreviewUrl()

      const newUrl = URL.createObjectURL(file)

      previewUrlRef.current = newUrl
      setFile(file)
      setPreviewUrl(newUrl)
      setError(null)
    },
    [revokePreviewUrl]
  )

  const selectImage = useCallback(
    async (file: File) => {
      if (!isAllowedImageMessageType(file)) {
        setError('invalidType')

        return
      }

      setError(null)
      setIsCompressing(true)

      try {
        const compressedFile = await compressImageMessageFile(file)

        if (!compressedFile) {
          setError('tooLarge')

          return
        }

        setSelectedImage(compressedFile)
      } catch {
        setError('tooLarge')
      } finally {
        setIsCompressing(false)
      }
    },
    [setSelectedImage]
  )

  const removeImage = useCallback(() => {
    revokePreviewUrl()

    setFile(null)
    setPreviewUrl(null)
    setError(null)
    setIsCompressing(false)
  }, [revokePreviewUrl])

  useEffect(() => {
    return () => {
      revokePreviewUrl()
    }
  }, [revokePreviewUrl])

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  return {
    file,
    previewUrl,
    error,
    hasImage: Boolean(file && previewUrl),
    selectImage,
    removeImage,
    clearError,
    isCompressing,
  }
}
