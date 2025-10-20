'use client'
import { useDropzone } from 'react-dropzone'
import { useState } from 'react'
import { UploadedFile } from '@/features/posts/model/types'


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

    if (files.length + acceptedFiles.length > MAX_FILES) {
      setError(`You can upload a maximum of ${MAX_FILES} photos`)
      return
    }

    for (const file of acceptedFiles) {
      if (file.size > MAX_SIZE) {
        setError('The photo must be less than 20 Mb')
        continue
      }

      if (!['image/jpeg', 'image/png'].includes(file.type)) {
        setError('The photo must be JPEG or PNG format')
        continue
      }

      const reader = new FileReader()
      reader.onload = () => {
        const preview = reader.result as string
        setFiles(prev => {
          if (prev.some(f => f.file.name === file.name && f.file.lastModified === file.lastModified)) {
            return prev
          }
          return [...prev, { file, preview }]
        })
        onNext()
      }
      reader.readAsDataURL(file)
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
