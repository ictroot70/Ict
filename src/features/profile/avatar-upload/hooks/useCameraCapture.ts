import { useCallback, useEffect, useRef, useState } from 'react'

import { isCameraTechnicallyAvailable } from '../lib/cameraCapture'

interface UseCameraCaptureOptions {
  isOpen: boolean
  onError?: (error: string) => void
}

export type FacingMode = 'user' | 'environment'

function getErrorMessage(err: unknown, defaultMessage: string): string {
  return err instanceof Error ? err.message : defaultMessage
}

/**
 * Custom hook for managing camera capture functionality.
 * Handles camera stream initialization, cleanup, switching between front/back cameras,
 * and photo capture with proper error handling and race condition prevention.
 *
 * @param {UseCameraCaptureOptions} options - Configuration options
 * @param {boolean} options.isOpen - Whether the camera should be active
 * @param {Function} [options.onError] - Optional callback for error handling
 *
 * @example
 * const { videoRef, capturePhoto, switchCamera, error } = useCameraCapture({
 *   isOpen: true,
 *   onError: (err) => console.error(err)
 * })
 */

export function useCameraCapture({ isOpen, onError }: UseCameraCaptureOptions) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)

  const requestIdRef = useRef(0)

  const [error, setError] = useState<string | null>(null)
  const [isCapturing, setIsCapturing] = useState(false)
  const [facingMode, setFacingMode] = useState<FacingMode>('user')

  const cleanupStream = useCallback(() => {
    const stream = streamRef.current

    streamRef.current = null

    if (videoRef.current) {
      try {
        videoRef.current.srcObject = null
        videoRef.current.pause()
      } catch (e) {
        console.error('Failed to pause video:', e)
      }
    }

    if (stream) {
      try {
        stream.getTracks().forEach(track => {
          track.stop()
        })
      } catch (e) {
        console.error('Failed to stop stream tracks:', e)
      }
    }
  }, [])

  const startCamera = useCallback(
    async (mode: FacingMode): Promise<boolean> => {
      if (!isCameraTechnicallyAvailable()) {
        const errorMsg = 'Camera is not available on this device'

        setError(errorMsg)
        onError?.(errorMsg)

        return false
      }

      if (!videoRef.current) {
        return false
      }

      if (streamRef.current) {
        cleanupStream()
      }

      requestIdRef.current += 1
      const currentRequestId = requestIdRef.current

      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: mode },
        })

        if (currentRequestId !== requestIdRef.current || !videoRef.current) {
          stream.getTracks().forEach(track => track.stop())

          return false
        }

        streamRef.current = stream
        videoRef.current.srcObject = stream
        setError(null)

        return true
      } catch (err) {
        const errorMessage = getErrorMessage(
          err,
          'Failed to access camera. Please check your permissions.'
        )

        setError(errorMessage)
        onError?.(errorMessage)

        return false
      }
    },
    [onError, cleanupStream]
  )

  const switchCamera = useCallback(async () => {
    const nextMode: FacingMode = facingMode === 'user' ? 'environment' : 'user'

    cleanupStream()

    const success = await startCamera(nextMode)

    if (success) {
      setFacingMode(nextMode)
    } else {
      await startCamera(facingMode)
    }
  }, [facingMode, startCamera, cleanupStream])

  const capturePhoto = useCallback(async (): Promise<File | null> => {
    if (!videoRef.current || !streamRef.current) {
      throw new Error('Camera is not ready')
    }

    if (isCapturing) {
      throw new Error('Capture already in progress')
    }

    setIsCapturing(true)

    try {
      const video = videoRef.current
      const canvas = document.createElement('canvas')

      canvas.width = video.videoWidth
      canvas.height = video.videoHeight

      const ctx = canvas.getContext('2d')

      if (!ctx) {
        throw new Error('Failed to get canvas context')
      }

      ctx.drawImage(video, 0, 0)

      cleanupStream()

      const blob = await new Promise<Blob | null>((resolve, reject) => {
        canvas.toBlob(
          blob => {
            if (!blob) {
              reject(new Error('Failed to create blob from canvas'))

              return
            }
            resolve(blob)
          },
          'image/jpeg',
          0.9
        )
      })

      if (!blob) {
        throw new Error('Failed to create image from camera')
      }

      const file = new File([blob], `camera-photo-${Date.now()}.jpg`, {
        type: 'image/jpeg',
      })

      return file
    } catch (err) {
      const errorMessage = getErrorMessage(err, 'Failed to capture photo')

      setError(errorMessage)
      cleanupStream()
      throw err
    } finally {
      setIsCapturing(false)
    }
  }, [isCapturing, cleanupStream])

  useEffect(() => {
    if (!isOpen) {
      cleanupStream()

      return
    }

    void startCamera(facingMode)

    return () => {
      cleanupStream()
    }
  }, [isOpen, facingMode, startCamera, cleanupStream])

  useEffect(() => {
    if (!isOpen) {
      return
    }

    const handleVisibilityChange = () => {
      if (document.hidden) {
        cleanupStream()
      }
    }

    const handleBlur = () => {
      cleanupStream()
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    window.addEventListener('blur', handleBlur)

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('blur', handleBlur)
    }
  }, [isOpen, cleanupStream])

  return {
    videoRef,
    error,
    isCapturing,
    facingMode,
    startCamera,
    switchCamera,
    capturePhoto,
    stopCamera: cleanupStream,
  }
}
