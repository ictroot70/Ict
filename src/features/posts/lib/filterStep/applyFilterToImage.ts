import { FilterName, FILTER_CONFIGS } from '../constants/filter-configs'

interface ApplyFilterOptions {
  maxDimension?: number
  quality?: number
}

export async function applyFilterToImage(
  imageUrl: string,
  filter: FilterName,
  options: ApplyFilterOptions = {}
): Promise<Blob> {
  const { maxDimension = 1440, quality = 0.75 } = options

  const img = await loadImage(imageUrl)

  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')

  if (!ctx) {
    throw new Error('Failed to get canvas context')
  }

  const { width, height } = calculateResizedDimensions(img.width, img.height, maxDimension)

  console.log(`🖼️ Resizing image: ${img.width}x${img.height} → ${width}x${height}`)

  canvas.width = width
  canvas.height = height

  ctx.filter = FILTER_CONFIGS[filter]

  ctx.imageSmoothingEnabled = true
  ctx.imageSmoothingQuality = 'high'

  ctx.drawImage(img, 0, 0, width, height)

  const blob = await canvasToBlob(canvas, quality)

  console.log(`📦 Blob created: ${(blob.size / 1024).toFixed(0)}KB (quality: ${quality})`)

  return blob
}

function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()

    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error(`Failed to load image from ${url}`))
    img.src = url
  })
}

function calculateResizedDimensions(
  width: number,
  height: number,
  maxDimension: number
): { width: number; height: number } {
  if (width <= maxDimension && height <= maxDimension) {
    return { width, height }
  }

  const aspectRatio = width / height

  if (width > height) {
    return {
      width: maxDimension,
      height: Math.round(maxDimension / aspectRatio),
    }
  } else {
    return {
      width: Math.round(maxDimension * aspectRatio),
      height: maxDimension,
    }
  }
}

function canvasToBlob(canvas: HTMLCanvasElement, quality: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      blob => {
        if (blob) {
          resolve(blob)
        } else {
          reject(new Error('Failed to create blob from canvas'))
        }
      },
      'image/jpeg',
      quality
    )
  })
}
