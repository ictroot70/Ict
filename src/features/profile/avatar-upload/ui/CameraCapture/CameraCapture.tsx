'use client'

import { useCallback } from 'react'

import { Button, Typography } from '@/shared/ui'
import Image from 'next/image'

import s from './CameraCapture.module.scss'

import { useCameraCapture } from '../../hooks/useCameraCapture'
import { isCameraTechnicallyAvailable, canSwitchCamera } from '../../lib/cameraCapture'

interface CameraCaptureProps {
  className?: string
  onCapture: (file: File) => void
  onClose: () => void
  isOpen?: boolean
}

export function CameraCapture({ onCapture, onClose, isOpen = true }: Readonly<CameraCaptureProps>) {
  const { videoRef, error, isCapturing, stopCamera, capturePhoto, switchCamera } = useCameraCapture(
    { isOpen }
  )

  const handleCapture = useCallback(async () => {
    try {
      const file = await capturePhoto()

      if (file) {
        onCapture(file)
      }
    } catch (err) {
      console.error('Failed to capture photo:', err)
    }
  }, [capturePhoto, onCapture])

  const handleClose = useCallback(() => {
    stopCamera()
    onClose()
  }, [onClose, stopCamera])

  if (!isCameraTechnicallyAvailable()) {
    return (
      <div className={s.container}>
        <Typography variant={'danger'} className={s.error}>
          Camera is not available on this device
        </Typography>
        <Button variant={'outlined'} onClick={handleClose}>
          Close
        </Button>
      </div>
    )
  }

  return (
    <div className={s.container}>
      <div className={s.videoWrapper}>
        <video ref={videoRef} autoPlay playsInline muted className={s.video} />
        {error && <p className={s.error}>{error}</p>}
      </div>

      <div className={s.controls}>
        <Button variant={'outlined'} onClick={handleClose} disabled={isCapturing}>
          Cancel
        </Button>
        {canSwitchCamera() && (
          <Button
            className={s.switchCameraBtn}
            variant={'text'}
            onClick={switchCamera}
            disabled={isCapturing}
          >
            <Image
              src={'/icons/svg/RepeatOutlined.svg'}
              alt={'Switch camera'}
              width={24}
              height={24}
            />
          </Button>
        )}
        <Button variant={'primary'} onClick={handleCapture} disabled={!!error || isCapturing}>
          {getSaveBtnText(isCapturing)}
        </Button>
      </div>
    </div>
  )
}
function getSaveBtnText(isCapturing?: boolean) {
  if (isCapturing) {
    return 'Capturing...'
  }

  return 'Take Photo'
}
