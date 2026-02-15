export type Step = 'upload' | 'crop' | 'filter' | 'publish'

export interface UploadedFile {
  file: File
  blob?: Blob
  original: string
  preview: string
  id: string
  isModified: boolean
  uploadId?: string
  crop?: { x: number; y: number }
  zoom?: number
  aspect?: number
  filter?: string
}

export interface Post {
  id: string
  photos: string[]
  description: string
  createdAt: string
  filter?: string
}
