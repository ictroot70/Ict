import { useCallback, useEffect, useRef, useState } from 'react'

import { ImageValidationError, validateImageMessageFile } from '../lib/validateImageMessageFile'

export function useImageMessageDraft() {
  const [file, setFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [error, setError] = useState<ImageValidationError | null>(null)

  const previewUrlRef = useRef<string | null>(null)

  const revokePreviewUrl = useCallback(() => {
    if (previewUrlRef.current) {
      URL.revokeObjectURL(previewUrlRef.current)
      previewUrlRef.current = null
    }
  }, [])

  const selectImage = useCallback(
    (file: File) => {
      const validationError = validateImageMessageFile(file)

      if (validationError) {
        setError(validationError)

        return
      }

      revokePreviewUrl()

      const newUrl = URL.createObjectURL(file)

      previewUrlRef.current = newUrl
      setFile(file)
      setPreviewUrl(newUrl)
      setError(null)
    },
    [revokePreviewUrl]
  )

  const removeImage = useCallback(() => {
    revokePreviewUrl()

    setFile(null)
    setPreviewUrl(null)
    setError(null)
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
  }
}
