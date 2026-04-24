'use client'

import React from 'react'

import { Carousel } from '@/shared/composites'
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
    content = <Carousel slides={images} options={{ align: 'center', loop: false }} />
  } else if (images.length === 1) {
    content = (
      <Image
        src={images[0].url}
        alt={'Post image'}
        fill
        sizes={'(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'}
        className={s.image}
      />
    )
  }

  return <div className={s.photoContainer}>{content}</div>
}
