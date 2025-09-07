'use client'
import React, { useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { UploadedFile } from '../../model/types'
import styles from './UploadStep.module.scss'
import { ImageOutline } from '@/shared/ui/SVGComponents'

interface Props {
  onNext: () => void
  files: UploadedFile[]
  setFiles: React.Dispatch<React.SetStateAction<UploadedFile[]>>
  onOpenDraft?: () => void
  handleUpload: (file: File) => Promise<any>
}

const MAX_SIZE = 20 * 1024 * 1024 // 20 MB
const MAX_FILES = 10

export const UploadStep: React.FC<Props> = ({ onNext, files, setFiles, onOpenDraft, handleUpload }) => {
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
          // 🔑 Проверяем, есть ли такой файл уже в стейте
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

  return (
    <div className={styles.wrapper}>
      {/* Зона загрузки */}
      <div {...getRootProps()} className={styles.dropzone}>
        <input {...getInputProps()} />
        <div className={styles.iconWrapper}>
          <ImageOutline />
        </div>
      </div>

      {error && <p className={styles.error}>{error}</p>}

      {/* Кнопки */}
      <div className={styles.actions}>
        <button type="button" className={styles.primaryBtn} onClick={open}>
          Select from Computer
        </button>
        <button className={styles.secondaryBtn} onClick={onOpenDraft} type="button">
          Open Draft
        </button>
      </div>
    </div>
  )
}

