'use client'
import React, { useState } from 'react'
import { useDropzone } from 'react-dropzone'

import { compressImage } from '@/features/posts/lib/filterStep/compressImage'
import { UploadedFile } from '@/features/posts/model/types'
import { v4 as uuidv4 } from 'uuid'

const MAX_SIZE = 20 * 1024 * 1024
const MAX_FILES = 10

export function useImageDropzone(
  files: UploadedFile[],
  setFiles: React.Dispatch<React.SetStateAction<UploadedFile[]>>,
  onNext: () => void
) {
  const [error, setError] = useState<string | null>(null)

  const onDrop = async (acceptedFiles: File[]) => {
    setError(null)
    const availableSlots = MAX_FILES - files.length

    if (availableSlots <= 0) {
      setError(`You can upload up to ${MAX_FILES} photos`)

      return
    }

    const filesToProcess = acceptedFiles.slice(0, availableSlots)

    if (acceptedFiles.length > availableSlots) {
      setError(`You can upload up to ${MAX_FILES} photos`)
    }

    for (const file of filesToProcess) {
      if (!['image/jpeg', 'image/png'].includes(file.type)) {
        setError('The photo must be JPEG or PNG format')
        continue
      }

      const compressed = await compressImage(file)

      if (compressed.size > MAX_SIZE) {
        setError('The photo must be less than 20 Mb')
        continue
      }

      const reader = new FileReader()

      reader.onload = () => {
        const preview = reader.result as string

        setFiles(prev => {
          if (prev.length >= MAX_FILES) {
            return prev
          }

          return [
            ...prev,
            {
              id: uuidv4(),
              file,
              preview,
              original: preview,
              isModified: false,
            },
          ]
        })

        onNext()
      }
      reader.readAsDataURL(compressed)
    }
  }
  const { getRootProps, getInputProps, open } = useDropzone({
    onDrop,
    accept: { 'image/jpeg': [], 'image/png': [] },
    multiple: true,
    noClick: true,
  })

  return { getRootProps, getInputProps, open, error }
}
