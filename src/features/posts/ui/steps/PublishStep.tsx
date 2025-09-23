'use client'
import React from 'react'
import styles from './PublishStep.module.scss'
import { UploadedFile, Post } from '../../model/types'
import { ToastAlert } from '@/shared/composites'
import { toast } from 'react-toastify/unstyled'
import EmblaCarousel from '@/entities/posts/ui/EmblaCarousel'

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
  handleUpload,
  createPost,
  userId,
  onClose,
  onPublishPost,
  uploadedImage,
  isUploading,
}) => {
  const handlePublish = async () => {
    if (uploadedImage.length === 0) return

    const newPost = await createPost({
      userId,
      body: {
        description,
        childrenMetadata: uploadedImage.map((img: any) => ({
          uploadId: img.uploadId,
        })),
      },
    })

    onPublishPost(newPost)
    toast(<ToastAlert type="success" message="✅ Post created!" />)
    onClose()
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.header}>
        <button onClick={onPrev} className={styles.navBtn}>
          ←
        </button>
        <span className={styles.title}>New Post</span>
        <button
          onClick={handlePublish}
          className={styles.publishBtn}
          disabled={description.length > 500 || isUploading}
        >
         Publish
        </button>
      </div>

      <div className={styles.photoPreview}>
        <EmblaCarousel photos={files.map(f => f.preview)} filtersState={filtersState} />
      </div>

      <div className={styles.form}>
        <textarea
          value={description}
          onChange={e => setDescription(e.target.value)}
          maxLength={500}
          placeholder="Write a description..."
        />
        <div className={styles.counter}>{description.length}/500</div>
      </div>
    </div>
  )
}
