'use client'
import React from 'react'

import { Carousel } from '@/shared/composites'
import { PostModalData } from '@/shared/types'
import Image from 'next/image'

import s from '../EditMode.module.scss'

interface EditImageSectionProps {
  postData: PostModalData
}

export const EditModeImageSection: React.FC<EditImageSectionProps> = ({ postData }) => {
  const { images } = postData

  let content = null

  if (images.length > 1) {
    content = <Carousel slides={images} options={{ align: 'center', loop: false }} />
  } else if (images.length === 1) {
    content = <Image src={images[0].url} alt={'Post image'} fill className={s.editImage} />
  }

  return <div className={s.editImageContainer}>{content}</div>
}
