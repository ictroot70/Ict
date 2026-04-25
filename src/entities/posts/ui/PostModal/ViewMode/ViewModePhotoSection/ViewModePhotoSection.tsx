'use client'

import React from 'react'

import { Carousel } from '@/shared/composites'
import { IMAGE_LOADING_STRATEGY, IMAGE_SIZES } from '@/shared/constant'
import { PostModalData } from '@/shared/types'
import Image from 'next/image'

import s from '../ViewMode.module.scss'

interface PhotoSectionProps {
  postData: PostModalData
}

export const ViewModePhotoSection: React.FC<PhotoSectionProps> = ({ postData }) => {
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
      <Image
        {...IMAGE_LOADING_STRATEGY.default}
        src={images[0].url}
        alt={'Post image'}
        fill
        sizes={IMAGE_SIZES.POST_MODAL}
        className={s.image}
      />
    )
  }

  return <div className={s.photoContainer}>{content}</div>
}
