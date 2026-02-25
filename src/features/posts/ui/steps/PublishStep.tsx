'use client'
import React, { useEffect, useState } from 'react'

import { useGetMyProfileQuery } from '@/entities/profile'
import { FilterName } from '@/features/posts/lib/constants/filter-configs'
import { UploadErrorActionHint, UploadStage } from '@/features/posts/model/create-post-flow.types'
import { usePublishProgressUiState } from '@/features/posts/model/usePublishProgressUiState'
import { Header } from '@/features/posts/ui/Header/header'
import { Avatar, Carousel } from '@/shared/composites'
import { Input, Separator, TextArea, Typography } from '@/shared/ui'

import styles from './PublishStep.module.scss'

import { UploadedFile } from '../../model/types'

interface Props {
  onPrev: () => Promise<void> | void
  onPublish: () => Promise<void>
  files: UploadedFile[]
  filtersState: Record<number, FilterName>
  description: string
  setDescription: (v: string) => void
  isUploading: boolean
  uploadStage: UploadStage
  uploadErrorActionHint: UploadErrorActionHint | null
  uploadError: string | null
  canPublish: boolean
  isPublishing: boolean
}

export const PublishStep: React.FC<Props> = ({
  onPrev,
  onPublish,
  files,
  filtersState,
  description,
  setDescription,
  isUploading,
  uploadStage,
  uploadErrorActionHint,
  uploadError,
  canPublish,
  isPublishing,
}) => {
  const { data } = useGetMyProfileQuery()
  const userName = data?.userName
  const avatarUrl = data?.avatars[0]?.url
  const [language, setLanguage] = useState<'en' | 'rus'>('en')
  const { progressUiState, uploadMessageMode } = usePublishProgressUiState({
    isUploading,
    uploadStage,
    canPublish,
    uploadError,
  })

  const isDescriptionValid = description.length > 0 && description.length <= 500
  const uploadStatusTextByLanguage = {
    en: {
      uploading: 'Preparing images for publication...',
      processing: 'Preparing images for publication...',
      hint: 'Meanwhile, you can fill in the post description.',
    },
    rus: {
      uploading: 'Подготавливаем изображения к публикации...',
      processing: 'Подготавливаем изображения к публикации...',
      hint: 'А пока можно заполнить описание поста.',
    },
  } as const
  const uploadStatusText = uploadStatusTextByLanguage[language][uploadMessageMode]
  const uploadActionHintByLanguage: Record<'en' | 'rus', Record<UploadErrorActionHint, string>> = {
    en: {
      auth: 'Refresh the page and sign in again.',
      back: 'Press Back to replace the file.',
      retry: 'Please try again.',
    },
    rus: {
      auth: 'Обновите страницу и войдите снова.',
      back: 'Нажмите Back, чтобы заменить файл.',
      retry: 'Попробуйте снова.',
    },
  }

  useEffect(() => {
    const savedLanguage = localStorage.getItem('language')

    if (savedLanguage === 'en' || savedLanguage === 'rus') {
      setLanguage(savedLanguage)
    }
  }, [])

  const handlePublish = async () => {
    if (isPublishing || !canPublish) {
      return
    }

    await onPublish()
  }

  return (
    <div className={styles.wrapper}>
      <Header
        onPrev={onPrev}
        onNext={handlePublish}
        title={'Publication'}
        disabledNext={!isDescriptionValid || !canPublish || isPublishing}
        nextStepTitle={isPublishing ? 'Publishing...' : 'Publish'}
      />

      {progressUiState !== 'idle' && !isPublishing && (
        <div
          className={`${styles.uploadProgress} ${
            progressUiState === 'success'
              ? styles.uploadProgressSuccess
              : styles.uploadProgressUploading
          }`}
        >
          <div className={styles.uploadProgressBar} />
          {progressUiState === 'uploading' && (
            <Typography variant={'small_text'} className={styles.uploadProgressText}>
              {uploadStatusText}
            </Typography>
          )}
        </div>
      )}

      {uploadError && (
        <div className={styles.uploadError}>
          <Typography variant={'small_text'} className={styles.uploadErrorText}>
            ⚠️ Upload failed: {uploadError}
          </Typography>
          {uploadErrorActionHint && (
            <Typography variant={'small_text'} className={styles.uploadErrorHint}>
              {uploadActionHintByLanguage[language][uploadErrorActionHint]}
            </Typography>
          )}
        </div>
      )}

      <div className={styles.carouselContainer}>
        <div className={styles.photoPreview}>
          <Carousel slides={files.map(f => f.preview)} filtersState={filtersState} />
        </div>

        <div className={styles.form}>
          <div className={styles.formContainer}>
            <div className={styles.user}>
              <Avatar size={36} alt={userName} image={avatarUrl || ''} />
              <Typography variant={'h1'}>{userName}</Typography>
            </div>
            <TextArea
              className={styles.description}
              label={'Add publication descriptions'}
              value={description}
              onChange={e => setDescription(e.target.value)}
              maxLength={500}
              placeholder={'Write a description...'}
            />
            <Typography variant={'small_text'} className={styles.counter}>
              {description.length}/500
            </Typography>
          </div>
          <Separator />
          <div className={styles.locationContainer}>
            <Input
              className={styles.locationInput}
              id={'1'}
              label={'Add location'}
              placeholder={'Add location wit Icon'}
              disabled
            />
            <div className={styles.locationInfo}>
              <Typography className={styles.cityName} variant={'regular_16'}>
                New York
              </Typography>
              <Typography className={styles.location} variant={'small_text'}>
                Washington Square Park
              </Typography>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
