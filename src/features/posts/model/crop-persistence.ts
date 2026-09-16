import type { Dispatch, SetStateAction } from 'react'

import { fileToBase64 } from '@/features/posts/utils/fileToBase64'

import { UploadedFile } from './types'

type SaveCropArgs = {
  canvas: HTMLCanvasElement
  currentIndex: number
  setFiles: Dispatch<SetStateAction<UploadedFile[]>>
}

type RestoreAspectArgs = {
  currentFile: UploadedFile
  currentIndex: number
  aspect: number
  setFiles: Dispatch<SetStateAction<UploadedFile[]>>
}

export const saveCroppedFile = async ({
  canvas,
  currentIndex,
  setFiles,
}: SaveCropArgs): Promise<void> => {
  const croppedImage = canvas.toDataURL('image/jpeg')
  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      nextBlob => (nextBlob ? resolve(nextBlob) : reject(new Error('Blob failed'))),
      'image/jpeg',
      0.95
    )
  })

  setFiles(prev =>
    prev.map((file, idx) =>
      idx === currentIndex ? { ...file, preview: croppedImage, previewBlob: blob } : file
    )
  )
}

export const restorePreviewForAspectChange = async ({
  currentFile,
  currentIndex,
  aspect,
  setFiles,
}: RestoreAspectArgs): Promise<void> => {
  const base64ToRestore =
    !currentFile.original || !currentFile.original.startsWith('data:image')
      ? await fileToBase64(currentFile.file)
      : currentFile.original

  if (!base64ToRestore) {
    return
  }

  setFiles(prev =>
    prev.map((file, idx) =>
      idx === currentIndex
        ? { ...file, preview: base64ToRestore, crop: undefined, zoom: 1, aspect }
        : file
    )
  )
}
