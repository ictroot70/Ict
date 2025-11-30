/* eslint-disable no-console */
import imageCompression from 'browser-image-compression'

export async function compressImage(file: File | Blob): Promise<File> {
  const isFile = file instanceof File
  const originalFile = isFile ? file : new File([file], 'image.jpg', { type: 'image/jpeg' })

  const sizeMB = originalFile.size / 1024 / 1024

  if (sizeMB <= 10) {
    return originalFile
  }

  const options = {
    maxSizeMB: 4.8,
    maxWidthOrHeight: 4000,
    useWebWorker: true,
    fileType: originalFile.type === 'image/png' ? 'image/png' : 'image/jpeg',
    initialQuality: 0.85,
  }

  try {
    const compressedFile = await imageCompression(originalFile, options)

    console.log(
      `[compressImage] compressed from ${(originalFile.size / 1024 / 1024).toFixed(
        2
      )}MB to ${(compressedFile.size / 1024 / 1024).toFixed(2)}MB`
    )

    return compressedFile
  } catch (err) {
    console.error('[compressImage] failed:', err)

    return originalFile
  }
}
