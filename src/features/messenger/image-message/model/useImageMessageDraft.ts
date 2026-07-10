import { useCallback, useEffect, useState } from 'react'

import { ImageValidationError, validateImageMessageFile } from '../lib/validateImageMessageFile'

export function useImageMessageDraft() {
  const [file, setFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [error, setError] = useState<ImageValidationError | null>(null)

  const selectImage = useCallback(
    (file: File) => {
      const validationError = validateImageMessageFile(file)

      if (validationError) {
        setError(validationError)

        return
      }

      if (previewUrl) {
        URL.revokeObjectURL(previewUrl)
      }

      const newUrl = URL.createObjectURL(file)

      setFile(file)
      setPreviewUrl(newUrl)
      setError(null)
    },
    [previewUrl]
  )

  const removeImage = useCallback(() => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl)
    }

    setFile(null)
    setPreviewUrl(null)
    setError(null)
  }, [previewUrl])

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl)
      }
    }
  }, [previewUrl])

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
  }
}
