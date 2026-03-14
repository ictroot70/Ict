'use client'
import React from 'react'

import { Carousel } from '@/shared/composites'
import { IMAGE_LOADING_STRATEGY, IMAGE_SIZES } from '@/shared/constant'
import { PostModalData } from '@/shared/types'
import { SafeImage } from '@/shared/ui'

import s from '../EditMode.module.scss'

interface EditImageSectionProps {
  postData: PostModalData
}
const DEFAULT_IMAGE = '/default-image.svg'

export const EditModeImageSection: React.FC<EditImageSectionProps> = ({ postData }) => {
  const { images } = postData

  let content = null

  if (images.length > 1) {
    content = (
      <Carousel
        slides={images}
        options={{ align: 'center', loop: false }}
        imageSizes={IMAGE_SIZES.POST_MODAL}
      />
    )
  } else if (images.length === 1) {
    content = (
      <SafeImage
        {...IMAGE_LOADING_STRATEGY.default}
        src={images[0].url}
        fallbackSrc={DEFAULT_IMAGE}
        alt={'Post image'}
        fill
        sizes={IMAGE_SIZES.POST_MODAL}
        telemetryLabel={'EditModeImageSection'}
        className={s.editImage}
      />
    )
  }

  return <div className={s.editImageContainer}>{content}</div>
}
