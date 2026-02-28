'use client'

import React from 'react'
import { CircleStencil, Cropper, CropperRef, ImageRestriction } from 'react-advanced-cropper'

import { Button } from '@/shared/ui'

import s from './CropStep.module.scss'

interface CropStepProps {
  previewUrl: string
  croppedPreview: string | null
  zoom: number
  cropperRef: React.RefObject<CropperRef>
  onZoomChange: (value: number) => void
  onCropUpdate: () => void
  onConfirm: () => void
  isLoading?: boolean
}

export function CropStep({
  previewUrl,
  croppedPreview,
  zoom,
  cropperRef,
  onZoomChange,
  onCropUpdate,
  onConfirm,
  isLoading,
}: Readonly<CropStepProps>) {
  return (
    <div className={s.cropStep}>
      <div className={s.cropContainer}>
        <div className={s.cropperWrapper}>
          <Cropper
            className={s.cropper}
            ref={cropperRef}
            src={previewUrl}
            stencilComponent={CircleStencil}
            imageRestriction={ImageRestriction.stencil}
            onUpdate={onCropUpdate}
            stencilProps={{
              movable: true,
              resizable: false,
              handlers: false,
            }}
          />
        </div>

        {croppedPreview && (
          <img src={croppedPreview} alt={'Cropped preview'} className={s.cropPreview} />
        )}
      </div>

      <div className={s.zoomControl}>
        <label htmlFor={'zoom-slider'}>{'Zoom:'}</label>
        <input
          id={'zoom-slider'}
          type={'range'}
          className={s.zoomSlider}
          min={1}
          max={3}
          step={0.01}
          value={zoom}
          onChange={e => onZoomChange(Number(e.target.value))}
        />
        <span>{zoom.toFixed(2)}x</span>
      </div>

      <div className={s.cropActions}>
        <Button onClick={onConfirm} disabled={isLoading}>
          {getSaveBtnText(isLoading)}
        </Button>
      </div>
    </div>
  )
}
function getSaveBtnText(isLoading?: boolean) {
  if (isLoading) {
    return 'Saving...'
  }

  return 'Save'
}
