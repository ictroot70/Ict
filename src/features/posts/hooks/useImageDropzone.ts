'use client'
import { useDropzone } from 'react-dropzone'
import { v4 as uuidv4 } from 'uuid'
import { useState } from 'react'
import { UploadedFile } from '@/features/posts/model/types'
import { compressImage } from '@/features/posts/lib/filterStep/compressImage'

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

    for (const file of acceptedFiles) {
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
        setFiles(prev => [
          ...prev,
          {
            id: uuidv4(),
            file,
            preview,
            original: preview,
            isModified: false,
          },
        ])

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
