import { UploadedImageViewModel, PostImageViewModel } from '@/shared/types'

export const BACKGROUND_UPLOAD_CHUNK_SIZE = 5

export function dedupeImagesByUploadId(images: PostImageViewModel[]): PostImageViewModel[] {
  const seen = new Set<string>()

  return images.filter(image => {
    if (seen.has(image.uploadId)) {
      return false
    }
    seen.add(image.uploadId)

    return true
  })
}

export function getErrorStatus(error: unknown): number | null {
  if (typeof error !== 'object' || error === null || !('status' in error)) {
    return null
  }

  const status = (error as { status?: unknown }).status

  return typeof status === 'number' ? status : null
}

export function chunkBlobs(blobs: Blob[], chunkSize: number): Blob[][] {
  const chunks: Blob[][] = []

  for (let idx = 0; idx < blobs.length; idx += chunkSize) {
    chunks.push(blobs.slice(idx, idx + chunkSize))
  }

  return chunks
}

export async function uploadWithRetry(
  blobs: Blob[],
  handleUpload: (files: Array<File | Blob>) => Promise<UploadedImageViewModel | undefined>,
  maxRetries: number = 1
): Promise<UploadedImageViewModel | undefined> {
  let lastError: unknown

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      if (attempt > 0) {
        console.log(`🔄 Retry attempt ${attempt}/${maxRetries} (token refresh)...`)
        await new Promise(resolve => setTimeout(resolve, 300))
      }

      const result = await handleUpload(blobs)

      return result
    } catch (error: unknown) {
      lastError = error

      if (
        typeof error === 'object' &&
        error !== null &&
        'status' in error &&
        (error as { status?: unknown }).status === 401 &&
        attempt < maxRetries
      ) {
        console.log('⚠️ Token expired, will retry after refresh...')
        continue
      }

      throw error
    }
  }

  throw lastError
}
