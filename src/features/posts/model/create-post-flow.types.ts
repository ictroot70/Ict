import type { Dispatch, SetStateAction } from 'react'

import { FilterName } from '@/features/posts/lib/constants/filter-configs'
import { Step, UploadedFile } from '@/features/posts/model/types'
import { PostImageViewModel, PostViewModel } from '@/shared/types'

export type UploadProgress = {
  current: number
  total: number
}

export type UploadStage = 'idle' | 'uploading_to_server' | 'processing_on_server'
export type UploadErrorActionHint = 'retry' | 'back' | 'auth'

export type CreatePostFlowActions = {
  onFilterDone: () => Promise<void>
  onModalCloseRequest: () => void
  onConfirmClose: () => void
  onCancelClose: () => void
  onPublish: () => Promise<void>
  onBackFromPublish: () => Promise<void>
}

export type CreatePostFlowState = {
  step: Step
  setStep: (step: Step) => void
  files: UploadedFile[]
  setFiles: Dispatch<SetStateAction<UploadedFile[]>>
  filtersState: Record<number, FilterName>
  setFiltersState: Dispatch<SetStateAction<Record<number, FilterName>>>
  description: string
  setDescription: (description: string) => void
  showConfirmModal: boolean
  isFilterProcessing: boolean
  isUploading: boolean
  uploadStage: UploadStage
  uploadErrorActionHint: UploadErrorActionHint | null
  uploadError: null | string
  uploadProgress: UploadProgress
  uploadedImages: PostImageViewModel[]
  canPublish: boolean
  isPublishing: boolean
  actions: CreatePostFlowActions
}

export type UseCreatePostFlowArgs = {
  onCloseAction: () => void
  onPublishPostAction: (post: PostViewModel) => void
}
