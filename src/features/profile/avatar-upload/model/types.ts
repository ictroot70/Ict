import { StaticImageData } from 'next/image'

export type Step = 'upload' | 'crop'

export interface AvatarUploadProps {
  value?: string | StaticImageData
  onUpload: (file: File) => Promise<void>
  onDelete: () => Promise<void>
  isLoading?: boolean
}

export interface State {
  step: Step
  file: File | null
  previewUrl: string | null
  croppedPreview: string | null
  zoom: number
  error: string | null
  isModalOpen: boolean
  isDeleteModalOpen: boolean
  isSubmitting: boolean
}

export type Action =
  | { type: 'OPEN_MODAL' }
  | { type: 'OPEN_DELETE_MODAL' }
  | { type: 'CLOSE_DELETE_MODAL' }
  | { type: 'CONFIRM_DELETE' }
  | { type: 'RESET' }
  | { type: 'SET_FILE'; file: File; previewUrl: string }
  | { type: 'SET_ZOOM'; value: number }
  | { type: 'SET_CROPPED_PREVIEW'; value: string | null }
  | { type: 'SET_ERROR'; value: string | null }
  | { type: 'CLEAR_ERROR' }
  | { type: 'SUBMIT_START' }
  | { type: 'SUBMIT_SUCCESS' }
  | { type: 'SUBMIT_ERROR'; error: string }
