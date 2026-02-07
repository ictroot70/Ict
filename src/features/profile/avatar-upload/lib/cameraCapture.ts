function getErrorMessage(err: unknown, defaultMessage: string): string {
  return err instanceof Error ? err.message : defaultMessage
}

const CAMERA_WARMUP_DELAY_MS = 300

export function isMobileDevice(): boolean {
  if (typeof window === 'undefined') {
    return false
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const uaDataMobile = (navigator as any).userAgentData?.mobile

  if (typeof uaDataMobile === 'boolean') {
    return uaDataMobile
  }

  const userAgent = navigator.userAgent
  const mobileRegex = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i

  return mobileRegex.test(userAgent)
}

/**
 * Checks if camera API is technically available in the browser
 */
export function isCameraTechnicallyAvailable(): boolean {
  return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia)
}

export function shouldShowCameraButton(allowDesktop?: boolean): boolean {
  return isCameraTechnicallyAvailable()
}

export function canSwitchCamera(): boolean {
  return isMobileDevice() && isCameraTechnicallyAvailable()
}

export async function capturePhotoFromCamera(): Promise<File> {
  if (!isCameraTechnicallyAvailable()) {
    throw new Error('Camera access is not supported in this browser')
  }

  const stream = await navigator.mediaDevices.getUserMedia({
    video: { facingMode: 'user' },
  })

  try {
    const video = document.createElement('video')

    video.srcObject = stream
    video.autoplay = true
    video.playsInline = true

    await new Promise<void>((resolve, reject) => {
      video.onloadedmetadata = () => {
        video
          .play()
          .then(() => resolve())
          .catch(reject)
      }
    })

    await new Promise<void>(resolve => {
      setTimeout(resolve, CAMERA_WARMUP_DELAY_MS)
    })

    const canvas = document.createElement('canvas')

    canvas.width = video.videoWidth
    canvas.height = video.videoHeight

    const ctx = canvas.getContext('2d')

    if (!ctx) {
      stream.getTracks().forEach(track => track.stop())
      throw new Error('Failed to get canvas context')
    }

    ctx.drawImage(video, 0, 0)

    stream.getTracks().forEach(track => track.stop())

    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        blob => {
          if (blob) {
            resolve(blob)
          } else {
            reject(new Error('Failed to create image from camera'))
          }
        },
        'image/jpeg',
        0.9
      )
    })

    return new File([blob], `camera-photo-${Date.now()}.jpg`, {
      type: 'image/jpeg',
    })
  } catch (err) {
    stream.getTracks().forEach(track => track.stop())

    const errorMessage = getErrorMessage(err, 'Failed to capture photo from camera')

    throw new Error(errorMessage)
  }
}
