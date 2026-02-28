import { CreatePostInputDto } from '@/entities/posts/api/posts.types'
import { Step } from '@/features/posts/model/types'

type UploadImageRef = {
  uploadId: string
}

export const isDraftDirty = (step: Step, filesCount: number): boolean => {
  return step !== 'upload' || filesCount > 0
}

export const buildUploadFormData = (files: Array<Blob | File>): FormData => {
  const formData = new FormData()

  files.forEach(file => {
    const normalizedFile =
      file instanceof File
        ? file
        : new File([file], 'image.jpg', { type: file.type || 'image/jpeg' })

    formData.append('file', normalizedFile)
  })

  return formData
}

export const buildCreatePostBody = (
  description: string,
  uploadedImages: UploadImageRef[]
): CreatePostInputDto => {
  const normalizedDescription = description.trim()
  const uniqueUploadIds = Array.from(new Set(uploadedImages.map(img => img.uploadId)))

  return {
    description: normalizedDescription || undefined,
    childrenMetadata: uniqueUploadIds.map(uploadId => ({ uploadId })),
  }
}

export const extractErrorMessage = (error: unknown): string => {
  if (error instanceof Error && error.message) {
    return error.message
  }

  if (typeof error === 'object' && error !== null && 'message' in error) {
    const maybeMessage = (error as { message?: unknown }).message

    if (typeof maybeMessage === 'string' && maybeMessage.trim()) {
      return maybeMessage
    }
  }

  return 'Upload failed'
}
