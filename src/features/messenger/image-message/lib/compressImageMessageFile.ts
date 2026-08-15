import { MAX_IMAGE_MESSAGE_SIZE } from './validateImageMessageFile'

const MAX_IMAGE_DIMENSION = 1280
const INITIAL_QUALITY = 0.9
const MIN_QUALITY = 0.6
const QUALITY_STEP = 0.1
const OUTPUT_TYPE = 'image/jpeg'

const getCompressedFileName = (fileName: string) => fileName.replace(/\.[^/.]+$/, '.jpg')

const isWithinDimensionLimit = (width: number, height: number) =>
  Math.max(width, height) <= MAX_IMAGE_DIMENSION

const getScaledSize = (width: number, height: number) => {
  const largestSide = Math.max(width, height)

  if (isWithinDimensionLimit(width, height)) {
    return { width, height }
  }

  const scale = MAX_IMAGE_DIMENSION / largestSide

  return {
    width: Math.round(width * scale),
    height: Math.round(height * scale),
  }
}

const canvasToBlob = (canvas: HTMLCanvasElement, quality: number) =>
  new Promise<Blob | null>(resolve => {
    canvas.toBlob(resolve, OUTPUT_TYPE, quality)
  })

export async function compressImageMessageFile(file: File): Promise<File | null> {
  const bitmap = await createImageBitmap(file)

  if (file.size <= MAX_IMAGE_MESSAGE_SIZE && isWithinDimensionLimit(bitmap.width, bitmap.height)) {
    bitmap.close()

    return file
  }

  const { width, height } = getScaledSize(bitmap.width, bitmap.height)

  const canvas = document.createElement('canvas')

  canvas.width = width
  canvas.height = height

  const context = canvas.getContext('2d')

  if (!context) {
    bitmap.close()

    return null
  }

  context.fillStyle = '#fff'
  context.fillRect(0, 0, width, height)
  context.drawImage(bitmap, 0, 0, width, height)
  bitmap.close()

  for (let quality = INITIAL_QUALITY; quality >= MIN_QUALITY; quality -= QUALITY_STEP) {
    const blob = await canvasToBlob(canvas, quality)

    if (!blob) {
      continue
    }

    if (blob.size <= MAX_IMAGE_MESSAGE_SIZE) {
      return new File([blob], getCompressedFileName(file.name), {
        type: OUTPUT_TYPE,
        lastModified: Date.now(),
      })
    }
  }

  return null
}
