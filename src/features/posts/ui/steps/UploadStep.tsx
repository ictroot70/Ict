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
  handleUpload: (file: File) => Promise<void>
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

    // Добавляем превью для UI
    acceptedFiles.forEach(file => {
      if (file.size > MAX_SIZE) return setError('The photo must be less than 20 Mb')
      if (!['image/jpeg', 'image/png'].includes(file.type)) return setError('The photo must be JPEG or PNG format')

      const reader = new FileReader()
      reader.onload = () => {
        const preview = reader.result as string
        setFiles(prev => {
          if (prev.some(f => f.file.name === file.name && f.file.lastModified === file.lastModified)) {
            return prev
          }
          return [...prev, { file, preview }]
        })
      }
      reader.readAsDataURL(file)
    })

    // Загружаем все файлы параллельно
    await Promise.all(acceptedFiles.map(file => handleUpload(file)))

    // Переход к следующему шагу только один раз
    onNext()
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
        <p>Drag & drop photos here</p>
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

