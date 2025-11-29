'use client'
import { useGetMyProfileQuery } from '@/entities/profile'
import { Header } from '@/features/posts/ui/Header/header'
import { Avatar, Carousel, ToastAlert } from '@/shared/composites'
import { PostImageViewModel, PostViewModel } from '@/shared/types'
import { Input, Separator, TextArea, Typography } from '@/shared/ui'
import React, { useState } from 'react'
import { toast } from 'react-toastify/unstyled'
import { UploadedFile } from '../../model/types'
import styles from './PublishStep.module.scss'

interface Props {
  onPrev: () => void
  files: UploadedFile[]
  filtersState: Record<number, string>
  description: string
  setDescription: (v: string) => void
  handleUpload: (file: File | Blob) => Promise<any>
  createPost: (args: any) => Promise<any>
  userId: number
  onClose: (post: PostViewModel) => void
  uploadedImage: PostImageViewModel[]
  onPublishPost: (post: PostViewModel) => void
  isUploading: boolean
}

export const PublishStep: React.FC<Props> = ({
  onPrev,
  files,
  filtersState,
  description,
  setDescription,
  createPost,
  userId,
  onClose,
  onPublishPost,
  uploadedImage,
  isUploading,
}) => {
  const { data } = useGetMyProfileQuery()
  const userName = data?.userName
  const avatarUrl = data?.avatars[0]?.url
  const [isPublishing, setIsPublishing] = useState(false)

  const handlePublish = async () => {
    if (isPublishing || uploadedImage.length === 0) return

    setIsPublishing(true)
    try {
      const newPost = await createPost({
        userId,
        body: {
          description,
          childrenMetadata: uploadedImage.map(img => ({ uploadId: img.uploadId })),
        },
      })

      onPublishPost(newPost)
      toast(<ToastAlert type="success" message="✅ Post created!" />)
      onClose(newPost)
    } catch (err) {
      toast(<ToastAlert type="error" message="❌ Failed to create post" />)
    } finally {
      setIsPublishing(false)
    }
  }

  return (
    <div className={styles.wrapper}>
      <Header
        onPrev={onPrev}
        onNext={handlePublish}
        title="Publication"
        disabledNext={
          description.length === 0 || description.length > 500 || isUploading || isPublishing
        }
        nextStepTitle="Publish"
      />
      <div className={styles.carouselContainer}>
        <div className={styles.photoPreview}>
          <Carousel slides={files.map(f => f.preview)} filtersState={filtersState} />
        </div>

        <div className={styles.form}>
          <div className={styles.formContainer}>
            <div className={styles.user}>
              <Avatar size={36} alt={userName} image={avatarUrl || ''} />
              <Typography variant="h1">{userName}</Typography>
            </div>
            <TextArea
              className={styles.description}
              label="Add publication descriptions"
              value={description}
              onChange={e => setDescription(e.target.value)}
              maxLength={500}
              placeholder="Write a description..."
            />
            <Typography variant="small_text" className={styles.counter}>
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
