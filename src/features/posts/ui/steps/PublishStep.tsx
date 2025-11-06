'use client'
import React, { useState } from 'react'
import styles from './PublishStep.module.scss'
import { UploadedFile } from '../../model/types'
import { Avatar, ToastAlert } from '@/shared/composites'
import { toast } from 'react-toastify/unstyled'
import { Input, Separator, TextArea, Typography } from '@/shared/ui'
import { Header } from '@/features/posts/ui/Header/header'
import { useGetMyProfileQuery } from '@/entities/profile'
import { PostViewModel } from '@/shared/types'
import { PostImageViewModel } from '@/entities/posts/api/posts.types'
import EmblaCarousel from '@/entities/posts/ui/EmblaCarousel/EmblaCarousel'
import { SeparatorBlc } from '@/features/posts/ui/Seporator/Separator'

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
  // uploadedImage: { uploadId: string; url: string }[]
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
        title="New Post"
        disabledNext={
          description.length === 0 || description.length > 500 || isUploading || isPublishing
        }
        nextStepTitle="Publish"
      />
      <div className={styles.carouselContainer}>
        <div className={styles.photoPreview}>
          <EmblaCarousel photos={files.map(f => f.preview)} filtersState={filtersState} />
        </div>
        <SeparatorBlc />
        <SeparatorBlc />

        <div className={styles.form}>
          <div className={styles.formContainer}>
            <div className={styles.user}>
              <Avatar size={36} alt={userName} image={avatarUrl || ''} />
              <Typography variant="h1">{userName}</Typography>
            </div>
            <TextArea
              className={styles.description}
              style={{ width: '433px', height: '120px', color: '#fff' }} // TODO: Delete when class triggers
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
