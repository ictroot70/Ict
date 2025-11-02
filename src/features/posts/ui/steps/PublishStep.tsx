'use client'
import React, { useState } from 'react'
import styles from './PublishStep.module.scss'
import { UploadedFile } from '../../model/types'
import { Avatar, ToastAlert } from '@/shared/composites'
import { toast } from 'react-toastify/unstyled'
import { Input, Separator, TextArea, Typography } from '@/shared/ui'
import EmblaCarousel from '@/entities/posts/ui/EmblaCarousel'
import { Header } from '@/features/posts/ui/Header/header'

interface Props {
  onPrev: () => void
  files: UploadedFile[]
  filtersState: Record<number, string>
  description: string
  setDescription: (v: string) => void
  handleUpload: (file: File | Blob) => Promise<any>
  createPost: (args: any) => Promise<any>
  userId: number
  onClose: () => void
  uploadedImage: { uploadId: string; url: string }[]
  onPublishPost: (post: any) => void
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
      onClose()
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
      <div style={{ display: 'flex', width: 'max-content' }}>
        <div className={styles.photoPreview}>
          <EmblaCarousel photos={files.map(f => f.preview)} filtersState={filtersState} />
        </div>

        <div className={styles.form}>
          <div style={{ padding: '24px' }}>
            <div
              style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}
              className={styles.user}
            >
              <Avatar size={36} alt={''} image={''} />
              <Typography variant="h1">user name</Typography>
            </div>
            <TextArea
              className={styles.description}
              style={{ width: '433px', height: '120px', color: '#fff' }}
              id="description"
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
          <div style={{ padding: '24px' }}>
            <Input
              className={styles.locationInput}
              id={'1'}
              label={'Add location'}
              placeholder={'Add location wit Icon'}
              disabled
            />
            <div style={{ padding: '6px' }}>
              <Typography className={styles.cityName} variant={'regular_16'}>
                New York
              </Typography>
              <Typography
                style={{ color: '#8D9094' }}
                className={styles.location}
                variant={'small_text'}
              >
                Washington Square Park
              </Typography>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
